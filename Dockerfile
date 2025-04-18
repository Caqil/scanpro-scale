# Build stage
FROM node:20 AS builder
WORKDIR /app
# Copy the entire app folder (including package.json, package-lock.json, and scripts)
COPY app/ .
# Run npm ci in the correct directory
RUN npm ci
# Build the Next.js app
RUN npm run build

# Production stage
FROM node:20
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

# Copy the standalone output from the builder stage
COPY --from=builder /app/.next/standalone ./
# Copy static files
COPY --from=builder /app/.next/static ./.next/static
# Copy public folder
COPY --from=builder /app/public ./public

# Expose port and set environment variables
EXPOSE 3000
ENV NODE_ENV=production
ENV PORT=3000

# Start the Next.js app
CMD ["node", "server.js"]