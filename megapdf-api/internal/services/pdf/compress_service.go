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

// CompressionOptions contains options for PDF compression
type CompressionOptions struct {
	Quality string // "low", "medium", "high"
}

// CompressService handles PDF compression
type CompressService struct {
	storage storage.StorageManager
}

// NewCompressService creates a new compression service
func NewCompressService(storage storage.StorageManager) *CompressService {
	return &CompressService{
		storage: storage,
	}
}

// CompressResult contains the result of a compression operation
type CompressResult struct {
	Success        bool
	FilePath       string
	FileURL        string
	OriginalSize   int64
	CompressedSize int64
	CompressionRatio float64
}

// CompressPDF compresses a PDF file
func (s *CompressService) CompressPDF(ctx context.Context, inputPath string, options CompressionOptions) (*CompressResult, error) {
	// Generate output file path
	uniqueID := uuid.New().String()
	outputDir := s.storage.GetProcessedDir("compressions")
	outputPath := filepath.Join(outputDir, fmt.Sprintf("%s-compressed.pdf", uniqueID))

	// Get original file size
	originalFileInfo, err := os.Stat(inputPath)
	if err != nil {
		return nil, fmt.Errorf("failed to get original file size: %w", err)
	}
	originalSize := originalFileInfo.Size()

	// Determine compression level based on quality
	compressionLevel := "-dPDFSETTINGS=/default" // Medium quality (default)
	switch options.Quality {
	case "low":
		compressionLevel = "-dPDFSETTINGS=/ebook"
	case "high":
		compressionLevel = "-dPDFSETTINGS=/prepress"
	}

	// Try first with pdfcpu (more modern approach)
	err = s.compressWithPdfcpu(inputPath, outputPath)
	if err != nil {
		// Fallback to Ghostscript if pdfcpu fails
		err = s.compressWithGhostscript(inputPath, outputPath, compressionLevel)
		if err != nil {
			return nil, fmt.Errorf("compression failed: %w", err)
		}
	}

	// Check if output file exists
	if _, err := os.Stat(outputPath); os.IsNotExist(err) {
		return nil, fmt.Errorf("compression failed to produce output file")
	}

	// Get compressed file size
	compressedFileInfo, err := os.Stat(outputPath)
	if err != nil {
		return nil, fmt.Errorf("failed to get compressed file size: %w", err)
	}
	compressedSize := compressedFileInfo.Size()

	// If compressed file is larger than original, use the original
	if compressedSize >= originalSize {
		// Copy original file to output path
		err = copyFile(inputPath, outputPath)
		if err != nil {
			return nil, fmt.Errorf("failed to copy original file: %w", err)
		}
		compressedSize = originalSize
	}

	// Calculate compression ratio
	compressionRatio := 0.0
	if originalSize > 0 {
		compressionRatio = float64(originalSize-compressedSize) / float64(originalSize) * 100
	}

	// Generate file URL
	fileURL := fmt.Sprintf("/api/file?folder=compressions&filename=%s-compressed.pdf", uniqueID)

	return &CompressResult{
		Success:         true,
		FilePath:        outputPath,
		FileURL:         fileURL,
		OriginalSize:    originalSize,
		CompressedSize:  compressedSize,
		CompressionRatio: compressionRatio,
	}, nil
}

// compressWithPdfcpu compresses a PDF using pdfcpu
func (s *CompressService) compressWithPdfcpu(inputPath, outputPath string) error {
	cmd := exec.Command("pdfcpu", "optimize", inputPath, outputPath)
	output, err := cmd.CombinedOutput()
	if err != nil {
		return fmt.Errorf("pdfcpu optimization failed: %w\nOutput: %s", err, output)
	}
	return nil
}

// compressWithGhostscript compresses a PDF using Ghostscript
func (s *CompressService) compressWithGhostscript(inputPath, outputPath, compressionLevel string) error {
	// Determine Ghostscript executable name based on platform
	gsCmd := "gs"
	if isWindows() {
		gsCmd = "gswin64c"
	}
	
	// Build Ghostscript command
	cmd := exec.Command(
		gsCmd,
		"-sDEVICE=pdfwrite",
		compressionLevel,
		"-dCompatibilityLevel=1.5",
		"-dNOPAUSE",
		"-dQUIET",
		"-dBATCH",
		"-sOutputFile="+outputPath,
		inputPath,
	)
	
	output, err := cmd.CombinedOutput()
	if err != nil {
		return fmt.Errorf("ghostscript compression failed: %w\nOutput: %s", err, output)
	}
	
	return nil
}

// Helper function to check if we're on Windows
func isWindows() bool {
	return os.PathSeparator == '\\' && os.PathListSeparator == ';'
}

// Helper function to copy a file
func copyFile(src, dst string) error {
	input, err := os.ReadFile(src)
	if err != nil {
		return err
	}
	return os.WriteFile(dst, input, 0644)
}