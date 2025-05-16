package pdf

import (
	"errors"
	"io"
	"os"
	"os/exec"
	"path/filepath"
	"strings"

	"github.com/google/uuid"
)

// ConvertWithLibreOffice converts a file using LibreOffice
func (c *Commander) ConvertWithLibreOffice(inputPath, outputPath, format string) error {
	// Create a temporary directory for the conversion
	tempDir := filepath.Join(filepath.Dir(inputPath), uuid.New().String())
	if err := os.MkdirAll(tempDir, 0755); err != nil {
		return err
	}
	defer os.RemoveAll(tempDir)

	// Copy the input file to the temp directory
	tempInputPath := filepath.Join(tempDir, filepath.Base(inputPath))
	if err := copyFile(inputPath, tempInputPath); err != nil {
		return err
	}

	// Handle specific conversions
	if filepath.Ext(inputPath) == ".pdf" && format == "xlsx" {
		// PDF to Excel is challenging - try a multi-stage approach
		return c.convertPdfToExcel(tempInputPath, outputPath, tempDir)
	}

	// Standard LibreOffice conversion
	result := c.ExecuteLibreOffice(
		"--headless",
		"--convert-to", format,
		"--outdir", tempDir,
		tempInputPath,
	)

	if !result.Success {
		// Try alternative approaches based on specific formats
		if filepath.Ext(inputPath) == ".pdf" {
			// PDF conversions often need special handling
			switch format {
			case "docx":
				return c.convertPdfToDocx(tempInputPath, outputPath, tempDir)
			case "pptx":
				return c.convertPdfToPptx(tempInputPath, outputPath, tempDir)
			}
		}

		return errors.New("libreoffice conversion failed: " + result.Stderr)
	}

	// Find the generated file
	files, err := filepath.Glob(filepath.Join(tempDir, "*."+format))
	if err != nil {
		return err
	}

	if len(files) == 0 {
		return errors.New("conversion did not produce the expected output file")
	}

	// Copy the converted file to the output path
	if err := copyFile(files[0], outputPath); err != nil {
		return err
	}

	return nil
}

// convertPdfToExcel handles PDF to Excel conversion with multiple strategies
func (c *Commander) convertPdfToExcel(inputPath, outputPath, tempDir string) error {
	// Strategy 1: Try to extract tables to CSV first
	if c.IsToolAvailable("pdftotext") {
		csvPath := filepath.Join(tempDir, "extracted.csv")
		cmd := exec.Command("pdftotext", "-table", "-csv", inputPath, csvPath)

		if err := cmd.Run(); err == nil && fileExists(csvPath) {
			// Convert CSV to XLSX
			result := c.ExecuteLibreOffice(
				"--headless",
				"--convert-to", "xlsx:Calc MS Excel 2007 XML",
				"--outdir", tempDir,
				csvPath,
			)

			if result.Success {
				xlsxPath := filepath.Join(tempDir, "extracted.xlsx")
				if fileExists(xlsxPath) {
					return copyFile(xlsxPath, outputPath)
				}
			}
		}
	}

	// Strategy 2: Two-step conversion via HTML
	htmlPath := filepath.Join(tempDir, "intermediate.html")
	result := c.ExecuteLibreOffice(
		"--headless",
		"--convert-to", "html",
		"--outdir", tempDir,
		inputPath,
	)

	if result.Success {
		// Find the generated HTML file
		htmlFiles, _ := filepath.Glob(filepath.Join(tempDir, "*.html"))
		if len(htmlFiles) > 0 {
			// Convert HTML to XLSX
			result := c.ExecuteLibreOffice(
				"--headless",
				"--convert-to", "xlsx:Calc MS Excel 2007 XML",
				"--outdir", tempDir,
				htmlFiles[0],
			)

			if result.Success {
				xlsxFiles, _ := filepath.Glob(filepath.Join(tempDir, "*.xlsx"))
				if len(xlsxFiles) > 0 {
					return copyFile(xlsxFiles[0], outputPath)
				}
			}
		}
	}

	// Strategy 3: Direct conversion (often fails but worth trying)
	result = c.ExecuteLibreOffice(
		"--headless",
		"--convert-to", "xlsx",
		"--outdir", tempDir,
		inputPath,
	)

	if result.Success {
		xlsxFiles, _ := filepath.Glob(filepath.Join(tempDir, "*.xlsx"))
		if len(xlsxFiles) > 0 {
			return copyFile(xlsxFiles[0], outputPath)
		}
	}

	// If all strategies failed, create a minimal XLSX
	return createMinimalXLSX(outputPath)
}

// convertPdfToDocx handles PDF to Word conversion with special filters
func (c *Commander) convertPdfToDocx(inputPath, outputPath, tempDir string) error {
	// Try with specific PDF import filter
	result := c.ExecuteLibreOffice(
		"--headless",
		"--infilter=writer_pdf_import",
		"--convert-to", "docx:MS Word 2007 XML",
		"--outdir", tempDir,
		inputPath,
	)

	if result.Success {
		docxFiles, _ := filepath.Glob(filepath.Join(tempDir, "*.docx"))
		if len(docxFiles) > 0 {
			return copyFile(docxFiles[0], outputPath)
		}
	}

	// Fallback to generic conversion
	result = c.ExecuteLibreOffice(
		"--headless",
		"--convert-to", "docx",
		"--outdir", tempDir,
		inputPath,
	)

	if result.Success {
		docxFiles, _ := filepath.Glob(filepath.Join(tempDir, "*.docx"))
		if len(docxFiles) > 0 {
			return copyFile(docxFiles[0], outputPath)
		}
	}

	return errors.New("failed to convert PDF to DOCX")
}

// convertPdfToPptx handles PDF to PowerPoint conversion with special filters
func (c *Commander) convertPdfToPptx(inputPath, outputPath, tempDir string) error {
	// Try with specific PDF import filter
	result := c.ExecuteLibreOffice(
		"--headless",
		"--infilter=impress_pdf_import",
		"--convert-to", "pptx:Impress MS PowerPoint 2007 XML",
		"--outdir", tempDir,
		inputPath,
	)

	if result.Success {
		pptxFiles, _ := filepath.Glob(filepath.Join(tempDir, "*.pptx"))
		if len(pptxFiles) > 0 {
			return copyFile(pptxFiles[0], outputPath)
		}
	}

	// Fallback to generic conversion
	result = c.ExecuteLibreOffice(
		"--headless",
		"--convert-to", "pptx",
		"--outdir", tempDir,
		inputPath,
	)

	if result.Success {
		pptxFiles, _ := filepath.Glob(filepath.Join(tempDir, "*.pptx"))
		if len(pptxFiles) > 0 {
			return copyFile(pptxFiles[0], outputPath)
		}
	}

	return errors.New("failed to convert PDF to PPTX")
}

// Helper function to create a minimal XLSX
func createMinimalXLSX(outputPath string) error {
	// This is just a placeholder - would need a library like excelize in a real implementation
	return errors.New("creating minimal XLSX not implemented")
}

// Helper function to copy a file
func copyFile(src, dst string) error {
	source, err := os.Open(src)
	if err != nil {
		return err
	}
	defer source.Close()

	destination, err := os.Create(dst)
	if err != nil {
		return err
	}
	defer destination.Close()

	_, err = io.Copy(destination, source)
	return err
}

// Helper function to check if a file exists
func fileExists(path string) bool {
	_, err := os.Stat(path)
	return err == nil
}

// Helper function to check if a format is an image format
func isImageFormat(format string) bool {
	format = strings.ToLower(format)
	return format == "jpg" || format == "jpeg" || format == "png" || format == "gif" || format == "tiff"
}
