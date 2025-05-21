// internal/models/watermark_request.go
package models

// WatermarkRequest represents a request to add a watermark to a PDF
type WatermarkRequest struct {
	// WatermarkType is the type of watermark: "text", "image", or "pdf"
	WatermarkType string `json:"watermarkType" binding:"required,oneof=text image pdf"`

	// Content is the watermark content:
	// - For text: the actual text
	// - For image: base64 encoded image data
	// - For PDF: base64 encoded PDF data
	Content string `json:"content" binding:"required"`

	// FileName is the name of the file for image or PDF watermarks
	FileName string `json:"fileName"`

	// PageSelection is the pages to watermark (e.g., "1-3,5,7-9")
	PageSelection string `json:"pageSelection"`

	// Description is the configuration string for the watermark
	// See pdfcpu docs for details on format
	Description string `json:"description"`

	// Options holds additional watermark options
	Options WatermarkOptions `json:"options"`
}

// WatermarkOptions contains additional options for watermarking
type WatermarkOptions struct {
	// Position of the watermark: "tl", "tc", "tr", "l", "c", "r", "bl", "bc", "br"
	Position string `json:"position"`

	// Opacity level between 0.0 and 1.0
	Opacity float64 `json:"opacity"`

	// Rotation angle between -180.0 and 180.0
	Rotation float64 `json:"rotation"`

	// Scale factor for the watermark
	Scale float64 `json:"scale"`

	// FontName for text watermarks
	FontName string `json:"fontName"`

	// FontSize for text watermarks
	FontSize int `json:"fontSize"`

	// FillColor for text watermarks (CSS color format)
	FillColor string `json:"fillColor"`

	// Diagonal rendering mode (1 or 2)
	Diagonal int `json:"diagonal"`
}

// WatermarkResponse represents the response for a watermark operation
type WatermarkResponse struct {
	Success bool   `json:"success"`
	Message string `json:"message,omitempty"`
	FileURL string `json:"fileUrl,omitempty"`
	Error   string `json:"error,omitempty"`
}
