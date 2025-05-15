// internal/services/pdf/unlock_service.go
package pdf

import (
	"errors"
	"fmt"
	"os"
	"os/exec"

	"github.com/rs/zerolog/log"
)

// UnlockService handles PDF unlocking operations
type UnlockService struct{}

// NewUnlockService creates a new UnlockService
func NewUnlockService() *UnlockService {
	return &UnlockService{}
}

// Unlock removes password protection from a PDF
func (s *UnlockService) Unlock(inputPath, outputPath, password string) error {
	// Check if input file exists
	if _, err := os.Stat(inputPath); os.IsNotExist(err) {
		return errors.New("input file does not exist")
	}

	log.Info().Str("inputPath", inputPath).Str("outputPath", outputPath).Msg("Starting PDF unlock")

	// Try with user password first
	err := s.unlockWithUserPassword(inputPath, outputPath, password)
	if err == nil {
		log.Info().Str("outputPath", outputPath).Msg("PDF unlocked with user password")
		return nil
	}

	// If user password fails, try with owner password
	log.Info().Msg("User password failed, trying owner password")
	err = s.unlockWithOwnerPassword(inputPath, outputPath, password)
	if err == nil {
		log.Info().Str("outputPath", outputPath).Msg("PDF unlocked with owner password")
		return nil
	}

	// If both methods fail, return error
	return fmt.Errorf("failed to unlock PDF: %w", err)
}

// Unlock with user password
func (s *UnlockService) unlockWithUserPassword(inputPath, outputPath, password string) error {
	// Format: pdfcpu decrypt -upw password inputFile outputFile
	cmd := exec.Command("pdfcpu", "decrypt", "-upw", password, inputPath, outputPath)
	output, err := cmd.CombinedOutput()
	if err != nil {
		log.Debug().Err(err).Str("output", string(output)).Msg("pdfcpu decrypt with user password failed")
		return err
	}

	// Check if output file exists
	if _, err := os.Stat(outputPath); os.IsNotExist(err) {
		return errors.New("unlock failed: output file not created")
	}

	return nil
}

// Unlock with owner password
func (s *UnlockService) unlockWithOwnerPassword(inputPath, outputPath, password string) error {
	// Format: pdfcpu decrypt -opw password inputFile outputFile
	cmd := exec.Command("pdfcpu", "decrypt", "-opw", password, inputPath, outputPath)
	output, err := cmd.CombinedOutput()
	if err != nil {
		log.Debug().Err(err).Str("output", string(output)).Msg("pdfcpu decrypt with owner password failed")
		return err
	}

	// Check if output file exists
	if _, err := os.Stat(outputPath); os.IsNotExist(err) {
		return errors.New("unlock failed: output file not created")
	}

	return nil
}

// CheckLock checks if a PDF is protected with a password
func (s *UnlockService) CheckLock(pdfPath string) (bool, error) {
	// Check if file exists
	if _, err := os.Stat(pdfPath); os.IsNotExist(err) {
		return false, errors.New("file does not exist")
	}

	// Use pdfcpu info to get information about the PDF
	cmd := exec.Command("pdfcpu", "info", pdfPath)
	output, err := cmd.CombinedOutput()
	outputStr := string(output)

	// Look for indicators of encryption
	isEncrypted := false

	// Check pdfcpu info output for encryption indicators
	if outputStr != "" {
		isEncrypted = isEncrypted || 
			strings.Contains(outputStr, "Encrypted: true") || 
			strings.Contains(outputStr, "has UserAccess") || 
			strings.Contains(outputStr, "has OwnerAccess")
	}

	// If command failed with errors that suggest encryption
	if err != nil {
		errMsg := err.Error()
		if strings.Contains(errMsg, "password") || 
			strings.Contains(errMsg, "encrypted") || 
			strings.Contains(errMsg, "authentication") {
			isEncrypted = true
		}
	}

	// Try validate command as a second method
	validateCmd := exec.Command("pdfcpu", "validate", pdfPath)
	validateOutput, validateErr := validateCmd.CombinedOutput()
	
	// If validation failed with messages suggesting encryption
	if validateErr != nil {
		validateErrMsg := validateErr.Error()
		validateOutputStr := string(validateOutput)
		
		if strings.Contains(validateErrMsg, "password") || 
			strings.Contains(validateErrMsg, "encrypted") || 
			strings.Contains(validateErrMsg, "authentication") ||
			strings.Contains(validateOutputStr, "password") ||
			strings.Contains(validateOutputStr, "encrypted") {
			isEncrypted = true
		}
	}

	return isEncrypted, nil
}