// internal/utils/validation/file_validator.go
package validation

import (
	"errors"
	"mime/multipart"
	"strings"

	"megapdf-api/pkg/constants"
)

// ValidateFile validates an uploaded file
func ValidateFile(fileHeader *multipart.FileHeader) error {
	// Check if file exists
	if fileHeader == nil {
		return errors.New("no file provided")
	}

	// Check file size
	if fileHeader.Size > constants.MaxFileSize {
		return errors.New("file size exceeds the maximum allowed limit")
	}

	return nil
}

// IsSupportedFormat checks if a format is supported
func IsSupportedFormat(format string) bool {
	for _, supported := range constants.SupportedFormats {
		if supported == strings.ToLower(format) {
			return true
		}
	}
	return false
}

// IsValidCompressionQuality checks if compression quality is valid
func IsValidCompressionQuality(quality string) bool {
	validQualities := []string{"low", "medium", "high"}
	for _, valid := range validQualities {
		if valid == quality {
			return true
		}
	}
	return false
}

// IsPDF checks if a file is a PDF
func IsPDF(filename string) bool {
	return strings.HasSuffix(strings.ToLower(filename), ".pdf")
}
