// middleware/logger.go
package middleware

import (
	"bytes"
	"fmt"
	"io"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
)

// Logger middleware logs request and response details
func Logger() gin.HandlerFunc {
	return func(c *gin.Context) {
		// Start timer
		start := time.Now()

		// Create a copy of the request body
		var requestBody []byte
		if c.Request.Body != nil && shouldLogBody(c) {
			requestBody, _ = io.ReadAll(c.Request.Body)
			c.Request.Body = io.NopCloser(bytes.NewBuffer(requestBody))
		}

		// Create a buffer for the response body
		responseBuffer := &bytes.Buffer{}
		originalWriter := c.Writer
		c.Writer = &responseBodyWriter{
			ResponseWriter: originalWriter,
			buffer:         responseBuffer,
		}

		// Process request
		c.Next()

		// Calculate latency
		latency := time.Since(start)

		// Log the request and response
		statusCode := c.Writer.Status()
		clientIP := c.ClientIP()
		method := c.Request.Method
		path := c.Request.URL.Path
		query := c.Request.URL.RawQuery
		userAgent := c.Request.UserAgent()

		// Get user ID from context if authenticated
		userID, _ := c.Get("userID")

		// Log the request
		logEntry := map[string]interface{}{
			"timestamp": time.Now().Format(time.RFC3339),
			"latency":   latency.String(),
			"clientIP":  clientIP,
			"method":    method,
			"path":      path,
			"query":     query,
			"status":    statusCode,
			"userAgent": userAgent,
			"userID":    userID,
		}

		// Only log request/response bodies for non-file uploads and smaller payloads
		if shouldLogBody(c) && len(requestBody) < 10240 {
			// Remove sensitive information (like passwords)
			sanitizedBody := sanitizeBody(string(requestBody))
			logEntry["requestBody"] = sanitizedBody
		}

		// Only log response body if it's not too large
		// And only if it's not a file download or binary response
		if shouldLogBody(c) && responseBuffer.Len() < 10240 {
			logEntry["responseBody"] = responseBuffer.String()
		}

		// Log as JSON using appropriate log level based on status code
		if statusCode >= 500 {
			fmt.Printf("[ERROR] %v\n", logEntry)
		} else if statusCode >= 400 {
			fmt.Printf("[WARN] %v\n", logEntry)
		} else {
			fmt.Printf("[INFO] %v\n", logEntry)
		}
	}
}

// shouldLogBody determines if the request/response body should be logged
func shouldLogBody(c *gin.Context) bool {
	// Don't log bodies for file uploads/downloads
	contentType := c.GetHeader("Content-Type")
	if strings.Contains(contentType, "multipart/form-data") {
		return false
	}

	// Don't log bodies for binary responses
	respContentType := c.Writer.Header().Get("Content-Type")
	if strings.Contains(respContentType, "application/pdf") ||
		strings.Contains(respContentType, "image/") ||
		strings.Contains(respContentType, "audio/") ||
		strings.Contains(respContentType, "video/") ||
		strings.Contains(respContentType, "application/octet-stream") {
		return false
	}

	return true
}

// sanitizeBody removes sensitive information from request bodies
func sanitizeBody(body string) string {
	// This is a simple implementation - in production, you'd want to
	// use a more sophisticated approach
	sensitiveFields := []string{
		"password",
		"token",
		"key",
		"secret",
		"credential",
	}

	for _, field := range sensitiveFields {
		// Simple regex-like replacement for demonstration purposes
		// In reality, you'd use a proper JSON/form parser and redact specific fields
		pattern := fmt.Sprintf(`"%s"\s*:\s*"[^"]*"`, field)
		replacement := fmt.Sprintf(`"%s":"[REDACTED]"`, field)
		body = strings.Replace(body, pattern, replacement, -1)
	}

	return body
}

// responseBodyWriter is a wrapper around gin.ResponseWriter that captures the response body
type responseBodyWriter struct {
	gin.ResponseWriter
	buffer *bytes.Buffer
}

// Write captures the response and writes it to the buffer
func (w *responseBodyWriter) Write(b []byte) (int, error) {
	// Write to the original writer
	size, err := w.ResponseWriter.Write(b)
	if err != nil {
		return size, err
	}

	// Also write to the buffer
	_, bufErr := w.buffer.Write(b)
	if bufErr != nil {
		return size, bufErr
	}

	return size, nil
}