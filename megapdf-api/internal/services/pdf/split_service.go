// internal/services/pdf/split_service.go
package pdf

import (
	"encoding/json"
	"errors"
	"fmt"
	"os"
	"os/exec"
	"path/filepath"
	"strconv"
	"strings"
	"time"

	"github.com/rs/zerolog/log"
)

// SplitOptions contains parameters for PDF splitting operations
type SplitOptions struct {
	InputPath   string
	OutputDir   string
	Method      string // "range", "extract", "every"
	PageRanges  []string
	EveryNPages int
	SessionID   string
	StatusPath  string
}

// SplitResult represents the result of a split operation
type SplitResult struct {
	FileURL   string
	Filename  string
	Pages     []int
	PageCount int
}

// SplitJobStatus represents the status of a split job
type SplitJobStatus struct {
	ID        string        `json:"id"`
	Status    string        `json:"status"` // "processing", "completed", "error"
	Progress  int           `json:"progress"`
	Total     int           `json:"total"`
	Completed int           `json:"completed"`
	Results   []SplitResult `json:"results"`
	Error     string        `json:"error,omitempty"`
}

// SplitService handles PDF splitting operations
type SplitService struct{}

// NewSplitService creates a new SplitService
func NewSplitService() *SplitService {
	return &SplitService{}
}

// Split divides a PDF into multiple files
func (s *SplitService) Split(options SplitOptions) ([]SplitResult, error) {
	// Check if input file exists
	if _, err := os.Stat(options.InputPath); os.IsNotExist(err) {
		return nil, errors.New("input file does not exist")
	}

	log.Info().
		Str("inputPath", options.InputPath).
		Str("outputDir", options.OutputDir).
		Str("method", options.Method).
		Msg("Starting PDF split")

	// Create output directory if it doesn't exist
	if _, err := os.Stat(options.OutputDir); os.IsNotExist(err) {
		if err := os.MkdirAll(options.OutputDir, 0755); err != nil {
			return nil, fmt.Errorf("failed to create output directory: %w", err)
		}
	}

	// Get total pages in PDF
	totalPages, err := s.getPDFPageCount(options.InputPath)
	if err != nil {
		return nil, fmt.Errorf("failed to get page count: %w", err)
	}

	if totalPages == 0 {
		return nil, errors.New("PDF has no pages")
	}

	// Select splitting method
	switch options.Method {
	case "range":
		return s.splitByRange(options, totalPages)
	case "extract":
		return s.splitByPage(options, totalPages)
	case "every":
		return s.splitByNumber(options, totalPages)
	default:
		return s.splitByRange(options, totalPages) // Default to range
	}
}

// Split PDF by page ranges
func (s *SplitService) splitByRange(options SplitOptions, totalPages int) ([]SplitResult, error) {
	results := []SplitResult{}

	// Parse each range and extract pages
	for i, pageRange := range options.PageRanges {
		// Parse page range
		pages, err := s.parsePageRange(pageRange, totalPages)
		if err != nil {
			log.Error().Err(err).Str("range", pageRange).Msg("Failed to parse page range")
			continue
		}

		if len(pages) == 0 {
			continue
		}

		// Build output filename
		outputFilename := fmt.Sprintf("%s-split-%d.pdf", options.SessionID, i+1)
		outputPath := filepath.Join(options.OutputDir, outputFilename)

		// Extract the specified pages
		err = s.extractPages(options.InputPath, outputPath, pages)
		if err != nil {
			log.Error().Err(err).Str("range", pageRange).Msg("Failed to extract pages")
			continue
		}

		// Add result
		fileURL := fmt.Sprintf("/api/file?folder=splits&filename=%s", outputFilename)
		results = append(results, SplitResult{
			FileURL:   fileURL,
			Filename:  outputFilename,
			Pages:     pages,
			PageCount: len(pages),
		})

		// Update status if provided
		if options.StatusPath != "" {
			s.updateStatus(options.StatusPath, options.SessionID, "processing", i+1, len(options.PageRanges), results)
		}
	}

	return results, nil
}

// Split PDF by extracting each page
func (s *SplitService) splitByPage(options SplitOptions, totalPages int) ([]SplitResult, error) {
	results := []SplitResult{}

	// Extract each page individually
	for i := 1; i <= totalPages; i++ {
		// Build output filename
		outputFilename := fmt.Sprintf("%s-split-%d.pdf", options.SessionID, i)
		outputPath := filepath.Join(options.OutputDir, outputFilename)

		// Extract the single page
		err := s.extractPages(options.InputPath, outputPath, []int{i})
		if err != nil {
			log.Error().Err(err).Int("page", i).Msg("Failed to extract page")
			continue
		}

		// Add result
		fileURL := fmt.Sprintf("/api/file?folder=splits&filename=%s", outputFilename)
		results = append(results, SplitResult{
			FileURL:   fileURL,
			Filename:  outputFilename,
			Pages:     []int{i},
			PageCount: 1,
		})

		// Update status periodically
		if options.StatusPath != "" && i%5 == 0 {
			s.updateStatus(options.StatusPath, options.SessionID, "processing", i, totalPages, results)
		}
	}

	return results, nil
}

// Split PDF into chunks of N pages each
func (s *SplitService) splitByNumber(options SplitOptions, totalPages int) ([]SplitResult, error) {
	results := []SplitResult{}
	n := options.EveryNPages
	if n <= 0 {
		n = 1 // Default to 1 page per file
	}

	// Calculate number of output files
	fileCount := (totalPages + n - 1) / n

	// Extract pages in chunks
	for i := 0; i < fileCount; i++ {
		// Calculate page range for this chunk
		startPage := i*n + 1
		endPage := (i + 1) * n
		if endPage > totalPages {
			endPage = totalPages
		}

		// Build page list
		pages := make([]int, endPage-startPage+1)
		for j := 0; j < len(pages); j++ {
			pages[j] = startPage + j
		}

		// Build output filename
		outputFilename := fmt.Sprintf("%s-split-%d.pdf", options.SessionID, i+1)
		outputPath := filepath.Join(options.OutputDir, outputFilename)

		// Extract the pages
		err := s.extractPages(options.InputPath, outputPath, pages)
		if err != nil {
			log.Error().Err(err).Ints("pages", pages).Msg("Failed to extract pages")
			continue
		}

		// Add result
		fileURL := fmt.Sprintf("/api/file?folder=splits&filename=%s", outputFilename)
		results = append(results, SplitResult{
			FileURL:   fileURL,
			Filename:  outputFilename,
			Pages:     pages,
			PageCount: len(pages),
		})

		// Update status
		if options.StatusPath != "" {
			s.updateStatus(options.StatusPath, options.SessionID, "processing", i+1, fileCount, results)
		}
	}

	return results, nil
}

// Extract specified pages from PDF using pdfcpu
func (s *SplitService) extractPages(inputPath, outputPath string, pages []int) error {
	// Build page selection string
	pageSelection := s.buildPageSelectionString(pages)

	// Use pdfcpu to extract pages
	// Format: pdfcpu collect -pages <selection> <input.pdf> <output.pdf>
	cmd := exec.Command("pdfcpu", "collect", "-pages", pageSelection, inputPath, outputPath)
	output, err := cmd.CombinedOutput()
	if err != nil {
		log.Error().Err(err).Str("output", string(output)).Msg("pdfcpu collect failed")
		return fmt.Errorf("pdfcpu collect failed: %w", err)
	}

	// Check if output file exists
	if _, err := os.Stat(outputPath); os.IsNotExist(err) {
		return errors.New("extraction failed: output file not created")
	}

	return nil
}

// Parse page range string (e.g., "1,3,5-10")
func (s *SplitService) parsePageRange(pageRange string, totalPages int) ([]int, error) {
	pages := []int{}

	// Split by commas
	parts := strings.Split(pageRange, ",")

	for _, part := range parts {
		trimmedPart := strings.TrimSpace(part)
		if trimmedPart == "" {
			continue
		}

		// Check if it's a range (contains '-')
		if strings.Contains(trimmedPart, "-") {
			rangeParts := strings.Split(trimmedPart, "-")
			if len(rangeParts) == 2 {
				start, startErr := strconv.Atoi(strings.TrimSpace(rangeParts[0]))
				end, endErr := strconv.Atoi(strings.TrimSpace(rangeParts[1]))

				if startErr == nil && endErr == nil && start <= end {
					// Add all pages in range
					for i := start; i <= end; i++ {
						if i > 0 && i <= totalPages && !contains(pages, i) {
							pages = append(pages, i)
						}
					}
				} else {
					return nil, fmt.Errorf("invalid page range: %s", trimmedPart)
				}
			} else {
				return nil, fmt.Errorf("invalid page range format: %s", trimmedPart)
			}
		} else {
			// Single page number
			page, err := strconv.Atoi(trimmedPart)
			if err == nil && page > 0 && page <= totalPages && !contains(pages, page) {
				pages = append(pages, page)
			} else if err != nil {
				return nil, fmt.Errorf("invalid page number: %s", trimmedPart)
			}
		}
	}

	return pages, nil
}

// Build a page selection string for pdfcpu (e.g., "1,3,5-7")
func (s *SplitService) buildPageSelectionString(pages []int) string {
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

// Get page count using pdfcpu
func (s *SplitService) getPDFPageCount(pdfPath string) (int, error) {
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

// Update status file for long-running split jobs
func (s *SplitService) updateStatus(statusPath, jobID, status string, completed, total int, results []SplitResult) error {
	progress := 0
	if total > 0 {
		progress = (completed * 100) / total
	}

	jobStatus := SplitJobStatus{
		ID:        jobID,
		Status:    status,
		Progress:  progress,
		Total:     total,
		Completed: completed,
		Results:   results,
	}

	// Create status directory if it doesn't exist
	statusDir := filepath.Dir(statusPath)
	if _, err := os.Stat(statusDir); os.IsNotExist(err) {
		if err := os.MkdirAll(statusDir, 0755); err != nil {
			return fmt.Errorf("failed to create status directory: %w", err)
		}
	}

	// Marshal status to JSON
	statusJSON, err := json.Marshal(jobStatus)
	if err != nil {
		return fmt.Errorf("failed to marshal status: %w", err)
	}

	// Write status file
	if err := os.WriteFile(statusPath, statusJSON, 0644); err != nil {
		return fmt.Errorf("failed to write status file: %w", err)
	}

	return nil
}

// Get split job status
func (s *SplitService) GetJobStatus(statusPath string) (SplitJobStatus, error) {
	var status SplitJobStatus

	// Check if status file exists
	if _, err := os.Stat(statusPath); os.IsNotExist(err) {
		return status, fmt.Errorf("job status file not found: %w", err)
	}

	// Read status file
	statusJSON, err := os.ReadFile(statusPath)
	if err != nil {
		return status, fmt.Errorf("failed to read status file: %w", err)
	}

	// Unmarshal status
	if err := json.Unmarshal(statusJSON, &status); err != nil {
		return status, fmt.Errorf("failed to parse status file: %w", err)
	}

	return status, nil
}

// Helper function to check if a slice contains a value
func contains(slice []int, value int) bool {
	for _, item := range slice {
		if item == value {
			return true
		}
	}
	return false
}

// ProcessSplitInBackground processes a split job in the background
func (s *SplitService) ProcessSplitInBackground(options SplitOptions) {
	go func() {
		// Update status to processing
		s.updateStatus(options.StatusPath, options.SessionID, "processing", 0, 0, nil)

		// Perform the split
		results, err := s.Split(options)

		// Update final status
		if err != nil {
			// Update status to error
			errStatus := SplitJobStatus{
				ID:      options.SessionID,
				Status:  "error",
				Error:   err.Error(),
				Results: results,
			}
			statusJSON, _ := json.Marshal(errStatus)
			os.WriteFile(options.StatusPath, statusJSON, 0644)
		} else {
			// Update status to completed
			s.updateStatus(options.StatusPath, options.SessionID, "completed", len(results), len(results), results)
		}

		// Schedule status file cleanup after some time
		time.AfterFunc(5*time.Minute, func() {
			os.Remove(options.StatusPath)
		})
	}()
}
