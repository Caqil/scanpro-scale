// cmd/api/main.go
package main

import (
	"context"
	"fmt"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/caqil/pdf-api/internal/api"
	"github.com/caqil/pdf-api/internal/api/pdf"
	"github.com/caqil/pdf-api/internal/config"
	"github.com/caqil/pdf-api/internal/middleware"
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
)

func main() {
	// Load environment variables
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found, using environment variables")
	}

	// Initialize configuration
	cfg := config.New()

	// Create required directories
	ensureDirectories(cfg)

	// Set up Gin router
	if os.Getenv("GIN_MODE") == "release" {
		gin.SetMode(gin.ReleaseMode)
	}

	router := gin.Default()

	// Apply CORS middleware
	router.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"*"},
		AllowMethods:     []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Accept", "Authorization", "X-Api-Key"},
		ExposeHeaders:    []string{"Content-Length", "Content-Disposition"},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
	}))

	// Apply custom middleware
	router.Use(middleware.Logger())
	router.Use(middleware.RateLimit())

	// Register routes
	registerRoutes(router, cfg)

	// Create HTTP server
	srv := &http.Server{
		Addr:    fmt.Sprintf(":%s", cfg.Port),
		Handler: router,
	}

	// Start server in a goroutine
	go func() {
		log.Printf("Starting server on port %s\n", cfg.Port)
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatalf("Server failed: %v\n", err)
		}
	}()

	// Wait for interrupt signal to gracefully shutdown
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit
	log.Println("Shutting down server...")

	// Set shutdown timeout
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	if err := srv.Shutdown(ctx); err != nil {
		log.Fatalf("Server forced to shutdown: %v\n", err)
	}

	log.Println("Server exited")
}

func registerRoutes(router *gin.Engine, cfg *config.Config) {
	// File endpoint
	router.GET("/api/file", api.ServeFile)

	// OCR endpoint
	router.POST("/api/ocr", api.PerformOCR)

	// PDF endpoints
	pdfRoutes := router.Group("/api/pdf")
	{
		pdfRoutes.POST("/convert", pdf.Convert)
		pdfRoutes.POST("/compress", pdf.Compress)
		pdfRoutes.POST("/merge", pdf.Merge)
		pdfRoutes.POST("/split", pdf.Split)
		pdfRoutes.GET("/split/status", pdf.SplitStatus)
		pdfRoutes.POST("/watermark", pdf.Watermark)
		pdfRoutes.POST("/rotate", pdf.Rotate)
		pdfRoutes.POST("/protect", pdf.Protect)
		pdfRoutes.POST("/unlock", pdf.Unlock)
		pdfRoutes.POST("/unlock/check", pdf.UnlockCheck)
		pdfRoutes.POST("/remove", pdf.Remove)
		pdfRoutes.POST("/sign", pdf.Sign)
		pdfRoutes.POST("/edit", pdf.Edit)
		pdfRoutes.POST("/repair", pdf.Repair)
		pdfRoutes.POST("/extract", pdf.Extract)
		pdfRoutes.POST("/annotate", pdf.Annotate)
		pdfRoutes.POST("/redact", pdf.Redact)
		pdfRoutes.POST("/redact/detect", pdf.RedactDetect)
		pdfRoutes.POST("/organize", pdf.Organize)
		pdfRoutes.POST("/process", pdf.Process)
		pdfRoutes.POST("/save", pdf.Save)
		pdfRoutes.POST("/info", pdf.Info)
		pdfRoutes.POST("/pagenumber", pdf.PageNumber)
		pdfRoutes.POST("/chat", pdf.Chat)
		pdfRoutes.GET("/chat", pdf.GetChatHistory)
		pdfRoutes.DELETE("/chat", pdf.DeleteChat)
	}
}

func ensureDirectories(cfg *config.Config) {
	dirs := []string{
		cfg.UploadDir,
		cfg.ConversionDir,
		cfg.CompressDir,
		cfg.MergeDir,
		cfg.SplitDir,
		cfg.RotateDir,
		cfg.WatermarkDir,
		cfg.ProtectDir,
		cfg.UnlockDir,
		cfg.SignatureDir,
		cfg.OCRDir,
		cfg.EditDir,
		cfg.ProcessDir,
		cfg.RepairDir,
		cfg.TempDir,
		cfg.StatusDir,
		cfg.PageNumbersDir,
	}

	for _, dir := range dirs {
		if err := os.MkdirAll(dir, 0755); err != nil {
			log.Printf("Failed to create directory %s: %v\n", dir, err)
		}
	}
}
