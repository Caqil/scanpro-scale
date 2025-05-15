// internal/services/pdf/protect_service.go
package pdf

import (
	"errors"
	"fmt"
	"os"
	"os/exec"
	"strings"

	"github.com/rs/zerolog/log"
)

// ProtectionOptions contains parameters for PDF password protection
type ProtectionOptions struct {
	InputPath     string
	OutputPath    string
	UserPassword  string
	OwnerPassword string
	AllowPrinting bool
	AllowCopying  bool
	AllowEditing  bool
}

// ProtectService handles PDF protection operations
type ProtectService struct{}

// NewProtectService creates a new ProtectService
func NewProtectService() *ProtectService {
	return &ProtectService{}
}

// Protect adds password protection to a PDF
func (s *ProtectService) Protect(options ProtectionOptions) error {
	// Check if input file exists
	if _, err := os.Stat(options.InputPath); os.IsNotExist(err) {
		return errors.New("input file does not exist")
	}

	log.Info().
		Str("inputPath", options.InputPath).
		Str("outputPath", options.OutputPath).
		Bool("allowPrinting", options.AllowPrinting).
		Bool("allowCopying", options.AllowCopying).
		Bool("allowEditing", options.AllowEditing).
		Msg("Starting PDF protection")

	// Set permissions string based on flags
	var permissionsStr string
	if options.AllowPrinting {
		permissionsStr += "print,"
	}
	if options.AllowCopying {
		permissionsStr += "copy,"
	}
	if options.AllowEditing {
		permissionsStr += "modify,annotate,form,"
	}

	// Remove trailing comma if permissions were added
	if permissionsStr != "" {
		permissionsStr = strings.TrimSuffix(permissionsStr, ",")
	} else {
		permissionsStr = "none"
	}

	// Set owner password to user password if not provided
	ownerPwd := options.OwnerPassword
	if ownerPwd == "" {
		ownerPwd = options.UserPassword
	}

	// Build pdfcpu encryption command
	// Format: pdfcpu encrypt -mode aes -key 256 -perm [permissions] -upw [user password] -opw [owner password] inFile outFile
	// internal/services/pdf/protect_service.go (continued)
	// Build pdfcpu encryption command
	// Format: pdfcpu encrypt -mode aes -key 256 -perm [permissions] -upw [user password] -opw [owner password] inFile outFile
	args := []string{
		"encrypt",
		"-mode", "aes",
		"-key", "256",
		"-perm", permissionsStr,
		"-upw", options.UserPassword,
		"-opw", ownerPwd,
		options.InputPath,
		options.OutputPath,
	}

	// Execute command
	cmd := exec.Command("pdfcpu", args...)
	output, err := cmd.CombinedOutput()
	if err != nil {
		log.Error().Err(err).Str("output", string(output)).Msg("pdfcpu encrypt failed")
		return fmt.Errorf("pdfcpu encrypt failed: %w", err)
	}

	// Check if output file exists
	if _, err := os.Stat(options.OutputPath); os.IsNotExist(err) {
		return errors.New("protection failed: output file not created")
	}

	log.Info().Str("outputPath", options.OutputPath).Msg("PDF protection completed")
	return nil
}
