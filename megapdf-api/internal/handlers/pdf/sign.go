// internal/handlers/pdf/sign.go
package pdf

import (
	"fmt"
	"io"
	"net/http"
	"os"
	"path/filepath"
	"strconv"

	"megapdf-api/internal/middleware"
	"megapdf-api/internal/services/pdf"
	"megapdf-api/internal/services/payment"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

// SignHandler handles PDF digital signing operations
type SignHandler struct {
	pdfService     *pdf.SignService
	billingService *payment.BillingService
	uploadDir      string
	outputDir      string
}

// NewSignHandler creates a new sign handler
func NewSignHandler(pdfService *pdf.SignService, billingService *payment.BillingService, uploadDir, outputDir string) *SignHandler {
	return &SignHandler{
		pdfService:     pdfService,
		billingService: billingService,
		uploadDir:      uploadDir,
		outputDir:      outputDir,
	}
}

// Register registers the routes for this handler
func (h *SignHandler) Register(router *gin.RouterGroup) {
	signGroup := router.Group("/sign")
	signGroup.Use(middleware.APIKey())
	signGroup.Use(middleware.CheckOperationEligibility(h.billingService))
	
	signGroup.POST("", h.SignPDF)
}

// SignPDF handles digitally signing a PDF
func (h *SignHandler) SignPDF(c *gin.Context) {
	// Get the operation ID from the context
	operation := "sign"
	
	// Parse multipart form
	if err := c.Request.ParseMultipartForm(32 << 20); err != nil { // 32 MB max
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   "Failed to parse form",
			"success": false,
		})
		return
	}

	// Get uploaded PDF file
	pdfFile, pdfHeader, err := c.Request.FormFile("file")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   "No PDF file provided",
			"success": false,
		})
		return
	}
	defer pdfFile.Close()

	// Verify it's a PDF
	if filepath.Ext(pdfHeader.Filename) != ".pdf" {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   "Only PDF files can be signed",
			"success": false,
		})
		return
	}

	// Get signing certificate and private key
	certFile, certHeader, err := c.Request.FormFile("certificate")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   "No certificate file provided",
			"success": false,
		})
		return
	}
	defer certFile.Close()

	keyFile, keyHeader, err := c.Request.FormFile("privateKey")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   "No private key file provided",
			"success": false,
		})
		return
	}
	defer keyFile.Close()

	// Get passphrase if provided (might be empty for unencrypted keys)
	passphrase := c.PostForm("passphrase")

	// Get signature options
	reason := c.PostForm("reason")
	location := c.PostForm("location")
	contactInfo := c.PostForm("contactInfo")
	name := c.PostForm("name")
	
	// Get signature appearance options
	page, _ := strconv.Atoi(c.DefaultPostForm("page", "1"))
	posX, _ := strconv.ParseFloat(c.DefaultPostForm("posX", "100"), 64)
	posY, _ := strconv.ParseFloat(c.DefaultPostForm("posY", "100"), 64)
	width, _ := strconv.ParseFloat(c.DefaultPostForm("width", "200"), 64)
	height, _ := strconv.ParseFloat(c.DefaultPostForm("height", "50"), 64)
	visibility := c.DefaultPostForm("visibility", "visible") == "visible"
	
	// Create session ID and file paths
	sessionID := uuid.New().String()
	pdfPath := filepath.Join(h.uploadDir, fmt.Sprintf("%s-input.pdf", sessionID))
	certPath := filepath.Join(h.uploadDir, fmt.Sprintf("%s-cert.p12", sessionID))
	keyPath := filepath.Join(h.uploadDir, fmt.Sprintf("%s-key.key", sessionID))
	outputPath := filepath.Join(h.outputDir, fmt.Sprintf("%s-signed.pdf", sessionID))

	// Save the uploaded files
	pdfInputFile, err := os.Create(pdfPath)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "Failed to save uploaded PDF",
			"success": false,
		})
		return
	}
	defer pdfInputFile.Close()
	
	if _, err := io.Copy(pdfInputFile, pdfFile); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "Failed to save uploaded PDF",
			"success": false,
		})
		return
	}
	pdfInputFile.Close()
	
	certInputFile, err := os.Create(certPath)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "Failed to save certificate file",
			"success": false,
		})
		return
	}
	defer certInputFile.Close()
	
	if _, err := io.Copy(certInputFile, certFile); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "Failed to save certificate file",
			"success": false,
		})
		return
	}
	certInputFile.Close()
	
	keyInputFile, err := os.Create(keyPath)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "Failed to save private key file",
			"success": false,
		})
		return
	}
	defer keyInputFile.Close()
	
	if _, err := io.Copy(keyInputFile, keyFile); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "Failed to save private key file",
			"success": false,
		})
		return
	}
	keyInputFile.Close()

	// Configure signing options
	signOptions := pdf.SignOptions{
		CertificatePath: certPath,
		PrivateKeyPath:  keyPath,
		Passphrase:      passphrase,
		Reason:          reason,
		Location:        location,
		ContactInfo:     contactInfo,
		Name:            name,
		Page:            page,
		PosX:            posX,
		PosY:            posY,
		Width:           width,
		Height:          height,
		Visible:         visibility,
	}

	// Sign the PDF
	result, err := h.pdfService.SignPDF(c, pdfPath, outputPath, signOptions)

	// Clean up input files
	os.Remove(pdfPath)
	os.Remove(certPath)
	os.Remove(keyPath)
	
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   fmt.Sprintf("Failed to sign PDF: %v", err),
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
			"message":      "PDF successfully signed",
			"fileUrl":      result.FileURL,
			"filename":     filepath.Base(result.FilePath),
			"originalName": pdfHeader.Filename,
			"signerName":   result.SignerName,
			"signatureDate": result.SignatureDate,
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
		"message":      "PDF successfully signed",
		"fileUrl":      result.FileURL,
		"filename":     filepath.Base(result.FilePath),
		"originalName": pdfHeader.Filename,
		"signerName":   result.SignerName,
		"signatureDate": result.SignatureDate,
	})
}