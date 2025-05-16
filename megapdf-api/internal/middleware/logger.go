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
		if c.Request.Body != nil {
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

		// Don't log request/response bodies for large uploads/downloads
		contentType := c.GetHeader("Content-Type")
		if !strings.Contains(contentType, "multipart/form-data") && len(requestBody) < 1024 {
			logEntry["requestBody"] = string(requestBody)
		}

		if responseBuffer.Len() < 1024 {
			logEntry["responseBody"] = responseBuffer.String()
		}

		// Log as JSON
		if statusCode >= 400 {
			c.Error(fmt.Errorf("request failed with status %d", statusCode))
		}
	}
}

// responseBodyWriter is a wrapper around gin.ResponseWriter that captures the response body
type responseBodyWriter struct {
	gin.ResponseWriter
	buffer *bytes.Buffer
}

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
