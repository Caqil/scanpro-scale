# Use Node.js as base image with Ubuntu
FROM node:18 AS builder

# Set working directory
WORKDIR /app

# Install system dependencies for PDF processing
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
    build-essential \
    wget \
    curl \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Create and activate a Python virtual environment
RUN python3 -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

# Install Python packages in the virtual environment
RUN pip3 install --upgrade pip && \
    pip3 install --no-cache-dir ocrmypdf PyPDF2

# Copy package.json, package-lock.json and scripts first
COPY package.json package-lock.json* ./
COPY scripts ./scripts/

# Create directory structure for tesseract.js
RUN mkdir -p node_modules/tesseract.js/tessdata

# Install dependencies with legacy peer deps flag to handle version conflicts
# and ignore scripts to prevent errors during installation
RUN npm ci --legacy-peer-deps

# Run tessdata download script manually (if it exists)
RUN if [ -f "scripts/download-tessdata.js" ]; then node scripts/download-tessdata.js || true; fi

# Copy the rest of the app
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Build the application
RUN npm run build

# Production image
FROM node:18

# Set working directory
WORKDIR /app

# Install system dependencies for PDF processing (runtime only)
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

# Copy the virtual environment from the builder stage
COPY --from=builder /opt/venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

# Create necessary directories with proper permissions
RUN mkdir -p \
    uploads \
    temp \
    temp-conversions \
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
    public/pagenumbers \
    public/zips \
    public/processed \
    public/repaired \
    && chmod 777 -R \
    uploads \
    temp \
    temp-conversions \
    public

# Copy built app from builder stage
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/next.config.js ./next.config.js
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/scripts ./scripts

# Expose the port
EXPOSE 3001

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3001

# Start the app
CMD ["node", ".next/standalone/server.js"]