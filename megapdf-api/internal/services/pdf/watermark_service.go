// internal/services/pdf/watermark_service.go
package pdf

import (
	"errors"
	"fmt"
	"os"
	"os/exec"
	"strings"

	"github.com/rs/zerolog/log"
)

// WatermarkOptions contains parameters for adding a watermark to a PDF
type WatermarkOptions struct {
	InputPath      string
	OutputPath     string
	WatermarkType  string // "text" or "image"
	Text           string
	ImagePath      string
	Position       string
	Opacity        float64
	Rotation       int
	Pages          string
	FontName       string
	FontSize       int
	TextColor      string
	Scale          float64
}

// WatermarkService handles PDF watermarking operations
type WatermarkService struct{}

// NewWatermarkService creates a new WatermarkService
func NewWatermarkService() *WatermarkService {
	return &WatermarkService{}
}

// Watermark adds a watermark to a PDF
func (s *WatermarkService) Watermark(options WatermarkOptions) error {
	// Check if input file exists
	if _, err := os.Stat(options.InputPath); os.IsNotExist(err) {
		return errors.New("input file does not exist")
	}

	log.Info().
		Str("inputPath", options.InputPath).
		Str("outputPath", options.OutputPath).
		Str("watermarkType", options.WatermarkType).
		Msg("Starting PDF watermarking")

	// Create config string for pdfcpu
	configParts := []string{}

	// Add position
	position := mapPositionToAnchor(options.Position)
	configParts = append(configParts, fmt.Sprintf("position:%s", position))

	// Add opacity
	configParts = append(configParts, fmt.Sprintf("opacity:%.2f", options.Opacity))

	// Handle diagonal or rotation
	if options.Position == "tile" {
		configParts = append(configParts, "diagonal:1")
	} else {
		configParts = append(configParts, fmt.Sprintf("rotation:%d", options.Rotation))
	}

	// Add type-specific configuration
	if options.WatermarkType == "text" {
		// Font name
		if options.FontName != "" {
			configParts = append(configParts, fmt.Sprintf("fontname:%s", getFontName(options.FontName)))
		}

		// Font size
		if options.FontSize > 0 {
			configParts = append(configParts, fmt.Sprintf("points:%d", options.FontSize))
		}

		// Text color
		if options.TextColor != "" {
			color := normalizeColor(options.TextColor)
			configParts = append(configParts, fmt.Sprintf("fillcolor:%s", color))
			configParts = append(configParts, fmt.Sprintf("strokecolor:%s", color))
		}
	} else if options.WatermarkType == "image" {
		// Scale for image
		if options.Scale > 0 {
			configParts = append(configParts, fmt.Sprintf("scalefactor:%.2f", options.Scale/100))
		}
	}

	// Join configuration with commas
	config := strings.Join(configParts, ", ")

	// Build pdfcpu command
	args := []string{"watermark", "add", "-mode", options.WatermarkType}

	// Add pages parameter if specified
	if options.Pages != "" {
		args = append(args, "-pages", options.Pages)
	}

	// Add content (text or image path)
	content := options.Text
	if options.WatermarkType == "image" {
		content = options.ImagePath
	}
	
	// Complete the command with content, config, and file paths
	args = append(args, "--", content, config, options.InputPath, options.OutputPath)
	
	// Execute command
	cmd := exec.Command("pdfcpu", args...)
	output, err := cmd.CombinedOutput()
	if err != nil {
		log.Error().Err(err).Str("output", string(output)).Msg("pdfcpu watermark failed")
		return errors.New("pdfcpu watermark failed: " + err.Error())
	}

	// Check if output file exists
	if _, err := os.Stat(options.OutputPath); os.IsNotExist(err) {
		return errors.New("watermarking failed: output file not created")
	}

	log.Info().Str("outputPath", options.OutputPath).Msg("PDF watermarking completed")
	return nil
}

// Helper functions

// mapPositionToAnchor converts position names to pdfcpu anchor values
func mapPositionToAnchor(position string) string {
	switch strings.ToLower(position) {
	case "center":
		return "c"
	case "top-left":
		return "tl"
	case "top-right":
		return "tr"
	case "bottom-left":
		return "bl"
	case "bottom-right":
		return "br"
	case "tile":
		return "c" // For tile, use center position with diagonal
	case "custom":
		return "c" // For custom, default to center
	default:
		return "c"
	}
}

// getFontName maps common font names to pdfcpu font names
func getFontName(fontFamily string) string {
	switch strings.ToLower(fontFamily) {
	case "times new roman", "times":
		return "Times-Roman"
	case "courier":
		return "Courier"
	case "helvetica", "arial":
		return "Helvetica"
	default:
		return "Helvetica"
	}
}

// normalizeColor converts hexadecimal color to pdfcpu RGB format
func normalizeColor(hexColor string) string {
	// Remove # if present
	hexColor = strings.TrimPrefix(hexColor, "#")
	
	// Parse RGB values
	var r, g, b int
	if len(hexColor) == 6 {
		fmt.Sscanf(hexColor, "%02x%02x%02x", &r, &g, &b)
	} else {
		// Default to black if invalid format
		r, g, b = 0, 0, 0
	}
	
	// Convert to float values between 0 and 1
	return fmt.Sprintf("%.2f %.2f %.2f", float64(r)/255, float64(g)/255, float64(b)/255)
}