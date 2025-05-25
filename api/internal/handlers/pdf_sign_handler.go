// internal/handlers/sign_pdf_handler.go
package handlers

import (
	"bytes"
	"context"
	"fmt"
	"log"
	"net/http"
	"os"
	"os/exec"
	"path/filepath"
	"strconv"
	"strings"
	"time"

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
// @Param content formData file true "Signature image (PNG or JPG)"
// @Param position formData string false "Position on page (c, tl, tc, tr, l, r, bl, bc, br)" default(c)
// @Param rotation formData number false "Rotation angle" default(0)
// @Param opacity formData number false "Opacity (0-100)" default(100)
// @Param scale formData number false "Scale factor (percentage)" default(100)
// @Param pages formData string false "Page selection (all, custom)" default(all)
// @Param customPages formData string false "Custom page range (e.g., 1-3,5,7-9)"
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

	// Get signature content (can be text or image)
	var contentType string
	var contentValue string

	// Check if we have a file upload (image/svg signature)
	signatureImage, err := c.FormFile("content")
	if err == nil && signatureImage != nil {
		// We have an uploaded file
		contentType = "image"

		// Validate image type
		signatureExt := filepath.Ext(signatureImage.Filename)
		if !isImageExtensionSupported(signatureExt) {
			c.JSON(http.StatusBadRequest, gin.H{
				"error": "Signature must be PNG, JPG, or SVG image",
			})
			return
		}
	} else {
		// Check if we have text content
		textContent := c.PostForm("content")
		if textContent != "" {
			contentType = "text"
			contentValue = textContent
		} else {
			// No valid content found
			c.JSON(http.StatusBadRequest, gin.H{
				"error": "No signature content provided",
			})
			return
		}
	}

	// Get parameters with defaults
	position := c.DefaultPostForm("position", "c")
	rotationStr := c.DefaultPostForm("rotation", "0")
	opacityStr := c.DefaultPostForm("opacity", "100")
	scaleStr := c.DefaultPostForm("scale", "100")
	pages := c.DefaultPostForm("pages", "all")
	customPages := c.DefaultPostForm("customPages", "")

	// Parse numeric parameters
	rotation, _ := strconv.Atoi(rotationStr)
	opacity, _ := strconv.Atoi(opacityStr)
	if opacity < 1 || opacity > 100 {
		opacity = 100 // Default to 100% if out of range
	}

	scale, _ := strconv.Atoi(scaleStr)
	if scale < 10 || scale > 500 {
		scale = 100 // Default to 100% if out of range
	}

	// Create unique ID for files
	uniqueID := uuid.New().String()
	pdfPath := filepath.Join(h.uploadsDir, uniqueID+"-input.pdf")
	outputPath := filepath.Join(h.signaturesDir, uniqueID+"-signed.pdf")
	var signaturePath string
	var tempFiles []string // Track temp files to clean up

	// Save uploaded PDF
	if err := c.SaveUploadedFile(pdfFile, pdfPath); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to save PDF file: " + err.Error(),
		})
		return
	}
	defer os.Remove(pdfPath) // Clean up after processing

	// Process content based on type
	if contentType == "image" {
		// Save the signature image
		signaturePath = filepath.Join(h.uploadsDir, uniqueID+"-signature"+filepath.Ext(signatureImage.Filename))
		tempFiles = append(tempFiles, signaturePath)

		if err := c.SaveUploadedFile(signatureImage, signaturePath); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{
				"error": "Failed to save signature image: " + err.Error(),
			})
			return
		}

		contentValue = signaturePath
	}

	// Prepare watermark description for pdfcpu
	watermarkDescription := buildSignatureDescription(
		contentType, position, rotation, opacity, scale)

	log.Printf("Using signature description: %s", watermarkDescription)

	// Apply signature using pdfcpu
	success, err := h.applySignatureWithPdfcpu(
		pdfPath, outputPath, contentType, contentValue, watermarkDescription, pages, customPages)

	// Clean up temp files
	for _, tempFile := range tempFiles {
		os.Remove(tempFile)
	}

	if !success {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": fmt.Sprintf("Failed to add signature to PDF: %v", err),
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

// buildSignatureDescription generates a description for pdfcpu watermark command
func buildSignatureDescription(contentType, position string, rotation, opacity, scale int) string {
	// Map position codes to ensure compatibility
	posMap := map[string]string{
		"c":  "c",
		"tl": "tl",
		"tc": "tc",
		"tr": "tr",
		"l":  "l",
		"r":  "r",
		"bl": "bl",
		"bc": "bc",
		"br": "br",
		// Also support full names
		"center":        "c",
		"top-left":      "tl",
		"top-center":    "tc",
		"top-right":     "tr",
		"left":          "l",
		"right":         "r",
		"bottom-left":   "bl",
		"bottom-center": "bc",
		"bottom-right":  "br",
	}

	// Get position code, default to center if not recognized
	posCode := posMap[position]
	if posCode == "" {
		posCode = "c"
		log.Printf("Warning: Unrecognized position '%s', defaulting to center", position)
	}

	// Convert opacity to 0-1 range
	opacityValue := float64(opacity) / 100.0

	// Convert scale to decimal
	scaleValue := float64(scale) / 100.0

	// Invert rotation to match expected behavior
	fixedRotation := -rotation

	// Build description string (same format as watermark)
	description := fmt.Sprintf("pos:%s, op:%.1f, rot:%d, scale:%.1f",
		posCode, opacityValue, fixedRotation, scaleValue)

	return description
}

// applySignatureWithPdfcpu applies signature using pdfcpu watermark command
func (h *SignPdfHandler) applySignatureWithPdfcpu(
	inputPath, outputPath, contentType, contentValue, description, pages, customPages string) (bool, error) {

	// Build pdfcpu command
	args := []string{"watermark", "add", "-mode"}

	// Set mode based on content type
	if contentType == "image" {
		args = append(args, "image")
	} else {
		args = append(args, "text")
	}

	// Add page selection if needed
	if pages != "all" {
		if pages == "custom" && customPages != "" {
			args = append(args, "-pages", customPages)
		}
	}

	// Add the files - correct order is crucial for pdfcpu: content, description, input, output
	args = append(args, "--", contentValue, description, inputPath, outputPath)

	log.Printf("Executing: pdfcpu %s", strings.Join(args, " "))

	// Execute command with timeout
	ctx, cancel := context.WithTimeout(context.Background(), 300*time.Second)
	defer cancel()

	cmd := exec.CommandContext(ctx, "pdfcpu", args...)

	var stdout, stderr bytes.Buffer
	cmd.Stdout = &stdout
	cmd.Stderr = &stderr

	err := cmd.Run()
	if err != nil {
		combinedOutput := strings.TrimSpace(stdout.String() + "\n" + stderr.String())
		log.Printf("Command failed: %v, output: %s", err, combinedOutput)
		return false, fmt.Errorf("pdfcpu error: %s", combinedOutput)
	}

	// Check if output file exists and has content
	if fileInfo, err := os.Stat(outputPath); err != nil || fileInfo.Size() == 0 {
		return false, fmt.Errorf("output file not created or empty")
	}

	return true, nil
}

// Helper function to check if image extension is supported
func isImageExtensionSupported(ext string) bool {
	ext = strings.ToLower(ext)
	return ext == ".png" || ext == ".jpg" || ext == ".jpeg" || ext == ".svg"
}
