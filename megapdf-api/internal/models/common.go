package models

// Define constants for common values
const (
	// User roles
	RoleAdmin     = "admin"
	RoleUser      = "user"
	RoleSuspended = "suspended"

	// Transaction statuses
	StatusPending   = "pending"
	StatusCompleted = "completed"
	StatusFailed    = "failed"

	// API permissions
	PermAll       = "*"
	PermConvert   = "convert"
	PermCompress  = "compress"
	PermMerge     = "merge"
	PermSplit     = "split"
	PermWatermark = "watermark"
	PermProtect   = "protect"
	PermUnlock    = "unlock"
	PermOCR       = "ocr"
	PermSign      = "sign"
	PermRepair    = "repair"
	PermRotate    = "rotate"
	PermRemove    = "remove"
)

// SupportedOperations is a list of all operations supported by the API
var SupportedOperations = []string{
	PermConvert,
	PermCompress,
	PermMerge,
	PermSplit,
	PermWatermark,
	PermProtect,
	PermUnlock,
	PermOCR,
	PermSign,
	PermRepair,
	PermRotate,
	PermRemove,
}
