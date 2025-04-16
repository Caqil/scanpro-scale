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

# Create and activate a Python virtual environment
RUN python3 -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

# Install Python packages in the virtual environment
RUN pip3 install --upgrade pip && \
    pip3 install --no-cache-dir ocrmypdf PyPDF2

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

# Copy pre-built app artifacts
COPY ./node_modules ./node_modules
COPY ./.next ./.next
COPY ./public ./public
COPY ./package.json ./package.json
COPY ./next.config.js ./next.config.js
COPY ./prisma ./prisma
COPY ./scripts ./scripts

# Expose the port
EXPOSE 3000

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3000

# Start the app
CMD ["node", ".next/standalone/server.js"]