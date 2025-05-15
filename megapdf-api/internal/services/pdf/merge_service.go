// internal/services/pdf/merge_service.go
package pdf

import (
	"errors"
	"fmt"
	"os"
	"os/exec"
	"path/filepath"

	"github.com/rs/zerolog/log"
)

// MergeService handles PDF merging operations
type MergeService struct{}

// NewMergeService creates a new MergeService
func NewMergeService() *MergeService {
	return &MergeService{}
}

// Merge combines multiple PDF files into one
func (s *MergeService) Merge(inputPaths []string, outputPath string) error {
	// Check if input files exist
	for _, path := range inputPaths {
		if _, err := os.Stat(path); os.IsNotExist(err) {
			return fmt.Errorf("input file does not exist: %s", path)
		}
	}

	log.Info().Strs("inputPaths", inputPaths).Str("outputPath", outputPath).Msg("Starting PDF merge")

	// For large merges, use a two-stage approach
	if len(inputPaths) > 10 {
		return s.performLargeMerge(inputPaths, outputPath)
	}

	// For smaller merges, use a single command
	args := append([]string{"merge", outputPath}, inputPaths...)
	cmd := exec.Command("pdfcpu", args...)
	output, err := cmd.CombinedOutput()
	if err != nil {
		log.Error().Err(err).Str("output", string(output)).Msg("pdfcpu merge failed")
		return errors.New("pdfcpu merge failed: " + err.Error())
	}

	// Check if output file exists
	if _, err := os.Stat(outputPath); os.IsNotExist(err) {
		return errors.New("merge failed: output file not created")
	}

	log.Info().Int("inputCount", len(inputPaths)).Str("outputPath", outputPath).Msg("PDF merge completed")
	return nil
}

// performLargeMerge handles merging a large number of files using a staged approach
func (s *MergeService) performLargeMerge(inputPaths []string, outputPath string) error {
	// Create temporary directory for intermediate merges
	tempDir := filepath.Join(os.TempDir(), fmt.Sprintf("megapdf-merge-%d", time.Now().UnixNano()))
	if err := os.MkdirAll(tempDir, 0755); err != nil {
		return fmt.Errorf("failed to create temp directory: %w", err)
	}
	defer os.RemoveAll(tempDir) // Clean up temp directory when done

	// Split into batches of 5 files
	batchSize := 5
	tempFiles := []string{}

	// Process each batch
	for i := 0; i < len(inputPaths); i += batchSize {
		end := i + batchSize
		if end > len(inputPaths) {
			end = len(inputPaths)
		}
		
		batchFiles := inputPaths[i:end]
		batchOutputPath := filepath.Join(tempDir, fmt.Sprintf("batch-%d.pdf", i))

		// Merge this batch
		log.Info().Int("batch", i/batchSize+1).Int("totalBatches", (len(inputPaths)+batchSize-1)/batchSize).Msg("Processing batch")
		
		args := append([]string{"merge", batchOutputPath}, batchFiles...)
		cmd := exec.Command("pdfcpu", args...)
		if output, err := cmd.CombinedOutput(); err != nil {
			log.Error().Err(err).Str("output", string(output)).Int("batch", i/batchSize+1).Msg("Batch merge failed")
			return fmt.Errorf("batch merge failed: %w", err)
		}

		tempFiles = append(tempFiles, batchOutputPath)
	}

	// Final merge of all batches
	log.Info().Int("batchCount", len(tempFiles)).Msg("Merging batches to final output")
	
	args := append([]string{"merge", outputPath}, tempFiles...)
	cmd := exec.Command("pdfcpu", args...)
	if output, err := cmd.CombinedOutput(); err != nil {
		log.Error().Err(err).Str("output", string(output)).Msg("Final merge failed")
		return fmt.Errorf("final merge failed: %w", err)
	}

	// Verify the output file exists
	if _, err := os.Stat(outputPath); os.IsNotExist(err) {
		return errors.New("merge failed: final output file not created")
	}

	return nil
}