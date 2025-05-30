package main

import (
	"fmt"
	"log"
	"os"
	"path/filepath"

	"github.com/MegaPDF/megapdf-official/api/internal/bootstrap"
	"github.com/MegaPDF/megapdf-official/api/internal/routes"
	"github.com/MegaPDF/megapdf-official/api/internal/services"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
)

// @title MegaPDF API
// @version 1.0
// @description API for MegaPDF PDF processing tools
// @termsOfService https://mega-pdf.com/terms
// @contact.name API Support
// @contact.url https://mega-pdf.com/contact
// @contact.email support@mega-pdf.com
// @license.name MIT
// @license.url https://opensource.org/licenses/MIT
// @BasePath /api
// @securityDefinitions.apikey BearerAuth
// @in header
// @name Authorization
func main() {
	// Load .env file if it exists (just for bootstrap)
	godotenv.Load()

	// Bootstrap the application
	if err := bootstrap.Bootstrap(); err != nil {
		log.Fatalf("Failed to bootstrap application: %v", err)
	}

	// Get configuration
	configService := services.NewConfigService()
	cfg := configService.GetConfig()

	// Create required directories
	createDirs(cfg)

	// Set Gin mode
	if cfg.Debug {
		gin.SetMode(gin.DebugMode)
		fmt.Println("Running in DEBUG mode")
	} else {
		gin.SetMode(gin.ReleaseMode)
		fmt.Println("Running in RELEASE mode")
	}

	// Create Gin router
	r := gin.New()

	// Setup routes
	routes.SetupRoutes(r, cfg)

	// Start server
	portStr := fmt.Sprintf(":%d", cfg.Port)
	fmt.Printf("Starting server on port %d\n", cfg.Port)
	if err := r.Run(portStr); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}

// createDirs creates the required directories
func createDirs(cfg *services.Config) {
	dirs := []string{
		cfg.TempDir,
		cfg.UploadDir,
		cfg.PublicDir,
		filepath.Join(cfg.PublicDir, "signatures"),
		filepath.Join(cfg.PublicDir, "conversions"),
		filepath.Join(cfg.PublicDir, "compressions"),
		filepath.Join(cfg.PublicDir, "merges"),
		filepath.Join(cfg.PublicDir, "splits"),
		filepath.Join(cfg.PublicDir, "rotations"),
		filepath.Join(cfg.PublicDir, "watermarked"),
		filepath.Join(cfg.PublicDir, "watermarks"),
		filepath.Join(cfg.PublicDir, "protected"),
		filepath.Join(cfg.PublicDir, "pagenumbers"),
		filepath.Join(cfg.PublicDir, "unlocked"),
		filepath.Join(cfg.PublicDir, "ocr"),
		filepath.Join(cfg.PublicDir, "edited"),
		filepath.Join(cfg.PublicDir, "processed"),
		filepath.Join(cfg.PublicDir, "unwatermarked"),
		filepath.Join(cfg.PublicDir, "redacted"),
		filepath.Join(cfg.PublicDir, "repaired"),
	}

	for _, dir := range dirs {
		if err := os.MkdirAll(dir, 0755); err != nil {
			log.Printf("Failed to create directory %s: %v", dir, err)
		} else {
			log.Printf("Created directory: %s", dir)
		}
	}
}