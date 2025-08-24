# Build stage
FROM node:20-alpine AS builder

# Set working directory
WORKDIR /app

# Install dependencies for building
RUN apk add --no-cache python3 make g++

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production && npm cache clean --force

# Production stage
FROM node:20-alpine AS production

# Create app user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install production dependencies
RUN npm ci --only=production && npm cache clean --force

# Copy source code
COPY --from=builder /app/node_modules ./node_modules
COPY . .

# Create uploads directory with proper permissions
RUN mkdir -p uploads && \
    chown -R nodejs:nodejs /app

# Switch to non-root user
USER nodejs

# Expose port
EXPOSE 5000

# Health check with better error handling
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
  CMD node -e "require('http').get('http://localhost:5000/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

# Start the application
CMD ["npm", "start"]
