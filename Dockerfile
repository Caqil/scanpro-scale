# Production image
FROM node:20

# Set working directory
WORKDIR /app

# Install system dependencies...
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
COPY app/.next/standalone ./
COPY app/.next/static ./.next/static
COPY app/public ./public

EXPOSE 3000

ENV NODE_ENV=production
ENV PORT=3000

CMD ["node", "server.js"]