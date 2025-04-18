# Multi-stage build
# Build stage
FROM node:20 AS builder

# Set working directory
WORKDIR /app

# Copy package files for efficient caching
COPY app/package.json app/package-lock.json ./

# Install dependencies
RUN npm ci

# Copy the rest of the application
COPY app/ ./

# Build the Next.js application
RUN npm run build

# Production stage
FROM node:20

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    ghostscript \
    libreoffice \
    poppler-utils \
    qpdf \
    pdftk \
    tesseract-ocr \
    tesseract-ocr-eng \
    python3-full \
    python3-venv \
    curl \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Create and activate a Python virtual environment
RUN python3 -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

# Install Python packages in the virtual environment
RUN pip3 install --upgrade pip && \
    pip3 install --no-cache-dir ocrmypdf PyPDF2

# Copy build artifacts from builder stage
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

# Create required directories for runtime
RUN mkdir -p \
    uploads \
    public/conversions \
    public/compressions \
    public/merges \
    public/splits \
    public/rotations \
    public/watermarks \
    public/protected \
    public/unlocked \
    public/signatures \
    public/ocr \
    public/edited \
    public/processed \
    temp \
    chatsessions

# Ensure correct permissions
RUN chmod -R 755 .

EXPOSE 3000

ENV NODE_ENV=production
ENV PORT=3000

CMD ["node", "server.js"]