# Build stage
FROM node:20 AS builder
WORKDIR /app

# Copy files
COPY . .

# Install dependencies
RUN npm ci

# Build the Next.js app
RUN npm run build

# Production stage
FROM node:20-slim
WORKDIR /app

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3000
ENV NEXT_PUBLIC_API_URL=https://api:mega-pdf.com

# Copy built app from builder stage
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# Create public directory and copy files
RUN mkdir -p ./public
COPY --from=builder /app/public ./public/

# Expose Next.js port
EXPOSE 3000

# Start the Next.js app
CMD ["node", "server.js"]