package pdf

import (
	"context"
	"fmt"
	"os"
	"os/exec"
	"path/filepath"

	"megapdf-api/pkg/storage"

	"github.com/google/uuid"
)

// MergeService handles PDF merging
type MergeService struct {
	storage storage.StorageManager
}

// NewMergeService creates a new merge service
func NewMergeService(storage storage.StorageManager) *MergeService {
	return &MergeService{
		storage: storage,
	}
}

// MergeResult contains the result of a merge operation
type MergeResult struct {
	Success        bool
	FilePath       string
	FileURL        string
	MergedSize     int64
	TotalInputSize int64
	FileCount      int
}

// MergePDFs merges multiple PDF files
func (s *MergeService) MergePDFs(ctx context.Context, inputPaths []string, order []int) (*MergeResult, error) {
	if len(inputPaths) < 2 {
		return nil, fmt.Errorf("at least two PDF files are required for merging")
	}

	// Apply ordering if provided
	orderedPaths := make([]string, len(inputPaths))
	if len(order) == len(inputPaths) {
		for i, idx := range order {
			if idx < 0 || idx >= len(inputPaths) {
				return nil, fmt.Errorf("invalid order index: %d", idx)
			}
			orderedPaths[i] = inputPaths[idx]
		}
	} else {
		// Use original order
		copy(orderedPaths, inputPaths)
	}

	// Generate output file path
	uniqueID := uuid.New().String()
	outputDir := s.storage.GetProcessedDir("merges")
	outputPath := filepath.Join(outputDir, fmt.Sprintf("%s-merged.pdf", uniqueID))

	// Calculate total input size
	var totalInputSize int64
	for _, path := range orderedPaths {
		info, err := os.Stat(path)
		if err != nil {
			return nil, fmt.Errorf("failed to get file size for %s: %w", path, err)
		}
		totalInputSize += info.Size()
	}

	// Try to merge with pdfcpu
	err := s.mergeWithPdfcpu(orderedPaths, outputPath)
	if err != nil {
		// Fallback to using Ghostscript if pdfcpu fails
		err = s.mergeWithGhostscript(orderedPaths, outputPath)
		if err != nil {
			return nil, fmt.Errorf("all merge methods failed: %w", err)
		}
	}

	// Check if output file exists
	if _, err := os.Stat(outputPath); os.IsNotExist(err) {
		return nil, fmt.Errorf("merge failed to produce output file")
	}

	// Get merged file size
	mergedFileInfo, err := os.Stat(outputPath)
	if err != nil {
		return nil, fmt.Errorf("failed to get merged file size: %w", err)
	}
	mergedSize := mergedFileInfo.Size()

	// Generate file URL
	fileURL := fmt.Sprintf("/api/file?folder=merges&filename=%s-merged.pdf", uniqueID)

	return &MergeResult{
		Success:        true,
		FilePath:       outputPath,
		FileURL:        fileURL,
		MergedSize:     mergedSize,
		TotalInputSize: totalInputSize,
		FileCount:      len(inputPaths),
	}, nil
}

// mergeWithPdfcpu merges PDFs using pdfcpu
func (s *MergeService) mergeWithPdfcpu(inputPaths []string, outputPath string) error {
	// Handle large merges with a batched approach
	if len(inputPaths) > 10 {
		return s.mergeWithPdfcpuBatched(inputPaths, outputPath)
	}

	// Build pdfcpu command, where outputPath comes first followed by input files
	args := []string{"merge", outputPath}
	args = append(args, inputPaths...)

	cmd := exec.Command("pdfcpu", args...)
	output, err := cmd.CombinedOutput()
	if err != nil {
		return fmt.Errorf("pdfcpu merge failed: %w\nOutput: %s", err, output)
	}

	return nil
}

// mergeWithPdfcpuBatched merges large numbers of PDFs in batches to avoid command line length limits
func (s *MergeService) mergeWithPdfcpuBatched(inputPaths []string, outputPath string) error {
	// Create a temporary directory for intermediate merges
	tempDir := filepath.Join(os.TempDir(), fmt.Sprintf("merge-temp-%s", uuid.New().String()))
	if err := os.MkdirAll(tempDir, 0755); err != nil {
		return fmt.Errorf("failed to create temp directory: %w", err)
	}
	defer os.RemoveAll(tempDir)

	// Split into batches of 5 files
	const batchSize = 5
	var tempFiles []string

	// Process each batch
	for i := 0; i < len(inputPaths); i += batchSize {
		end := i + batchSize
		if end > len(inputPaths) {
			end = len(inputPaths)
		}

		batchFiles := inputPaths[i:end]
		batchOutputPath := filepath.Join(tempDir, fmt.Sprintf("batch-%d.pdf", i/batchSize))

		// Merge this batch
		args := []string{"merge", batchOutputPath}
		args = append(args, batchFiles...)

		cmd := exec.Command("pdfcpu", args...)
		output, err := cmd.CombinedOutput()
		if err != nil {
			return fmt.Errorf("batch merge failed: %w\nOutput: %s", err, output)
		}

		tempFiles = append(tempFiles, batchOutputPath)
	}

	// Final merge of all batches
	args := []string{"merge", outputPath}
	args = append(args, tempFiles...)

	cmd := exec.Command("pdfcpu", args...)
	output, err := cmd.CombinedOutput()
	if err != nil {
		return fmt.Errorf("final merge failed: %w\nOutput: %s", err, output)
	}

	return nil
}

// mergeWithGhostscript merges PDFs using Ghostscript
func (s *MergeService) mergeWithGhostscript(inputPaths []string, outputPath string) error {
	// Determine Ghostscript executable name based on platform
	gsCmd := "gs"
	if isWindows() {
		gsCmd = "gswin64c"
	}

	// Build Ghostscript command
	args := []string{
		"-q",
		"-dNOPAUSE",
		"-dBATCH",
		"-sDEVICE=pdfwrite",
		"-sOutputFile=" + outputPath,
	}
	args = append(args, inputPaths...)

	cmd := exec.Command(gsCmd, args...)
	output, err := cmd.CombinedOutput()
	if err != nil {
		return fmt.Errorf("ghostscript merge failed: %w\nOutput: %s", err, output)
	}

	return nil
}
