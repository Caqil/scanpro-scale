// api/cmd/api/main.go
package main

import (
	"log"

	_ "github.com/Caqil/megapdf-api/cmd/api/docs"
	"github.com/Caqil/megapdf-api/internal/config"
	"github.com/Caqil/megapdf-api/internal/routes"
	"github.com/gin-gonic/gin"

	swaggerFiles "github.com/swaggo/files"
	ginSwagger "github.com/swaggo/gin-swagger"
	_ "github.com/swaggo/swag"
)

// @title MegaPDF API
// @description API for MegaPDF document processing service
// @version 1.0
// @host localhost:8080
// @BasePath /api
// @schemes http https
// @securityDefinitions.apikey ApiKeyAuth
// @in header
// @name x-api-key
// @securityDefinitions.apikey BearerAuth
// @in header
// @name Authorization
// @description Type "Bearer" followed by a space and the JWT token
// @tag.name auth
// @tag.description Authentication endpoints
// @tag.name setup
// @tag.description Initial setup endpoints
// @tag.name users
// @tag.description User management endpoints
// @tag.name ocr
// @tag.description OCR processing endpoints
// @tag.name balance
// @tag.description User balance endpoints
// @tag.name admin
// @tag.description Admin endpoints
func main() {
	// Initialize database
	db, err := config.InitDB()
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}

	// Initialize Gin router
	r := gin.Default()

	// Setup routes
	routes.SetupRoutes(r, db)

	// Setup Swagger
	url := ginSwagger.URL("http://localhost:8080/swagger/doc.json")
	r.GET("/swagger/*any", ginSwagger.WrapHandler(swaggerFiles.Handler, url))

	// Start server
	if err := r.Run(":8080"); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}
