# Use a Go base image for building the application
FROM golang:1.21-bullseye AS builder

WORKDIR /app

# Copy go.mod and go.sum files first to leverage Docker cache
COPY api/go.mod api/go.sum ./
RUN go mod download

# Copy the source code
COPY api/ ./

# Build the application
RUN CGO_ENABLED=1 GOOS=linux go build -o megapdf-api ./cmd/api

# Create the runtime image
FROM debian:bullseye-slim

# Set environment variables
ENV PORT=8080
ENV DEBUG=false
ENV TEMP_DIR=/tmp
ENV UPLOAD_DIR=/app/uploads
ENV PUBLIC_DIR=/app/public
ENV DATABASE_PATH=/app/data/megapdf.db

# Install required PDF processing tools and dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    qpdf \
    pdftk \
    ghostscript \
    poppler-utils \
    libreoffice \
    tesseract-ocr \
    tesseract-ocr-eng \
    ca-certificates \
    sqlite3 \
    curl \
    wget \
    unzip \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Install pdfcpu (not available in Debian repositories)

# Install Go
RUN curl -LO https://go.dev/dl/go1.24.3.linux-amd64.tar.gz && \
    tar -C /usr/local -xzf go1.24.3.linux-amd64.tar.gz && \
    rm go1.24.3.linux-amd64.tar.gz
ENV PATH="/usr/local/go/bin:$PATH"

# Verify Go installation
RUN go version

# Install pdfcpu
RUN go install github.com/pdfcpu/pdfcpu/cmd/pdfcpu@latest
ENV PATH="/root/go/bin:$PATH"

# Create and activate a Python virtual environment
RUN python3 -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

# Install Python packages in the virtual environment
RUN pip3 install --upgrade pip && \
    pip3 install --no-cache-dir ocrmypdf PyPDF2

# Create necessary directories
RUN mkdir -p /app/uploads /app/public /app/data /app/temp

# Copy the compiled Go binary from the builder stage
WORKDIR /app
COPY --from=builder /app/megapdf-api .

# Create subdirectories for file storage
RUN mkdir -p /app/public/conversions \
    /app/public/compressions \
    /app/public/merges \
    /app/public/splits \
    /app/public/rotations \
    /app/public/watermarked \
    /app/public/watermarks \
    /app/public/protected \
    /app/public/unlocked \
    /app/public/pagenumbers \
    /app/public/ocr \
    /app/public/edited \
    /app/public/processed \
    /app/public/unwatermarked \
    /app/public/redacted \
    /app/public/repaired \
    /app/public/signatures \
    /app/public/status

# Make the binary executable
RUN chmod +x /app/megapdf-api

# Expose the port the app runs on
EXPOSE 8080

# Command to run the application
CMD ["/api"]