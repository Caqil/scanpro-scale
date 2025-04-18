# Build stage
FROM node:20 AS builder
WORKDIR /app
COPY app/ .
RUN npm ci
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
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

# Create required folders inside /app/public
RUN mkdir -p public/{conversions,compressions,merges,splits,rotations,watermarked,watermarks,protected,unlocked,signatures,ocr,edited,processed,unwatermarked,redacted,repaired,pagenumbers,status}

# Expose port and set environment variables
EXPOSE 3000
ENV NODE_ENV=production
ENV PORT=3000

# Start the Next.js app
CMD ["node", "server.js"]
