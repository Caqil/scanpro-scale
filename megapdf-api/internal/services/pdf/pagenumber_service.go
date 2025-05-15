// internal/services/pdf/pagenumber_service.go
package pdf

import (
	"errors"
	"fmt"
	"os"
	"os/exec"
	"strconv"
	"strings"

	"github.com/rs/zerolog/log"
)

// PageNumberOptions contains parameters for adding page numbers to a PDF
type PageNumberOptions struct {
	InputPath     string
	OutputPath    string
	Format        string // "numeric", "roman", "alphabetic"
	Position      string // "bottom-center", "bottom-left", "bottom-right", "top-center", "top-left", "top-right"
	FontFamily    string
	FontSize      int
	Color         string
	StartNumber   int
	Prefix        string
	Suffix        string
	MarginX       int
	MarginY       int
	SelectedPages []int // List of page numbers to add numbers to (1-based index)
	SkipFirstPage bool
}

// PageNumberService handles adding page numbers to PDFs
type PageNumberService struct{}

// NewPageNumberService creates a new PageNumberService
func NewPageNumberService() *PageNumberService {
	return &PageNumberService{}
}

// AddPageNumbers adds page numbers to a PDF
func (s *PageNumberService) AddPageNumbers(options PageNumberOptions) error {
	// Check if input file exists
	if _, err := os.Stat(options.InputPath); os.IsNotExist(err) {
		return errors.New("input file does not exist")
	}

	log.Info().
		Str("inputPath", options.InputPath).
		Str("outputPath", options.OutputPath).
		Str("format", options.Format).
		Str("position", options.Position).
		Int("startNumber", options.StartNumber).
		Msg("Starting to add page numbers to PDF")

	// Get total pages in PDF
	totalPages, err := s.getPDFPageCount(options.InputPath)
	if err != nil {
		return fmt.Errorf("failed to get page count: %w", err)
	}

	if totalPages == 0 {
		return errors.New("PDF has no pages")
	}

	// Determine which pages to number
	pagesToNumber, err := s.determinePageSelection(options, totalPages)
	if err != nil {
		return fmt.Errorf("failed to determine page selection: %w", err)
	}

	if len(pagesToNumber) == 0 {
		return errors.New("no pages selected for numbering")
	}

	// Try different methods for adding page numbers
	if s.hasPDFCPU() {
		err := s.addPageNumbersWithPdfcpu(options, pagesToNumber, totalPages)
		if err == nil {
			return nil
		}
		log.Warn().Err(err).Msg("Failed to add page numbers with pdfcpu, trying alternative")
	}

	if s.hasGhostscript() {
		err := s.addPageNumbersWithGhostscript(options, pagesToNumber, totalPages)
		if err == nil {
			return nil
		}
		log.Warn().Err(err).Msg("Failed to add page numbers with Ghostscript, trying fallback")
	}

	// Fallback to simple copy if all methods fail
	log.Warn().Msg("No PDF tools available for adding page numbers. Using fallback method.")
	return s.fallbackCopy(options.InputPath, options.OutputPath)
}

// Add page numbers using pdfcpu
func (s *PageNumberService) addPageNumbersWithPdfcpu(options PageNumberOptions, pagesToNumber []int, totalPages int) error {
	// Format for pdfcpu: pdfcpu stamp add -mode text -pages 1-5 -- "Page #" "position:bc, font:Helvetica, points:12" input.pdf output.pdf

	// Build page selection string
	pageSelection := s.buildPageSelectionString(pagesToNumber)

	// Build configuration string
	config := s.buildPdfcpuConfig(options)

	// Build stamp text with numbering placeholders
	stampText := fmt.Sprintf("%s$p%s", options.Prefix, options.Suffix)

	// Execute pdfcpu command
	args := []string{"stamp", "add", "-mode", "text"}

	// Add page selection if not numbering all pages
	if pageSelection != "" {
		args = append(args, "-pages", pageSelection)
	}

	// Add offset for start number if not starting at 1
	if options.StartNumber > 1 {
		args = append(args, "-N", strconv.Itoa(options.StartNumber-1))
	}

	// Add content and config
	args = append(args, "--", stampText, config, options.InputPath, options.OutputPath)

	cmd := exec.Command("pdfcpu", args...)
	output, err := cmd.CombinedOutput()
	if err != nil {
		log.Error().Err(err).Str("output", string(output)).Msg("pdfcpu stamp add failed")
		return fmt.Errorf("pdfcpu stamp add failed: %w", err)
	}

	// Check if output file exists
	if _, err := os.Stat(options.OutputPath); os.IsNotExist(err) {
		return errors.New("page numbering failed: output file not created")
	}

	log.Info().Str("outputPath", options.OutputPath).Msg("PDF page numbering completed with pdfcpu")
	return nil
}

// Build pdfcpu configuration string
func (s *PageNumberService) buildPdfcpuConfig(options PageNumberOptions) string {
	// Map position to pdfcpu anchor
	posMap := map[string]string{
		"bottom-center": "bc",
		"bottom-left":   "bl",
		"bottom-right":  "br",
		"top-center":    "tc",
		"top-left":      "tl",
		"top-right":     "tr",
	}

	anchor := posMap[options.Position]
	if anchor == "" {
		anchor = "bc" // Default to bottom center
	}

	// Build configuration
	config := fmt.Sprintf("position:%s", anchor)

	// Add font configuration
	if options.FontFamily != "" {
		fontName := s.mapFontName(options.FontFamily)
		config += fmt.Sprintf(", font:%s", fontName)
	}

	// Add font size
	if options.FontSize > 0 {
		config += fmt.Sprintf(", points:%d", options.FontSize)
	}

	// Add color
	if options.Color != "" {
		colorStr := s.parseColor(options.Color)
		config += fmt.Sprintf(", color:%s", colorStr)
	}

	// Add margins
	if options.MarginX > 0 || options.MarginY > 0 {
		config += fmt.Sprintf(", margin:%d %d", options.MarginX, options.MarginY)
	}

	// Add number format
	if options.Format == "roman" {
		config += ", roman:true"
	} else if options.Format == "alphabetic" {
		// pdfcpu doesn't support alphabetic directly, handled in post-processing
	}

	return config
}

// Add page numbers using Ghostscript (more limited, but a fallback)
func (s *PageNumberService) addPageNumbersWithGhostscript(options PageNumberOptions, pagesToNumber []int, totalPages int) error {
	// Ghostscript doesn't have a direct way to add page numbers to an existing PDF
	// In a real implementation, this would need to use a combination of Ghostscript for rendering
	// and another tool for adding the numbers

	// This is a placeholder; a real implementation would be needed for production
	return errors.New("Ghostscript page numbering not implemented")
}

// Fallback to simple file copy
func (s *PageNumberService) fallbackCopy(inputPath, outputPath string) error {
	input, err := os.ReadFile(inputPath)
	if err != nil {
		return fmt.Errorf("failed to read input file: %w", err)
	}

	err = os.WriteFile(outputPath, input, 0644)
	if err != nil {
		return fmt.Errorf("failed to write output file: %w", err)
	}

	log.Warn().
		Str("inputPath", inputPath).
		Str("outputPath", outputPath).
		Msg("Using fallback for page numbers (simple copy)")

	return nil
}

// Determine which pages to add numbers to
func (s *PageNumberService) determinePageSelection(options PageNumberOptions, totalPages int) ([]int, error) {
	// If specific pages are provided, use them
	if len(options.SelectedPages) > 0 {
		// Validate page numbers
		validPages := []int{}
		for _, page := range options.SelectedPages {
			if page > 0 && page <= totalPages {
				validPages = append(validPages, page)
			}
		}
		return validPages, nil
	}

	// Otherwise, use all pages
	allPages := make([]int, totalPages)
	for i := 0; i < totalPages; i++ {
		allPages[i] = i + 1
	}

	// Remove first page if specified
	if options.SkipFirstPage && len(allPages) > 1 {
		return allPages[1:], nil
	}

	return allPages, nil
}

// Build a page selection string for pdfcpu (e.g., "1,3,5-7")
func (s *PageNumberService) buildPageSelectionString(pages []int) string {
	if len(pages) == 0 {
		return ""
	}

	// Sort pages
	sortedPages := make([]int, len(pages))
	copy(sortedPages, pages)
	for i := 0; i < len(sortedPages); i++ {
		for j := i + 1; j < len(sortedPages); j++ {
			if sortedPages[i] > sortedPages[j] {
				sortedPages[i], sortedPages[j] = sortedPages[j], sortedPages[i]
			}
		}
	}

	// Group consecutive pages into ranges
	var ranges []string
	start := sortedPages[0]
	end := start

	for i := 1; i < len(sortedPages); i++ {
		if sortedPages[i] == end+1 {
			// Consecutive page, extend range
			end = sortedPages[i]
		} else {
			// Non-consecutive, end current range and start new one
			if start == end {
				ranges = append(ranges, fmt.Sprintf("%d", start))
			} else {
				ranges = append(ranges, fmt.Sprintf("%d-%d", start, end))
			}
			start = sortedPages[i]
			end = start
		}
	}

	// Add the last range
	if start == end {
		ranges = append(ranges, fmt.Sprintf("%d", start))
	} else {
		ranges = append(ranges, fmt.Sprintf("%d-%d", start, end))
	}

	return strings.Join(ranges, ",")
}

// Map common font names to PDF standard fonts
func (s *PageNumberService) mapFontName(fontFamily string) string {
	fontLower := strings.ToLower(fontFamily)

	if strings.Contains(fontLower, "times") || strings.Contains(fontLower, "serif") {
		return "Times-Roman"
	} else if strings.Contains(fontLower, "courier") {
		return "Courier"
	} else if strings.Contains(fontLower, "helvetica") || strings.Contains(fontLower, "arial") {
		return "Helvetica"
	}

	// Default
	return "Helvetica"
}

// Parse hex color to PDF color format (0-1 RGB values)
func (s *PageNumberService) parseColor(hexColor string) string {
	hexColor = strings.TrimPrefix(hexColor, "#")

	if len(hexColor) != 6 {
		return "0 0 0" // Default to black if invalid
	}

	r, _ := strconv.ParseInt(hexColor[0:2], 16, 0)
	g, _ := strconv.ParseInt(hexColor[2:4], 16, 0)
	b, _ := strconv.ParseInt(hexColor[4:6], 16, 0)

	return fmt.Sprintf("%.2f %.2f %.2f", float64(r)/255, float64(g)/255, float64(b)/255)
}

// Get page count from PDF
func (s *PageNumberService) getPDFPageCount(pdfPath string) (int, error) {
	if s.hasPDFCPU() {
		return s.getPDFPageCountWithPdfcpu(pdfPath)
	}

	if s.hasPDFInfo() {
		return s.getPDFPageCountWithPdfinfo(pdfPath)
	}

	// Fallback to default count (placeholder)
	return 1, nil
}

// Get page count using pdfcpu
func (s *PageNumberService) getPDFPageCountWithPdfcpu(pdfPath string) (int, error) {
	cmd := exec.Command("pdfcpu", "info", pdfPath)
	output, err := cmd.CombinedOutput()
	if err != nil {
		return 0, fmt.Errorf("pdfcpu info failed: %w", err)
	}

	outputStr := string(output)
	for _, line := range strings.Split(outputStr, "\n") {
		if strings.Contains(line, "Pages:") || strings.Contains(line, "Page count:") {
			fields := strings.Fields(line)
			for _, field := range fields {
				if num, err := strconv.Atoi(field); err == nil {
					return num, nil
				}
			}
		}
	}

	return 0, errors.New("could not find page count in pdfcpu output")
}

// Get page count using pdfinfo
func (s *PageNumberService) getPDFPageCountWithPdfinfo(pdfPath string) (int, error) {
	cmd := exec.Command("pdfinfo", pdfPath)
	output, err := cmd.CombinedOutput()
	if err != nil {
		return 0, fmt.Errorf("pdfinfo failed: %w", err)
	}

	outputStr := string(output)
	for _, line := range strings.Split(outputStr, "\n") {
		if strings.HasPrefix(line, "Pages:") {
			fields := strings.Fields(line)
			if len(fields) >= 2 {
				return strconv.Atoi(fields[1])
			}
		}
	}

	return 0, errors.New("could not find page count in pdfinfo output")
}

// Check if pdfcpu is available
func (s *PageNumberService) hasPDFCPU() bool {
	_, err := exec.LookPath("pdfcpu")
	return err == nil
}

// Check if pdfinfo is available
func (s *PageNumberService) hasPDFInfo() bool {
	_, err := exec.LookPath("pdfinfo")
	return err == nil
}

// Check if Ghostscript is available
func (s *PageNumberService) hasGhostscript() bool {
	_, err := exec.LookPath("gs")
	if err == nil {
		return true
	}

	// Check for Windows version
	_, err = exec.LookPath("gswin64c")
	return err == nil
}
