// internal/services/pdf/compress_service.go
package pdf

import (
	"errors"
	"os"
	"os/exec"

	"github.com/rs/zerolog/log"
)

// CompressService handles PDF compression operations
type CompressService struct{}

// NewCompressService creates a new CompressService
func NewCompressService() *CompressService {
	return &CompressService{}
}

// Compress optimizes a PDF file to reduce its size
func (s *CompressService) Compress(inputPath, outputPath, quality string) error {
	// Check if input file exists
	if _, err := os.Stat(inputPath); os.IsNotExist(err) {
		return errors.New("input file does not exist")
	}

	// Get original file size for comparison
	originalInfo, err := os.Stat(inputPath)
	if err != nil {
		return err
	}
	originalSize := originalInfo.Size()

	log.Info().Str("inputPath", inputPath).Str("outputPath", outputPath).Str("quality", quality).Msg("Starting PDF compression")

	// Use pdfcpu to optimize the PDF
	cmd := exec.Command("pdfcpu", "optimize", inputPath, outputPath)
	output, err := cmd.CombinedOutput()
	if err != nil {
		log.Error().Err(err).Str("output", string(output)).Msg("pdfcpu optimization failed")
		return errors.New("pdfcpu optimization failed: " + err.Error())
	}

	// Check if output file exists
	if _, err := os.Stat(outputPath); os.IsNotExist(err) {
		return errors.New("compression failed: output file not created")
	}

	// Check if compression was effective
	outputInfo, err := os.Stat(outputPath)
	if err != nil {
		return err
	}

	compressedSize := outputInfo.Size()
	if compressedSize >= originalSize {
		log.Info().Int64("originalSize", originalSize).Int64("compressedSize", compressedSize).Msg("Compression did not reduce file size, copying original")

		// If compression didn't reduce the size, copy the original file
		originalContent, err := os.ReadFile(inputPath)
		if err != nil {
			return err
		}

		err = os.WriteFile(outputPath, originalContent, 0644)
		if err != nil {
			return err
		}
	}

	log.Info().Int64("originalSize", originalSize).Int64("compressedSize", compressedSize).Msg("PDF compression completed")
	return nil
}
