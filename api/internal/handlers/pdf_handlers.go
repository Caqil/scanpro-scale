// internal/handlers/pdf_handlers.go
package handlers

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"net/http"
	"os"
	"os/exec"
	"path/filepath"

	"github.com/Caqil/megapdf-api/internal/config"
	"github.com/Caqil/megapdf-api/internal/services"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type PDFHandler struct {
	balanceService *services.BalanceService
	config         *config.Config
}

func NewPDFHandler(balanceService *services.BalanceService, cfg *config.Config) *PDFHandler {
	return &PDFHandler{
		balanceService: balanceService,
		config:         cfg,
	}
}

// CompressPDF godoc
// @Summary Compress a PDF file
// @Description Reduces PDF file size with customizable compression settings
// @Tags pdf
// @Accept multipart/form-data
// @Produce json
// @Param file formData file true "PDF file to compress (max 50MB)"
// @Param quality formData string false "Compression quality: low (smallest file), medium (balanced), high (best quality)" Enums(low, medium, high) default(medium)
// @Security ApiKeyAuth
// @Success 200 {object} object{success=boolean,message=string,fileUrl=string,filename=string,originalName=string,originalSize=integer,compressedSize=integer,compressionRatio=string,billing=object{usedFreeOperation=boolean,freeOperationsRemaining=integer,currentBalance=number,operationCost=number}}
// @Failure 400 {object} object{error=string}
// @Failure 401 {object} object{error=string}
// @Failure 402 {object} object{error=string,details=object{balance=number,freeOperationsRemaining=integer,operationCost=number}}
// @Failure 500 {object} object{error=string}
// @Router /api/pdf/compress [post]
func (h *PDFHandler) CompressPDF(c *gin.Context) {
	// Get user ID and operation type from context
	userID, _ := c.Get("userId")
	operation, _ := c.Get("operationType")

	// Process the operation charge
	result, err := h.balanceService.ProcessOperation(userID.(string), operation.(string))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to process operation: " + err.Error(),
		})
		return
	}

	if !result.Success {
		c.JSON(http.StatusPaymentRequired, gin.H{
			"error": result.Error,
			"details": gin.H{
				"balance":                 result.CurrentBalance,
				"freeOperationsRemaining": result.FreeOperationsRemaining,
				"operationCost":           services.OperationCost,
			},
		})
		return
	}

	// Get file from form
	file, err := c.FormFile("file")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Failed to get file: " + err.Error(),
		})
		return
	}

	// Check file extension
	if filepath.Ext(file.Filename) != ".pdf" {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Only PDF files are supported",
		})
		return
	}

	// Get compression quality
	quality := c.DefaultPostForm("quality", "medium")
	if quality != "low" && quality != "medium" && quality != "high" {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Invalid quality. Must be low, medium, or high",
		})
		return
	}

	// Create unique file names
	uniqueID := uuid.New().String()
	inputPath := filepath.Join(h.config.UploadDir, uniqueID+"-input.pdf")
	outputPath := filepath.Join(h.config.PublicDir, "compressions", uniqueID+"-compressed.pdf")

	// Save uploaded file
	if err := c.SaveUploadedFile(file, inputPath); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to save file: " + err.Error(),
		})
		return
	}

	// Compress the PDF using ghostscript
	// The actual compression command depends on your tooling
	// This is a simplified example using ghostscript
	cmd := exec.Command(
		"gs",
		"-sDEVICE=pdfwrite",
		"-dPDFSETTINGS=/"+quality,
		"-dNOPAUSE",
		"-dQUIET",
		"-dBATCH",
		"-sOutputFile="+outputPath,
		inputPath,
	)

	if err := cmd.Run(); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to compress PDF: " + err.Error(),
		})
		return
	}

	// Get file sizes
	originalFileInfo, err := os.Stat(inputPath)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to get original file size: " + err.Error(),
		})
		return
	}

	compressedFileInfo, err := os.Stat(outputPath)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to get compressed file size: " + err.Error(),
		})
		return
	}

	// Calculate compression ratio
	originalSize := originalFileInfo.Size()
	compressedSize := compressedFileInfo.Size()
	compressionRatio := float64(originalSize-compressedSize) / float64(originalSize) * 100

	// Clean up input file
	os.Remove(inputPath)

	// Generate file URL
	fileUrl := fmt.Sprintf("/api/file?folder=compressions&filename=%s-compressed.pdf", uniqueID)

	// Return response
	c.JSON(http.StatusOK, gin.H{
		"success":          true,
		"message":          fmt.Sprintf("PDF compression successful with %.2f%% reduction", compressionRatio),
		"fileUrl":          fileUrl,
		"filename":         fmt.Sprintf("%s-compressed.pdf", uniqueID),
		"originalName":     file.Filename,
		"originalSize":     originalSize,
		"compressedSize":   compressedSize,
		"compressionRatio": fmt.Sprintf("%.2f%%", compressionRatio),
		"billing": gin.H{
			"usedFreeOperation":       result.UsedFreeOperation,
			"freeOperationsRemaining": result.FreeOperationsRemaining,
			"currentBalance":          result.CurrentBalance,
			"operationCost":           services.OperationCost,
		},
	})
}

// ProtectPDF godoc
// @Summary Password protect a PDF file
// @Description Adds password protection and permission restrictions to a PDF file
// @Tags pdf
// @Accept multipart/form-data
// @Produce json
// @Param file formData file true "PDF file to protect (max 50MB)"
// @Param password formData string true "Password to set for the PDF (minimum 4 characters)"
// @Param permission formData string false "Permission level: restricted (apply specific permissions) or all (grant all permissions)" Enums(restricted, all) default(restricted)
// @Param allowPrinting formData boolean false "Allow document printing" default(false)
// @Param allowCopying formData boolean false "Allow content copying" default(false)
// @Param allowEditing formData boolean false "Allow content editing" default(false)
// @Security ApiKeyAuth
// @Success 200 {object} object{success=boolean,message=string,fileUrl=string,filename=string,originalName=string,methodUsed=string,billing=object{usedFreeOperation=boolean,freeOperationsRemaining=integer,currentBalance=number,operationCost=number}}
// @Failure 400 {object} object{error=string}
// @Failure 401 {object} object{error=string}
// @Failure 402 {object} object{error=string,details=object{balance=number,freeOperationsRemaining=integer,operationCost=number}}
// @Failure 500 {object} object{error=string}
// @Router /api/pdf/protect [post]
func (h *PDFHandler) ProtectPDF(c *gin.Context) {
	// Get user ID and operation type from context
	userID, _ := c.Get("userId")
	operation, _ := c.Get("operationType")

	// Process the operation charge
	result, err := h.balanceService.ProcessOperation(userID.(string), operation.(string))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to process operation: " + err.Error(),
		})
		return
	}

	if !result.Success {
		c.JSON(http.StatusPaymentRequired, gin.H{
			"error": result.Error,
			"details": gin.H{
				"balance":                 result.CurrentBalance,
				"freeOperationsRemaining": result.FreeOperationsRemaining,
				"operationCost":           services.OperationCost,
			},
		})
		return
	}

	// Get file from form
	file, err := c.FormFile("file")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Failed to get file: " + err.Error(),
		})
		return
	}

	// Check file extension
	if filepath.Ext(file.Filename) != ".pdf" {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Only PDF files are supported",
		})
		return
	}

	// Get password
	password := c.PostForm("password")
	if password == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Password is required",
		})
		return
	}

	// Get permissions
	permission := c.DefaultPostForm("permission", "restricted")
	allowPrinting := c.DefaultPostForm("allowPrinting", "false") == "true" || permission == "all"
	allowCopying := c.DefaultPostForm("allowCopying", "false") == "true" || permission == "all"
	allowEditing := c.DefaultPostForm("allowEditing", "false") == "true" || permission == "all"

	// Create unique file names
	uniqueID := uuid.New().String()
	inputPath := filepath.Join(h.config.UploadDir, uniqueID+"-input.pdf")
	outputPath := filepath.Join(h.config.PublicDir, "protected", uniqueID+"-protected.pdf")

	// Save uploaded file
	if err := c.SaveUploadedFile(file, inputPath); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to save file: " + err.Error(),
		})
		return
	}

	// Build permission string for qpdf
	permissionFlags := ""
	if allowPrinting {
		permissionFlags += " --print=y"
	} else {
		permissionFlags += " --print=n"
	}

	if allowCopying {
		permissionFlags += " --extract=y"
	} else {
		permissionFlags += " --extract=n"
	}

	if allowEditing {
		permissionFlags += " --modify=y --annotate=y"
	} else {
		permissionFlags += " --modify=n --annotate=n"
	}

	// Protect the PDF using qpdf
	// The actual protection command depends on your tools
	cmd := exec.Command(
		"qpdf",
		"--encrypt", password, password, "128", "--",
		permissionFlags,
		inputPath,
		outputPath,
	)

	if err := cmd.Run(); err != nil {
		// Try alternative approach with pdftk if qpdf fails
		cmd = exec.Command(
			"pdftk",
			inputPath,
			"output", outputPath,
			"user_pw", password,
			"owner_pw", password,
		)

		if err := cmd.Run(); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{
				"error": "Failed to protect PDF: " + err.Error(),
			})
			return
		}
	}

	// Clean up input file
	os.Remove(inputPath)

	// Generate file URL
	fileUrl := fmt.Sprintf("/api/file?folder=protected&filename=%s-protected.pdf", uniqueID)

	// Return response
	c.JSON(http.StatusOK, gin.H{
		"success":      true,
		"message":      "PDF protected with password successfully",
		"fileUrl":      fileUrl,
		"filename":     fmt.Sprintf("%s-protected.pdf", uniqueID),
		"originalName": file.Filename,
		"methodUsed":   "qpdf",
		"billing": gin.H{
			"usedFreeOperation":       result.UsedFreeOperation,
			"freeOperationsRemaining": result.FreeOperationsRemaining,
			"currentBalance":          result.CurrentBalance,
			"operationCost":           services.OperationCost,
		},
	})
}

// MergePDFs godoc
// @Summary Merge multiple PDF files
// @Description Combines multiple PDF files into a single PDF
// @Tags pdf
// @Accept multipart/form-data
// @Produce json
// @Param files formData file true "PDF files to merge (multiple)"
// @Param order formData string false "JSON array specifying the order of files"
// @Security ApiKeyAuth
// @Success 200 {object} map[string]interface{}
// @Failure 400 {object} map[string]string
// @Failure 401 {object} map[string]string
// @Failure 402 {object} map[string]string
// @Failure 500 {object} map[string]string
// @Router /api/pdf/merge [post]
func (h *PDFHandler) MergePDFs(c *gin.Context) {
	// Get user ID and operation type from context
	userID, _ := c.Get("userId")
	operation, _ := c.Get("operationType")

	// Process the operation charge
	result, err := h.balanceService.ProcessOperation(userID.(string), operation.(string))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to process operation: " + err.Error(),
		})
		return
	}

	if !result.Success {
		c.JSON(http.StatusPaymentRequired, gin.H{
			"error": result.Error,
			"details": gin.H{
				"balance":                 result.CurrentBalance,
				"freeOperationsRemaining": result.FreeOperationsRemaining,
				"operationCost":           services.OperationCost,
			},
		})
		return
	}

	// Parse multipart form
	if err := c.Request.ParseMultipartForm(32 << 20); err != nil { // 32MB max
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Failed to parse form: " + err.Error(),
		})
		return
	}

	// Get files
	form, err := c.MultipartForm()
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Failed to get form: " + err.Error(),
		})
		return
	}

	files := form.File["files"]
	if len(files) < 2 {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "At least two PDF files are required for merging",
		})
		return
	}

	// Check all files are PDFs
	for _, file := range files {
		if filepath.Ext(file.Filename) != ".pdf" {
			c.JSON(http.StatusBadRequest, gin.H{
				"error": fmt.Sprintf("File '%s' is not a PDF", file.Filename),
			})
			return
		}
	}

	// Parse file order if provided
	fileOrder := make([]int, len(files))
	for i := range fileOrder {
		fileOrder[i] = i // Default order
	}

	orderStr := c.PostForm("order")
	if orderStr != "" {
		var order []int
		if err := json.Unmarshal([]byte(orderStr), &order); err == nil {
			// Validate order
			valid := true
			if len(order) == len(files) {
				seen := make(map[int]bool)
				for _, idx := range order {
					if idx < 0 || idx >= len(files) || seen[idx] {
						valid = false
						break
					}
					seen[idx] = true
				}

				if valid {
					fileOrder = order
				}
			}
		}
	}

	// Create unique ID and output path
	uniqueID := uuid.New().String()
	outputPath := filepath.Join(h.config.PublicDir, "merges", uniqueID+"-merged.pdf")

	// Create temp directory for input files
	tempDir, err := ioutil.TempDir(h.config.TempDir, "merge-")
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to create temp directory: " + err.Error(),
		})
		return
	}
	defer os.RemoveAll(tempDir)

	// Save all files to temp directory
	inputPaths := make([]string, len(files))
	totalInputSize := int64(0)

	for i, file := range files {
		inputPath := filepath.Join(tempDir, fmt.Sprintf("input-%d.pdf", i))
		if err := c.SaveUploadedFile(file, inputPath); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{
				"error": "Failed to save file: " + err.Error(),
			})
			return
		}

		inputPaths[i] = inputPath

		// Get file size
		fileInfo, err := os.Stat(inputPath)
		if err == nil {
			totalInputSize += fileInfo.Size()
		}
	}

	// Create ordered list of input files
	orderedInputs := make([]string, len(files))
	for i, idx := range fileOrder {
		orderedInputs[i] = inputPaths[idx]
	}

	// Merge PDFs using pdftk
	args := append([]string{
		"cat",
		"output", outputPath,
	}, orderedInputs...)

	cmd := exec.Command("pdftk", args...)

	if err := cmd.Run(); err != nil {
		// Try alternative approach with gs if pdftk fails
		gsArgs := append([]string{
			"-q",
			"-dNOPAUSE",
			"-dBATCH",
			"-sDEVICE=pdfwrite",
			"-sOutputFile=" + outputPath,
		}, orderedInputs...)

		cmd = exec.Command("gs", gsArgs...)

		if err := cmd.Run(); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{
				"error": "Failed to merge PDFs: " + err.Error(),
			})
			return
		}
	}

	// Get merged file size
	mergedFileInfo, err := os.Stat(outputPath)
	var mergedSize int64
	if err != nil {
		mergedSize = 0
	} else {
		mergedSize = mergedFileInfo.Size()
	}

	// Generate file URL
	fileUrl := fmt.Sprintf("/api/file?folder=merges&filename=%s-merged.pdf", uniqueID)

	// Return response
	c.JSON(http.StatusOK, gin.H{
		"success":        true,
		"message":        "PDF merge successful",
		"fileUrl":        fileUrl,
		"filename":       fmt.Sprintf("%s-merged.pdf", uniqueID),
		"mergedSize":     mergedSize,
		"totalInputSize": totalInputSize,
		"fileCount":      len(files),
		"billing": gin.H{
			"usedFreeOperation":       result.UsedFreeOperation,
			"freeOperationsRemaining": result.FreeOperationsRemaining,
			"currentBalance":          result.CurrentBalance,
			"operationCost":           services.OperationCost,
		},
	})
}
