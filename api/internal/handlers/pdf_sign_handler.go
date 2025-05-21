// internal/handlers/sign_pdf_handler.go
package handlers

import (
	"fmt"
	"net/http"
	"os"
	"os/exec"
	"path/filepath"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

// SignPdfHandler handles PDF signing operations
type SignPdfHandler struct {
	uploadsDir    string
	signaturesDir string
}

// NewSignPdfHandler creates a new sign PDF handler
func NewSignPdfHandler(uploadsDir, signaturesDir string) *SignPdfHandler {
	return &SignPdfHandler{
		uploadsDir:    uploadsDir,
		signaturesDir: signaturesDir,
	}
}

// SignPDF handles PDF signing with an image
// @Summary Sign a PDF with an image
// @Description Adds a signature image to a PDF document
// @Tags pdf
// @Accept multipart/form-data
// @Produce json
// @Param file formData file true "PDF file to sign"
// @Param signature formData file true "Signature image (PNG or JPG)"
// @Param page formData string false "Page number to add signature (default: 1)"
// @Param position formData string false "Position on page (center, bl, br, tl, tr)" default(center)
// @Param scale formData number false "Scale factor for signature" default(0.3)
// @Success 200 {object} object{success=boolean,message=string,fileUrl=string}
// @Failure 400 {object} object{error=string}
// @Failure 500 {object} object{error=string}
// @Router /api/pdf/sign [post]
func (h *SignPdfHandler) SignPDF(c *gin.Context) {
	// Create required directories if they don't exist
	for _, dir := range []string{h.uploadsDir, h.signaturesDir} {
		if err := os.MkdirAll(dir, 0755); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{
				"error": fmt.Sprintf("Failed to create directory %s: %v", dir, err),
			})
			return
		}
	}

	// Get PDF file
	pdfFile, err := c.FormFile("file")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Failed to get PDF file: " + err.Error(),
		})
		return
	}

	// Validate file type
	if !strings.HasSuffix(strings.ToLower(pdfFile.Filename), ".pdf") {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Only PDF files are supported",
		})
		return
	}

	// Get signature image
	signatureFile, err := c.FormFile("signature")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Failed to get signature image: " + err.Error(),
		})
		return
	}

	// Validate image type
	signatureExt := filepath.Ext(signatureFile.Filename)
	if !isImageExtensionSupported(signatureExt) {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Signature must be PNG or JPG image",
		})
		return
	}

	// Create unique filenames
	uniqueID := uuid.New().String()
	pdfPath := filepath.Join(h.uploadsDir, uniqueID+"-input.pdf")
	signaturePath := filepath.Join(h.uploadsDir, uniqueID+"-signature"+signatureExt)
	outputPath := filepath.Join(h.signaturesDir, uniqueID+"-signed.pdf")

	// Save uploaded files
	if err := c.SaveUploadedFile(pdfFile, pdfPath); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to save PDF file: " + err.Error(),
		})
		return
	}
	defer cleanupFile(pdfPath)

	if err := c.SaveUploadedFile(signatureFile, signaturePath); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to save signature image: " + err.Error(),
		})
		return
	}
	defer cleanupFile(signaturePath)

	// Get configuration options
	page := c.DefaultPostForm("page", "1")
	position := c.DefaultPostForm("position", "center")
	scale := c.DefaultPostForm("scale", "0.3")

	// Use pdfcpu to add the watermark (signature)
	cmd := exec.Command(
		"pdfcpu", "watermark", "add",
		"-pages", page,
		"-mode", "image",
		"--", signaturePath,
		fmt.Sprintf("position:%s, scalefactor:%s", position, scale),
		pdfPath, outputPath,
	)

	output, err := cmd.CombinedOutput()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": fmt.Sprintf("Failed to sign PDF: %v, Output: %s", err, string(output)),
		})
		return
	}

	// Verify the signed PDF exists
	if _, err := os.Stat(outputPath); os.IsNotExist(err) {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to create signed PDF file",
		})
		return
	}

	// Generate file URL
	fileURL := fmt.Sprintf("/api/file?folder=signatures&filename=%s-signed.pdf", uniqueID)

	// Return success response
	c.JSON(http.StatusOK, gin.H{
		"success":      true,
		"message":      "PDF signed successfully",
		"fileUrl":      fileURL,
		"filename":     fmt.Sprintf("%s-signed.pdf", uniqueID),
		"originalName": pdfFile.Filename,
	})
}

// Helper function to check if image extension is supported
func isImageExtensionSupported(ext string) bool {
	ext = strings.ToLower(ext)
	return ext == ".png" || ext == ".jpg" || ext == ".jpeg"
}

// Helper function to clean up temporary files
func cleanupFile(path string) {
	os.Remove(path)
}
