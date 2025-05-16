// internal/handlers/pdf/protect.go
package pdf

import (
	"fmt"
	"io"
	"net/http"
	"os"
	"path/filepath"

	"megapdf-api/internal/middleware"
	"megapdf-api/internal/services/pdf"
	"megapdf-api/internal/services/payment"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

// ProtectHandler handles PDF password protection operations
type ProtectHandler struct {
	pdfService     *pdf.ProtectService
	billingService *payment.BillingService
	uploadDir      string
	outputDir      string
}

// NewProtectHandler creates a new protection handler
func NewProtectHandler(pdfService *pdf.ProtectService, billingService *payment.BillingService, uploadDir, outputDir string) *ProtectHandler {
	return &ProtectHandler{
		pdfService:     pdfService,
		billingService: billingService,
		uploadDir:      uploadDir,
		outputDir:      outputDir,
	}
}

// Register registers the routes for this handler
func (h *ProtectHandler) Register(router *gin.RouterGroup) {
	protectGroup := router.Group("/protect")
	protectGroup.Use(middleware.APIKey())
	protectGroup.Use(middleware.CheckOperationEligibility(h.billingService))
	
	protectGroup.POST("", h.ProtectPDF)
}

// ProtectPDF handles adding password protection to a PDF
func (h *ProtectHandler) ProtectPDF(c *gin.Context) {
	// Get the operation ID from the context
	operation := "protect"
	
	// Parse multipart form
	if err := c.Request.ParseMultipartForm(32 << 20); err != nil { // 32 MB max
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   "Failed to parse form",
			"success": false,
		})
		return
	}

	// Get uploaded file
	file, header, err := c.Request.FormFile("file")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   "No PDF file provided",
			"success": false,
		})
		return
	}
	defer file.Close()

	// Verify it's a PDF
	if filepath.Ext(header.Filename) != ".pdf" {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   "Only PDF files can be protected",
			"success": false,
		})
		return
	}

	// Get passwords from form
	userPassword := c.PostForm("userPassword")
	ownerPassword := c.PostForm("ownerPassword")
	
	// At least one password is required
	if userPassword == "" && ownerPassword == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   "At least one password (user or owner) is required",
			"success": false,
		})
		return
	}

	// Get encryption options
	encryptionLevel := c.DefaultPostForm("encryptionLevel", "128")
	allowPrinting := c.DefaultPostForm("allowPrinting", "true") == "true"
	allowCopy := c.DefaultPostForm("allowCopy", "true") == "true"
	allowModify := c.DefaultPostForm("allowModify", "false") == "true"
	allowAnnotate := c.DefaultPostForm("allowAnnotate", "true") == "true"
	allowForms := c.DefaultPostForm("allowForms", "true") == "true"
	allowExtract := c.DefaultPostForm("allowExtract", "false") == "true"
	allowAssemble := c.DefaultPostForm("allowAssemble", "false") == "true"
	allowHighResPrint := c.DefaultPostForm("allowHighResPrint", "true") == "true"

	// Create session ID and file paths
	sessionID := uuid.New().String()
	inputPath := filepath.Join(h.uploadDir, fmt.Sprintf("%s-input.pdf", sessionID))
	outputPath := filepath.Join(h.outputDir, fmt.Sprintf("%s-protected.pdf", sessionID))

	// Save the uploaded file
	inputFile, err := os.Create(inputPath)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "Failed to save uploaded file",
			"success": false,
		})
		return
	}
	defer inputFile.Close()
	
	// Copy the uploaded file content
	if _, err := io.Copy(inputFile, file); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "Failed to save uploaded file",
			"success": false,
		})
		return
	}
	
	// Close input file to ensure it's flushed to disk
	inputFile.Close()

	// Configure protection options
	protectionOptions := pdf.ProtectionOptions{
		UserPassword:     userPassword,
		OwnerPassword:    ownerPassword,
		EncryptionLevel:  encryptionLevel,
		AllowPrinting:    allowPrinting,
		AllowCopy:        allowCopy,
		AllowModify:      allowModify,
		AllowAnnotate:    allowAnnotate,
		AllowForms:       allowForms,
		AllowExtract:     allowExtract,
		AllowAssemble:    allowAssemble,
		AllowHighResPrint: allowHighResPrint,
	}

	// Apply password protection
	result, err := h.pdfService.ProtectPDF(c, inputPath, outputPath, protectionOptions)

	// Clean up input file
	os.Remove(inputPath)
	
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   fmt.Sprintf("Failed to protect PDF: %v", err),
			"success": false,
		})
		return
	}

	// Charge for the operation
	userID, exists := c.Get("userID")
	if exists && userID != nil {
		opResult, err := h.billingService.ProcessOperation(c, userID.(string), operation)
		if err != nil {
			c.JSON(http.StatusPaymentRequired, gin.H{
				"error":   "Failed to process operation charge",
				"success": false,
			})
			return
		}
		
		// Create response with billing details
		c.JSON(http.StatusOK, gin.H{
			"success":      true,
			"message":      "PDF successfully protected with password",
			"fileUrl":      result.FileURL,
			"filename":     filepath.Base(result.FilePath),
			"originalName": header.Filename,
			"billing": gin.H{
				"usedFreeOperation":       opResult.UsedFreeOperation,
				"freeOperationsRemaining": opResult.FreeOperationsRemaining,
				"currentBalance":          opResult.CurrentBalance,
				"operationCost":           payment.OperationCost,
			},
		})
		return
	}

	// Response without billing info if no user ID
	c.JSON(http.StatusOK, gin.H{
		"success":      true,
		"message":      "PDF successfully protected with password",
		"fileUrl":      result.FileURL,
		"filename":     filepath.Base(result.FilePath),
		"originalName": header.Filename,
	})
}