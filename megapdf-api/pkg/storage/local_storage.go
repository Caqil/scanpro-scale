package storage

import (
	"fmt"
	"io"
	"os"
	"path/filepath"
	"time"
)

// LocalFileStorage implements StorageManager using the local filesystem
type LocalFileStorage struct {
	uploadDir    string
	processedDir string
	tempDir      string
	baseURL      string
}

// NewLocalFileStorage creates a new local file storage manager
func NewLocalFileStorage(config Config) *LocalFileStorage {
	// Create directories if they don't exist
	ensureDir(config.UploadDir)
	ensureDir(config.ProcessedDir)
	ensureDir(config.TempDir)

	return &LocalFileStorage{
		uploadDir:    config.UploadDir,
		processedDir: config.ProcessedDir,
		tempDir:      config.TempDir,
		baseURL:      config.BaseURL,
	}
}

// GetUploadDir returns the directory for uploaded files
func (s *LocalFileStorage) GetUploadDir() string {
	return s.uploadDir
}

// GetProcessedDir returns the directory for processed files by category
func (s *LocalFileStorage) GetProcessedDir(category string) string {
	dir := filepath.Join(s.processedDir, category)
	ensureDir(dir)
	return dir
}

// GetTempDir returns the directory for temporary files
func (s *LocalFileStorage) GetTempDir() string {
	return s.tempDir
}

// SaveFile saves a file from a reader
func (s *LocalFileStorage) SaveFile(reader io.Reader, path string) error {
	// Create the directory if it doesn't exist
	dir := filepath.Dir(path)
	if err := os.MkdirAll(dir, 0755); err != nil {
		return err
	}

	// Create the file
	file, err := os.Create(path)
	if err != nil {
		return err
	}
	defer file.Close()

	// Copy the data
	_, err = io.Copy(file, reader)
	return err
}

// DeleteFile deletes a file
func (s *LocalFileStorage) DeleteFile(path string) error {
	return os.Remove(path)
}

// FileExists checks if a file exists
func (s *LocalFileStorage) FileExists(path string) bool {
	_, err := os.Stat(path)
	return err == nil
}

// GetFileURL returns a URL for accessing a file
func (s *LocalFileStorage) GetFileURL(category, filename string) string {
	return fmt.Sprintf("/api/v1/file?folder=%s&filename=%s", category, filename)
}

// CleanupOldFiles removes files older than the retention period
func (s *LocalFileStorage) CleanupOldFiles(retentionPeriod time.Duration) error {
	// Calculate cutoff time
	cutoff := time.Now().Add(-retentionPeriod)

	// Cleanup upload directory
	if err := cleanupDir(s.uploadDir, cutoff); err != nil {
		return err
	}

	// Cleanup processed directories
	if err := cleanupDirWithSubdirs(s.processedDir, cutoff); err != nil {
		return err
	}

	// Cleanup temp directory
	if err := cleanupDir(s.tempDir, cutoff); err != nil {
		return err
	}

	return nil
}

// ensureDir creates a directory if it doesn't exist
func ensureDir(path string) {
	if _, err := os.Stat(path); os.IsNotExist(err) {
		os.MkdirAll(path, 0755)
	}
}

// cleanupDir removes files in a directory older than the cutoff time
func cleanupDir(dir string, cutoff time.Time) error {
	entries, err := os.ReadDir(dir)
	if err != nil {
		return err
	}

	for _, entry := range entries {
		if entry.IsDir() {
			continue
		}

		path := filepath.Join(dir, entry.Name())
		info, err := entry.Info()
		if err != nil {
			continue
		}

		if info.ModTime().Before(cutoff) {
			os.Remove(path)
		}
	}

	return nil
}

// cleanupDirWithSubdirs removes files in a directory and its subdirectories older than the cutoff time
func cleanupDirWithSubdirs(dir string, cutoff time.Time) error {
	return filepath.Walk(dir, func(path string, info os.FileInfo, err error) error {
		if err != nil {
			return err
		}

		if !info.IsDir() && info.ModTime().Before(cutoff) {
			return os.Remove(path)
		}

		return nil
	})
}
