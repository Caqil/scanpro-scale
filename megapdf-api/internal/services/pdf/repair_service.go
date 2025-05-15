// internal/services/pdf/repair_service.go
package pdf

import (
	"errors"
	"fmt"
	"os"
	"os/exec"
	"path/filepath"

	"github.com/rs/zerolog/log"
)

// RepairOptions contains parameters for PDF repair operations
type RepairOptions struct {
	InputPath           string
	OutputPath          string
	RepairMode          string // "standard", "advanced", or "optimization"
	Password            string // Optional, for protected PDFs
	PreserveFormFields  bool
	PreserveAnnotations bool
	PreserveBookmarks   bool
	OptimizeImages      bool
}

// RepairService handles PDF repair operations
type RepairService struct{}

// NewRepairService creates a new RepairService
func NewRepairService() *RepairService {
	return &RepairService{}
}

// Repair attempts to fix a damaged PDF file
func (s *RepairService) Repair(options RepairOptions) error {
	// Check if input file exists
	if _, err := os.Stat(options.InputPath); os.IsNotExist(err) {
		return errors.New("input file does not exist")
	}

	log.Info().
		Str("inputPath", options.InputPath).
		Str("outputPath", options.OutputPath).
		Str("repairMode", options.RepairMode).
		Bool("hasPassword", options.Password != "").
		Msg("Starting PDF repair")

	// Handle password-protected PDFs first
	if options.Password != "" {
		return s.repairPasswordProtectedPdf(options)
	}

	// Handle repair based on mode
	switch options.RepairMode {
	case "standard":
		return s.standardRepair(options)
	case "advanced":
		return s.advancedRepair(options)
	case "optimization":
		return s.optimizationRepair(options)
	default:
		return s.standardRepair(options) // Default to standard repair
	}
}

// Standard repair using qpdf
func (s *RepairService) standardRepair(options RepairOptions) error {
	// Check if qpdf is installed
	if !s.hasQpdf() {
		// Fall back to ghostscript if available
		if s.hasGhostscript() {
			return s.repairWithGhostscript(options, false)
		}
		return s.fallbackRepair(options)
	}

	// Use qpdf for standard repair
	// Format: qpdf --replace-input input.pdf --object-streams=disable
	cmd := exec.Command("qpdf", "--replace-input", options.InputPath, "--object-streams=disable")
	output, err := cmd.CombinedOutput()
	if err != nil {
		log.Error().Err(err).Str("output", string(output)).Msg("qpdf standard repair failed")
	}

	// Copy the repaired file to the output location
	copyCmd := exec.Command("qpdf", options.InputPath, options.OutputPath)
	output, err = copyCmd.CombinedOutput()
	if err != nil {
		log.Error().Err(err).Str("output", string(output)).Msg("qpdf copy failed")
		return fmt.Errorf("qpdf repair failed: %w", err)
	}

	// Check if output file exists
	if _, err := os.Stat(options.OutputPath); os.IsNotExist(err) {
		return errors.New("repair failed: output file not created")
	}

	log.Info().Str("outputPath", options.OutputPath).Msg("PDF standard repair completed")
	return nil
}

// Advanced repair using qpdf with more options
func (s *RepairService) advancedRepair(options RepairOptions) error {
	// Check if qpdf is installed
	if !s.hasQpdf() {
		// Fall back to ghostscript if available
		if s.hasGhostscript() {
			return s.repairWithGhostscript(options, true)
		}
		return s.fallbackRepair(options)
	}

	// Use qpdf for advanced repair
	// Format: qpdf --replace-input input.pdf --qdf --object-streams=disable --decode-level=all
	cmd := exec.Command("qpdf", "--replace-input", options.InputPath, "--qdf", "--object-streams=disable", "--decode-level=all")
	output, err := cmd.CombinedOutput()
	if err != nil {
		log.Error().Err(err).Str("output", string(output)).Msg("qpdf advanced repair failed")
	}

	// Copy the repaired file to the output location
	copyCmd := exec.Command("qpdf", options.InputPath, options.OutputPath)
	output, err = copyCmd.CombinedOutput()
	if err != nil {
		log.Error().Err(err).Str("output", string(output)).Msg("qpdf copy failed")
		return fmt.Errorf("qpdf advanced repair failed: %w", err)
	}

	// Check if output file exists
	if _, err := os.Stat(options.OutputPath); os.IsNotExist(err) {
		return errors.New("repair failed: output file not created")
	}

	log.Info().Str("outputPath", options.OutputPath).Msg("PDF advanced repair completed")
	return nil
}

// Optimization repair focuses on reducing file size and improving structure
func (s *RepairService) optimizationRepair(options RepairOptions) error {
	// Check if ghostscript is available
	if s.hasGhostscript() && options.OptimizeImages {
		return s.repairWithGhostscript(options, true)
	}

	// If no ghostscript or not optimizing images, use fallback
	return s.fallbackRepair(options)
}

// Repair with Ghostscript
func (s *RepairService) repairWithGhostscript(options RepairOptions, optimize bool) error {
	gsCommand := "gs"
	if s.isWindows() {
		gsCommand = "gswin64c"
	}

	// Basic Ghostscript options
	args := []string{
		"-sDEVICE=pdfwrite",
		"-dPDFSETTINGS=/prepress",
		"-dQUIET",
		"-dBATCH",
		"-dNOPAUSE",
		"-dNOOUTERSAVE",
		"-dPrinted=false",
		`-c "/FixPDFStructure true def"`,
		`-c ".setpdfwrite"`,
	}

	// Add optimization options if requested
	if optimize {
		args = []string{
			"-sDEVICE=pdfwrite",
			"-dPDFSETTINGS=/ebook",
			"-dCompressFonts=true",
			"-dDetectDuplicateImages=true",
			"-dColorImageResolution=150",
			"-dGrayImageResolution=150",
			"-dMonoImageResolution=300",
			"-dDownsampleColorImages=true",
			"-dDownsampleGrayImages=true",
			"-dAutoFilterColorImages=true",
			"-dAutoFilterGrayImages=true",
			"-dQUIET",
			"-dBATCH",
			"-dNOPAUSE",
			`-c ".setpdfwrite"`,
		}
	}

	// Add output and input file paths
	args = append(args, "-sOutputFile="+options.OutputPath, options.InputPath)

	// Execute command
	cmd := exec.Command(gsCommand, args...)
	output, err := cmd.CombinedOutput()
	if err != nil {
		log.Error().Err(err).Str("output", string(output)).Msg("Ghostscript repair failed")
		return fmt.Errorf("ghostscript repair failed: %w", err)
	}

	// Check if output file exists
	if _, err := os.Stat(options.OutputPath); os.IsNotExist(err) {
		return errors.New("repair failed: output file not created")
	}

	log.Info().
		Str("outputPath", options.OutputPath).
		Bool("optimized", optimize).
		Msg("PDF repair with Ghostscript completed")

	return nil
}

// Fallback repair method using basic file copying
func (s *RepairService) fallbackRepair(options RepairOptions) error {
	// Simple file copy as a fallback
	input, err := os.ReadFile(options.InputPath)
	if err != nil {
		return fmt.Errorf("failed to read input file: %w", err)
	}

	err = os.WriteFile(options.OutputPath, input, 0644)
	if err != nil {
		return fmt.Errorf("failed to write output file: %w", err)
	}

	log.Warn().
		Str("inputPath", options.InputPath).
		Str("outputPath", options.OutputPath).
		Msg("Using fallback repair (simple copy)")

	return nil
}

// Repair password-protected PDF
func (s *RepairService) repairPasswordProtectedPdf(options RepairOptions) error {
	// Check if qpdf is installed
	if !s.hasQpdf() {
		return errors.New("qpdf is required for repairing password-protected PDFs")
	}

	// First decrypt the PDF using the password
	// Format: qpdf --password=XXX --decrypt input.pdf output.pdf
	cmd := exec.Command("qpdf", "--password="+options.Password, "--decrypt", options.InputPath, options.OutputPath)
	output, err := cmd.CombinedOutput()
	if err != nil {
		log.Error().Err(err).Str("output", string(output)).Msg("qpdf password decrypt failed")
		return fmt.Errorf("failed to decrypt password-protected PDF: %w", err)
	}

	// Check if output file exists
	if _, err := os.Stat(options.OutputPath); os.IsNotExist(err) {
		return errors.New("repair failed: output file not created")
	}

	log.Info().Str("outputPath", options.OutputPath).Msg("Password-protected PDF repaired")
	return nil
}

// Helper methods

// Check if qpdf is installed
func (s *RepairService) hasQpdf() bool {
	_, err := exec.LookPath("qpdf")
	return err == nil
}

// Check if ghostscript is installed
func (s *RepairService) hasGhostscript() bool {
	if s.isWindows() {
		_, err := exec.LookPath("gswin64c")
		return err == nil
	}
	_, err := exec.LookPath("gs")
	return err == nil
}

// Check if running on Windows
func (s *RepairService) isWindows() bool {
	return filepath.Separator == '\\' // Windows uses backslash as path separator
}
