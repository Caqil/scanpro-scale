// cmd/server/main.go
package main

import (
	"context"
	"flag"
	"fmt"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/rs/zerolog"
	"github.com/rs/zerolog/log"

	"megapdf-api/internal/api/router"
	"megapdf-api/internal/config"
	"megapdf-api/internal/db"
)

func main() {
	// Parse command line flags
	configPath := flag.String("config", "configs/app.json", "Path to configuration file")
	logConfigPath := flag.String("log-config", "configs/logging.json", "Path to logging configuration file")
	flag.Parse()

	// Initialize configuration
	cfg, err := config.LoadConfig(*configPath)
	if err != nil {
		fmt.Printf("Failed to load configuration: %v\n", err)
		os.Exit(1)
	}

	// Initialize logging
	initLogging(*logConfigPath)

	// Initialize database connection
	if err := db.Initialize(cfg.Database); err != nil {
		log.Fatal().Err(err).Msg("Failed to initialize database")
	}
	defer db.Close()

	// Initialize API router
	r := router.SetupRouter(cfg)

	// Create HTTP server
	server := &http.Server{
		Addr:           fmt.Sprintf(":%d", cfg.Server.Port),
		Handler:        r,
		ReadTimeout:    time.Duration(cfg.Server.ReadTimeoutSeconds) * time.Second,
		WriteTimeout:   time.Duration(cfg.Server.WriteTimeoutSeconds) * time.Second,
		MaxHeaderBytes: 1 << 20, // 1 MB
	}

	// Start server in a goroutine
	go func() {
		log.Info().Int("port", cfg.Server.Port).Msg("Starting MegaPDF API server")
		if err := server.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatal().Err(err).Msg("Failed to start server")
		}
	}()

	// Wait for interrupt signal to gracefully shut down the server
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit
	log.Info().Msg("Shutting down server...")

	// Create a deadline for server shutdown
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	if err := server.Shutdown(ctx); err != nil {
		log.Fatal().Err(err).Msg("Server forced to shutdown")
	}

	log.Info().Msg("Server exiting")
}

func initLogging(configPath string) {
	// Set default logging configuration
	zerolog.TimeFieldFormat = zerolog.TimeFormatUnix
	zerolog.SetGlobalLevel(zerolog.InfoLevel)

	// Try to load logging configuration
	logCfg, err := config.LoadLoggingConfig(configPath)
	if err != nil {
		// Use default logging if config cannot be loaded
		fmt.Printf("Failed to load logging configuration: %v\nUsing default configuration.\n", err)
		return
	}

	// Configure log level
	level, err := zerolog.ParseLevel(logCfg.Level)
	if err != nil {
		fmt.Printf("Invalid log level: %v\nUsing info level.\n", err)
		level = zerolog.InfoLevel
	}
	zerolog.SetGlobalLevel(level)

	// Configure output
	if logCfg.Console {
		log.Logger = log.Output(zerolog.ConsoleWriter{Out: os.Stdout, TimeFormat: time.RFC3339})
	}

	// Set up file logging if enabled
	if logCfg.File.Enabled {
		// Setup file output here
		// This would involve opening a file and setting up log output to it
		// For simplicity, we'll skip this implementation
	}
}
