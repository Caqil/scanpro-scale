# Production image
FROM node:18

# Set working directory
WORKDIR /app

# Install system dependencies...
# [keep your existing installation steps]

# Copy the entire Next.js standalone output
COPY app/.next/standalone ./
COPY app/.next/static ./.next/static
COPY app/public ./public

# Expose the port
EXPOSE 3000

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3000

# Start the app
CMD ["node", "server.js"]