package storage

import (
	"os"
	"path/filepath"
	"sync"
	"time"
)

// CleanupResult contains statistics about a cleanup operation
type CleanupResult struct {
	TotalCleaned int
	TotalSize    int64
	ByFolder     map[string]FolderCleanupStats
}

// FolderCleanupStats contains statistics for a specific folder
type FolderCleanupStats struct {
	FilesCleaned int
	TotalSize    int64
}

// CleanupProcessor performs a full cleanup of temporary files
type CleanupProcessor struct {
	storage StorageManager
}

// NewCleanupProcessor creates a new cleanup processor
func NewCleanupProcessor(storage StorageManager) *CleanupProcessor {
	return &CleanupProcessor{
		storage: storage,
	}
}

// Run performs a cleanup operation
func (p *CleanupProcessor) Run(retentionPeriod time.Duration) (*CleanupResult, error) {
	result := &CleanupResult{
		ByFolder: make(map[string]FolderCleanupStats),
	}

	// Cleanup upload directory
	uploadStats, err := p.cleanupDirStats(p.storage.GetUploadDir(), retentionPeriod)
	if err != nil {
		return nil, err
	}
	result.TotalCleaned += uploadStats.FilesCleaned
	result.TotalSize += uploadStats.TotalSize
	result.ByFolder["uploads"] = uploadStats

	// Cleanup processed directories
	processedDir := filepath.Dir(p.storage.GetProcessedDir(""))
	entries, err := os.ReadDir(processedDir)
	if err != nil {
		return nil, err
	}

	var wg sync.WaitGroup
	var mu sync.Mutex

	for _, entry := range entries {
		if !entry.IsDir() {
			continue
		}

		wg.Add(1)
		go func(dir string) {
			defer wg.Done()

			dirPath := filepath.Join(processedDir, dir)
			stats, err := p.cleanupDirStats(dirPath, retentionPeriod)
			if err != nil {
				return
			}

			mu.Lock()
			result.TotalCleaned += stats.FilesCleaned
			result.TotalSize += stats.TotalSize
			result.ByFolder[dir] = stats
			mu.Unlock()
		}(entry.Name())
	}

	// Cleanup temp directory
	tempStats, err := p.cleanupDirStats(p.storage.GetTempDir(), 1*time.Hour) // Shorter retention for temp files
	if err != nil {
		return nil, err
	}

	mu.Lock()
	result.TotalCleaned += tempStats.FilesCleaned
	result.TotalSize += tempStats.TotalSize
	result.ByFolder["temp"] = tempStats
	mu.Unlock()

	wg.Wait()

	return result, nil
}

// cleanupDirStats cleans up a directory and returns stats
func (p *CleanupProcessor) cleanupDirStats(dir string, retentionPeriod time.Duration) (FolderCleanupStats, error) {
	stats := FolderCleanupStats{}

	// Calculate cutoff time
	cutoff := time.Now().Add(-retentionPeriod)

	// Walk directory
	err := filepath.Walk(dir, func(path string, info os.FileInfo, err error) error {
		if err != nil {
			return nil // Skip files with errors
		}

		if !info.IsDir() && info.ModTime().Before(cutoff) {
			// Get file size
			stats.TotalSize += info.Size()
			stats.FilesCleaned++

			// Delete file
			return os.Remove(path)
		}

		return nil
	})

	return stats, err
}
