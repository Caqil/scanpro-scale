// internal/handlers/ocr_handler.go
package handlers

import (
	"fmt"
	"io"
	"net/http"
	"os"
	"os/exec"
	"path/filepath"
	"strings"

	"github.com/MegaPDF/megapdf-official/api/internal/config"
	"github.com/MegaPDF/megapdf-official/api/internal/services"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

// OcrHandler handles OCR-related operations
type OcrHandler struct {
	balanceService *services.BalanceService
	config         *config.Config
}

// NewOcrHandler creates a new OCR handler
func NewOcrHandler(balanceService *services.BalanceService, cfg *config.Config) *OcrHandler {
	return &OcrHandler{
		balanceService: balanceService,
		config:         cfg,
	}
}

// OcrPdf godoc
// @Summary Create a searchable PDF using OCR
// @Description Processes a PDF file with OCR to make it searchable
// @Tags ocr
// @Accept multipart/form-data
// @Produce json
// @Param file formData file true "PDF file to process"
// @Param language formData string false "OCR language (default: eng)"
// @Param preserveLayout formData bool false "Preserve the original layout (default: true)"
// @Param enhanceScanned formData bool false "Enhance scanned images before OCR (default: true)"
// @Success 200 {object} object{success=boolean,message=string,searchablePdfUrl=string}
// @Failure 400 {object} object{error=string}
// @Failure 500 {object} object{error=string}
// @Router /api/ocr [post]
func (h *OcrHandler) OcrPdf(c *gin.Context) {
	// Check if this operation should be charged
	userID, exists := c.Get("userId")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	// Process operation charge (rate limiting, free operations, etc.)
	result, err := h.balanceService.ProcessOperation(userID.(string), "ocr")
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to process operation: " + err.Error(),
		})
		return
	}

	if !result.Success {
		c.JSON(http.StatusPaymentRequired, gin.H{
			"error": result.Error,
		})
		return
	}

	// Get form file
	file, header, err := c.Request.FormFile("file")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "No file provided or invalid file",
		})
		return
	}
	defer file.Close()

	// Validate file type
	if !strings.HasSuffix(strings.ToLower(header.Filename), ".pdf") {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Only PDF files are supported",
		})
		return
	}

	// Get parameters
	language := c.PostForm("language")
	if language == "" {
		language = "eng" // Default to English
	}

	preserveLayout := true
	if preserveLayoutStr := c.PostForm("preserveLayout"); preserveLayoutStr != "" {
		preserveLayout = preserveLayoutStr == "true"
	}

	enhanceScanned := true
	if enhanceScannedStr := c.PostForm("enhanceScanned"); enhanceScannedStr != "" {
		enhanceScanned = enhanceScannedStr == "true"
	}

	// Create unique ID for this operation
	operationID := uuid.New().String()

	// Create file paths
	inputPath := filepath.Join(h.config.UploadDir, fmt.Sprintf("%s-input.pdf", operationID))
	outputPath := filepath.Join(h.config.PublicDir, "ocr", fmt.Sprintf("%s-searchable.pdf", operationID))

	// Create output directory if it doesn't exist
	os.MkdirAll(filepath.Join(h.config.PublicDir, "ocr"), os.ModePerm)

	// Save uploaded file
	out, err := os.Create(inputPath)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to save uploaded file: " + err.Error(),
		})
		return
	}
	defer out.Close()

	_, err = io.Copy(out, file)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to save uploaded file: " + err.Error(),
		})
		return
	}

	// Check if OCR tools are available
	if !h.isPythonInstalled() && !h.isTesseractInstalled() {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "OCR tools are not available on the server. Please install Tesseract OCR.",
		})
		return
	}

	// Process file with OCR
	success, err := h.processOcr(inputPath, outputPath, language, preserveLayout, enhanceScanned)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "OCR processing failed: " + err.Error(),
		})
		return
	}

	if !success {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "OCR processing failed to produce output",
		})
		return
	}

	// Return success response
	c.JSON(http.StatusOK, gin.H{
		"success":          true,
		"message":          "OCR processing completed successfully",
		"searchablePdfUrl": fmt.Sprintf("/api/file?folder=ocr&filename=%s", filepath.Base(outputPath)),
		"processedFile":    header.Filename,
		"language":         language,
	})
}

// ExtractText godoc
// @Summary Extract text from a PDF using OCR
// @Description Extracts text from a PDF file using OCR
// @Tags ocr
// @Accept multipart/form-data
// @Produce json
// @Param file formData file true "PDF file to process"
// @Param language formData string false "OCR language (default: eng)"
// @Param pageRange formData string false "Page range (all or specific)"
// @Param pages formData string false "Specific pages to process (e.g., '1,3-5,7')"
// @Param preserveLayout formData bool false "Preserve the original layout (default: true)"
// @Success 200 {object} object{success=boolean,message=string,text=string,fileUrl=string}
// @Failure 400 {object} object{error=string}
// @Failure 500 {object} object{error=string}
// @Router /api/ocr/extract [post]
func (h *OcrHandler) ExtractText(c *gin.Context) {
	// Check if this operation should be charged
	userID, exists := c.Get("userId")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	// Process operation charge
	result, err := h.balanceService.ProcessOperation(userID.(string), "ocr")
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to process operation: " + err.Error(),
		})
		return
	}

	if !result.Success {
		c.JSON(http.StatusPaymentRequired, gin.H{
			"error": result.Error,
		})
		return
	}

	// Get form file
	file, header, err := c.Request.FormFile("file")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "No file provided or invalid file",
		})
		return
	}
	defer file.Close()

	// Validate file type
	if !strings.HasSuffix(strings.ToLower(header.Filename), ".pdf") {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Only PDF files are supported",
		})
		return
	}

	// Get parameters
	language := c.PostForm("language")
	if language == "" {
		language = "eng" // Default to English
	}

	pageRange := c.PostForm("pageRange")
	if pageRange == "" {
		pageRange = "all" // Default to all pages
	}

	pages := c.PostForm("pages")

	preserveLayout := true
	if preserveLayoutStr := c.PostForm("preserveLayout"); preserveLayoutStr != "" {
		preserveLayout = preserveLayoutStr == "true"
	}

	// Create unique ID for this operation
	operationID := uuid.New().String()

	// Create file paths
	inputPath := filepath.Join(h.config.UploadDir, fmt.Sprintf("%s-input.pdf", operationID))
	outputTextPath := filepath.Join(h.config.PublicDir, "ocr", fmt.Sprintf("%s-text.txt", operationID))

	// Create output directory if it doesn't exist
	os.MkdirAll(filepath.Join(h.config.PublicDir, "ocr"), os.ModePerm)

	// Save uploaded file
	out, err := os.Create(inputPath)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to save uploaded file: " + err.Error(),
		})
		return
	}
	defer out.Close()

	_, err = io.Copy(out, file)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to save uploaded file: " + err.Error(),
		})
		return
	}

	// Check if OCR tools are available
	if !h.isTesseractInstalled() {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "OCR tools are not available on the server. Please install Tesseract OCR.",
		})
		return
	}

	// Extract text using OCR
	text, err := h.extractTextWithOcr(inputPath, outputTextPath, language, pageRange, pages, preserveLayout)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Text extraction failed: " + err.Error(),
		})
		return
	}

	// Save extracted text to file
	err = os.WriteFile(outputTextPath, []byte(text), 0644)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to save extracted text: " + err.Error(),
		})
		return
	}

	// Count words for statistics
	wordCount := len(strings.Fields(text))

	// Return success response
	c.JSON(http.StatusOK, gin.H{
		"success":      true,
		"message":      "Text extraction completed successfully",
		"text":         text,
		"fileUrl":      fmt.Sprintf("/api/file?folder=ocr&filename=%s", filepath.Base(outputTextPath)),
		"filename":     filepath.Base(outputTextPath),
		"originalName": header.Filename,
		"wordCount":    wordCount,
	})
}

// Helper methods

// isPythonInstalled checks if Python is installed
func (h *OcrHandler) isPythonInstalled() bool {
	// Try python3 first
	cmd := exec.Command("python3", "--version")
	if err := cmd.Run(); err == nil {
		return true
	}

	// Try python as fallback
	cmd = exec.Command("python", "--version")
	return cmd.Run() == nil
}

// isTesseractInstalled checks if Tesseract OCR is installed
func (h *OcrHandler) isTesseractInstalled() bool {
	cmd := exec.Command("tesseract", "--version")
	return cmd.Run() == nil
}

// processOcr processes a PDF file with OCR
func (h *OcrHandler) processOcr(inputPath, outputPath, language string, preserveLayout, enhanceScanned bool) (bool, error) {
	// Create temp directory
	tempDir := filepath.Join(h.config.TempDir, uuid.New().String())
	os.MkdirAll(tempDir, os.ModePerm)
	defer os.RemoveAll(tempDir) // Clean up temp directory

	// Try system tesseract first
	if h.isTesseractInstalled() {
		fmt.Println("Using system Tesseract for OCR")

		// Process with pdftoppm and tesseract
		// Extract images using pdftoppm
		imagesDir := filepath.Join(tempDir, "images")
		os.MkdirAll(imagesDir, os.ModePerm)

		// Convert PDF pages to images
		cmd := exec.Command("pdftoppm", "-png", "-r", "300", inputPath, filepath.Join(imagesDir, "page"))
		if err := cmd.Run(); err != nil {
			// Fall back to another method if pdftoppm fails
			fmt.Println("pdftoppm failed, falling back to ghostscript")

			// Try ghostscript
			gsCmd := "gs"
			if h.isCommandAvailable("gswin64c") {
				gsCmd = "gswin64c" // Windows version
			}

			cmd = exec.Command(gsCmd,
				"-sDEVICE=pngalpha",
				"-r300",
				"-dNOPAUSE",
				"-dBATCH",
				fmt.Sprintf("-sOutputFile=%s/page-%%d.png", imagesDir),
				inputPath)

			if err := cmd.Run(); err != nil {
				return false, fmt.Errorf("failed to convert PDF to images: %w", err)
			}
		}

		// Process each image with tesseract
		files, err := os.ReadDir(imagesDir)
		if err != nil {
			return false, fmt.Errorf("failed to read temp directory: %w", err)
		}

		pdfFiles := []string{}
		for _, file := range files {
			if strings.HasSuffix(file.Name(), ".png") {
				imagePath := filepath.Join(imagesDir, file.Name())
				outBasename := filepath.Join(tempDir, strings.TrimSuffix(file.Name(), ".png"))

				// Build tesseract command
				args := []string{
					imagePath,
					outBasename,
					"-l", language,
					"pdf", // Output as PDF
				}

				if !preserveLayout {
					args = append(args, "hocr") // Use HOCR for layout analysis
				}

				cmd := exec.Command("tesseract", args...)
				if err := cmd.Run(); err != nil {
					fmt.Printf("Warning: Tesseract failed for %s: %v\n", file.Name(), err)
					continue
				}

				// Add created PDF to list
				pdfFile := outBasename + ".pdf"
				if _, err := os.Stat(pdfFile); err == nil {
					pdfFiles = append(pdfFiles, pdfFile)
				}
			}
		}

		// Merge PDFs if multiple pages were processed
		if len(pdfFiles) > 1 {
			// Use a PDF merging tool (pdfunite, gs, or qpdf)
			if h.isCommandAvailable("pdfunite") {
				args := append(pdfFiles, outputPath)
				cmd := exec.Command("pdfunite", args...)
				if err := cmd.Run(); err != nil {
					return false, fmt.Errorf("failed to merge PDFs with pdfunite: %w", err)
				}
			} else if h.isCommandAvailable("gs") || h.isCommandAvailable("gswin64c") {
				// Ghostscript
				gsCmd := "gs"
				if h.isCommandAvailable("gswin64c") {
					gsCmd = "gswin64c"
				}

				args := []string{
					"-dNOPAUSE", "-dBATCH", "-sDEVICE=pdfwrite",
					fmt.Sprintf("-sOutputFile=%s", outputPath),
				}
				args = append(args, pdfFiles...)

				cmd := exec.Command(gsCmd, args...)
				if err := cmd.Run(); err != nil {
					return false, fmt.Errorf("failed to merge PDFs with ghostscript: %w", err)
				}
			} else if h.isCommandAvailable("qpdf") {
				// Build qpdf command
				args := []string{
					"--empty", "--pages",
				}
				args = append(args, pdfFiles...)
				args = append(args, "--", outputPath)

				cmd := exec.Command("qpdf", args...)
				if err := cmd.Run(); err != nil {
					return false, fmt.Errorf("failed to merge PDFs with qpdf: %w", err)
				}
			} else {
				return false, fmt.Errorf("no PDF merging tools available")
			}
		} else if len(pdfFiles) == 1 {
			// Just copy the single PDF
			data, err := os.ReadFile(pdfFiles[0])
			if err != nil {
				return false, fmt.Errorf("failed to read output PDF: %w", err)
			}

			if err := os.WriteFile(outputPath, data, 0644); err != nil {
				return false, fmt.Errorf("failed to write output PDF: %w", err)
			}
		} else {
			return false, fmt.Errorf("no PDF files were created during OCR")
		}

		// Check if output file exists
		if _, err := os.Stat(outputPath); err != nil {
			return false, fmt.Errorf("output file not created: %w", err)
		}

		return true, nil
	}

	// If tesseract not available, check if Python OCR script is available
	if h.isPythonInstalled() {
		fmt.Println("Using Python script for OCR")

		// Try to find Python OCR script
		scriptPath := filepath.Join(h.config.TempDir, "ocr.py")
		if _, err := os.Stat(scriptPath); err != nil {
			// Create a simple Python OCR script if it doesn't exist
			h.createPythonOcrScript(scriptPath)
		}

		// Determine Python executable
		pythonCmd := "python3"
		if !h.isCommandAvailable("python3") {
			pythonCmd = "python"
		}

		// Build arguments
		enhanceArg := ""
		if enhanceScanned {
			enhanceArg = "--enhance"
		}

		// Run Python script
		cmd := exec.Command(
			pythonCmd,
			scriptPath,
			inputPath,
			outputPath,
			language,
			enhanceArg,
		)

		output, err := cmd.CombinedOutput()
		if err != nil {
			return false, fmt.Errorf("Python OCR script failed: %w, output: %s", err, output)
		}

		// Check if output file exists
		if _, err := os.Stat(outputPath); err != nil {
			return false, fmt.Errorf("output file not created: %w", err)
		}

		return true, nil
	}

	return false, fmt.Errorf("no OCR tools available")
}

// extractTextWithOcr extracts text from a PDF using OCR
func (h *OcrHandler) extractTextWithOcr(inputPath, outputPath, language, pageRange, pages string, preserveLayout bool) (string, error) {
	// Create temp directory
	tempDir := filepath.Join(h.config.TempDir, uuid.New().String())
	os.MkdirAll(tempDir, os.ModePerm)
	defer os.RemoveAll(tempDir) // Clean up temp directory

	// Extract pages from PDF
	imagesDir := filepath.Join(tempDir, "images")
	os.MkdirAll(imagesDir, os.ModePerm)

	// Convert PDF pages to images
	cmd := exec.Command("pdftoppm", "-png", "-r", "300", inputPath, filepath.Join(imagesDir, "page"))
	if err := cmd.Run(); err != nil {
		// Fall back to ghostscript if pdftoppm fails
		gsCmd := "gs"
		if h.isCommandAvailable("gswin64c") {
			gsCmd = "gswin64c" // Windows version
		}

		cmd = exec.Command(gsCmd,
			"-sDEVICE=pngalpha",
			"-r300",
			"-dNOPAUSE",
			"-dBATCH",
			fmt.Sprintf("-sOutputFile=%s/page-%%d.png", imagesDir),
			inputPath)

		if err := cmd.Run(); err != nil {
			return "", fmt.Errorf("failed to convert PDF to images: %w", err)
		}
	}

	// Process each image with tesseract to extract text
	files, err := os.ReadDir(imagesDir)
	if err != nil {
		return "", fmt.Errorf("failed to read temp directory: %w", err)
	}

	var textParts []string
	for i, file := range files {
		if strings.HasSuffix(file.Name(), ".png") {
			// Parse page number
			pageNum := i + 1

			// Skip if not in requested page range
			if pageRange == "specific" && pages != "" {
				if !h.isPageInRange(pageNum, pages) {
					continue
				}
			}

			imagePath := filepath.Join(imagesDir, file.Name())
			outBasename := filepath.Join(tempDir, strings.TrimSuffix(file.Name(), ".png"))

			// Build tesseract command
			args := []string{
				imagePath,
				outBasename,
				"-l", language,
				"txt", // Output as text
			}

			if preserveLayout {
				args = append(args, "preserve_interword_spaces")
			}

			cmd := exec.Command("tesseract", args...)
			if err := cmd.Run(); err != nil {
				fmt.Printf("Warning: Tesseract failed for %s: %v\n", file.Name(), err)
				continue
			}

			// Read extracted text
			textFile := outBasename + ".txt"
			if data, err := os.ReadFile(textFile); err == nil {
				// Add page header if multiple pages
				if len(files) > 1 {
					textParts = append(textParts, fmt.Sprintf("==== Page %d ====\n\n%s", pageNum, string(data)))
				} else {
					textParts = append(textParts, string(data))
				}
			}
		}
	}

	if len(textParts) == 0 {
		return "[No text could be extracted]", nil
	}

	return strings.Join(textParts, "\n\n"), nil
}

// isCommandAvailable checks if a command is available
func (h *OcrHandler) isCommandAvailable(command string) bool {
	cmd := exec.Command("which", command)
	if err := cmd.Run(); err != nil {
		// Try Windows 'where' command
		cmd = exec.Command("where", command)
		return cmd.Run() == nil
	}
	return true
}

// isPageInRange checks if a page number is in the specified range
func (h *OcrHandler) isPageInRange(pageNum int, rangeStr string) bool {
	// Split by commas
	parts := strings.Split(rangeStr, ",")

	for _, part := range parts {
		part = strings.TrimSpace(part)

		// Check if it's a range (contains '-')
		if strings.Contains(part, "-") {
			rangeParts := strings.Split(part, "-")
			if len(rangeParts) == 2 {
				start, startErr := h.parsePageNum(rangeParts[0])
				end, endErr := h.parsePageNum(rangeParts[1])

				if startErr == nil && endErr == nil && pageNum >= start && pageNum <= end {
					return true
				}
			}
		} else {
			// Single page number
			num, err := h.parsePageNum(part)
			if err == nil && pageNum == num {
				return true
			}
		}
	}

	return false
}

// parsePageNum parses a page number, handling errors
func (h *OcrHandler) parsePageNum(pageStr string) (int, error) {
	var num int
	_, err := fmt.Sscanf(strings.TrimSpace(pageStr), "%d", &num)
	return num, err
}

// createPythonOcrScript creates a simple Python OCR script
func (h *OcrHandler) createPythonOcrScript(scriptPath string) error {
	script := `#!/usr/bin/env python3
import sys
import os
import subprocess

def main():
    # Check arguments
    if len(sys.argv) < 4:
        print("Usage: ocr.py input_pdf output_pdf language [--enhance]")
        sys.exit(1)
    
    input_pdf = sys.argv[1]
    output_pdf = sys.argv[2]
    language = sys.argv[3]
    enhance = "--enhance" in sys.argv
    
    # Create temp directory
    import tempfile
    tempdir = tempfile.mkdtemp()
    
    try:
        # Extract images from PDF
        image_prefix = os.path.join(tempdir, "page")
        try:
            subprocess.check_call(["pdftoppm", "-png", "-r", "300", input_pdf, image_prefix])
        except:
            # Try ghostscript as fallback
            try:
                import glob
                page_num = 1
                gs_cmd = "gswin64c" if os.name == "nt" else "gs"
                while True:
                    output_image = os.path.join(tempdir, f"page-{page_num}.png")
                    result = subprocess.run(
                        [gs_cmd, "-dQUIET", "-dBATCH", "-dNOPAUSE", "-sDEVICE=pngalpha", "-r300", 
                         f"-dFirstPage={page_num}", f"-dLastPage={page_num}", 
                         f"-sOutputFile={output_image}", input_pdf],
                        stderr=subprocess.PIPE
                    )
                    # Stop when we run out of pages
                    if b"FirstPage greater than LastPage" in result.stderr:
                        break
                    page_num += 1
            except:
                print("Failed to extract images from PDF")
                sys.exit(1)
        
        # Find all extracted images
        images = sorted([f for f in os.listdir(tempdir) if f.endswith(".png")])
        if not images:
            print("No images found in PDF")
            sys.exit(1)
        
        # Process each image with tesseract
        pdf_files = []
        for image in images:
            image_path = os.path.join(tempdir, image)
            basename = os.path.splitext(image)[0]
            output_base = os.path.join(tempdir, basename)
            
            # Run tesseract
            args = [
                "tesseract", image_path, output_base, 
                "-l", language, "pdf"
            ]
            subprocess.call(args)
            
            # Check if PDF was created
            pdf_file = output_base + ".pdf"
            if os.path.exists(pdf_file):
                pdf_files.append(pdf_file)
        
        # Merge PDFs
        if len(pdf_files) == 1:
            # Just copy the single PDF
            with open(pdf_files[0], "rb") as infile, open(output_pdf, "wb") as outfile:
                outfile.write(infile.read())
        elif len(pdf_files) > 1:
            # Try different PDF merge tools
            try:
                # Try pdfunite (poppler-utils)
                args = pdf_files + [output_pdf]
                subprocess.check_call(["pdfunite"] + args)
            except:
                try:
                    # Try ghostscript
                    gs_cmd = "gswin64c" if os.name == "nt" else "gs"
                    args = [gs_cmd, "-dNOPAUSE", "-dBATCH", "-sDEVICE=pdfwrite", f"-sOutputFile={output_pdf}"] + pdf_files
                    subprocess.check_call(args)
                except:
                    try:
                        # Try qpdf
                        args = ["qpdf", "--empty", "--pages"] + pdf_files + ["--", output_pdf]
                        subprocess.check_call(args)
                    except:
                        print("Failed to merge PDFs - no merge tools available")
                        sys.exit(1)
        
        print(f"OCR processing complete. Output saved to {output_pdf}")
    
    finally:
        # Clean up temp directory
        try:
            import shutil
            shutil.rmtree(tempdir)
        except:
            pass

if __name__ == "__main__":
    main()
`

	return os.WriteFile(scriptPath, []byte(script), 0755)
}
