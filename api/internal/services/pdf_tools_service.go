// internal/services/pdf_tools_service.go
package services

import (
	"fmt"

	"github.com/MegaPDF/megapdf-official/api/internal/repository"
)

// PDFToolsService handles business logic for PDF tools
type PDFToolsService struct {
	repo *repository.PDFToolsRepository
}

// NewPDFToolsService creates a new PDFToolsService
func NewPDFToolsService() *PDFToolsService {
	return &PDFToolsService{
		repo: repository.NewPDFToolsRepository(),
	}
}

// CheckToolAvailability checks if a tool is enabled and available for use
func (s *PDFToolsService) CheckToolAvailability(toolID string) (bool, error) {
	// Check if the tool is enabled in the database
	enabled, err := s.repo.IsToolEnabled(toolID)
	if err != nil {
		return false, fmt.Errorf("error checking tool status: %w", err)
	}

	return enabled, nil
}

// GetDisabledMessage returns a standard message for when a tool is disabled
func (s *PDFToolsService) GetDisabledMessage(toolID string) string {
	return fmt.Sprintf("The %s tool is currently disabled by the administrator. Please try again later or contact support for assistance.", toolID)
}
