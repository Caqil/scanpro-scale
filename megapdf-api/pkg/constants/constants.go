// pkg/constants/constants.go
package constants

// File size limits
const (
	MaxFileSize   = 50 * 1024 * 1024  // 50MB
	MaxUploadSize = 100 * 1024 * 1024 // 100MB for multiple files
)

// Directory paths
const (
	UploadDir      = "uploads"
	ConversionDir  = "public/conversions"
	CompressionDir = "public/compressions"
	MergeDir       = "public/merges"
	SplitDir       = "public/splits"
	WatermarkDir   = "public/watermarks"
	ProtectedDir   = "public/protected"
	UnlockedDir    = "public/unlocked"
	ProcessedDir   = "public/processed"
	TempDir        = "temp"
)

// Supported formats
var SupportedFormats = []string{
	"pdf", "docx", "xlsx", "pptx", "rtf", "txt", "html", "jpg", "jpeg", "png", "gif",
}

// API Operations
var AllowedOperations = []string{
	"convert", "compress", "merge", "split", "watermark", "protect",
	"unlock", "remove", "ocr", "sign", "rotate", "repair", "pagenumber",
}
