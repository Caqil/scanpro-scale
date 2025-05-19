# Build stage
FROM node:20 AS builder
WORKDIR /app

# First check if we have the necessary files
COPY . .

# Log the directory structure to debug
RUN ls -la

# Install dependencies
RUN npm ci || (cat /root/.npm/_logs/*-debug-0.log && exit 1)

# Build the Next.js app
RUN npm run build

# Production stage
FROM node:20-slim
WORKDIR /app

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3000
ENV NEXT_PUBLIC_API_URL=http://api:8080

# Copy built app from builder stage
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public 2>/dev/null || :

# Explicitly copy the sitemap files and robots.txt if they exist
COPY --from=builder /app/public/sitemap*.xml ./public/ 2>/dev/null || :
COPY --from=builder /app/public/robots.txt ./public/ 2>/dev/null || :

# Expose Next.js port
EXPOSE 3000

# Start the Next.js app
CMD ["node", "server.js"]