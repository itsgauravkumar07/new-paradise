# Use Node.js 20 LTS Alpine as base image
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Create app user for security
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

# Copy package files
COPY package*.json ./

# Install dependencies with npm ci for faster, reliable builds
RUN npm ci --only=production && npm cache clean --force

# Copy application code
COPY . .

# Create uploads directory and set permissions
RUN mkdir -p uploads && chown -R nodejs:nodejs /app

# Switch to non-root user
USER nodejs

# Expose port 5000
EXPOSE 5000

# Set environment variables
ENV NODE_ENV=production
ENV PORT=5000

# Inject sensitive values at runtime (Docker/K8s secrets, CI/CD vars, or .env file).
# Do not hardcode real credentials in images/repository.
ENV MONGODB_URI=""
ENV CLIENT_ORIGIN=""
ENV CLOUDINARY_CLOUD_NAME=""
ENV CLOUDINARY_API_KEY=""
ENV CLOUDINARY_API_SECRET=""
ENV JWT_SECRET=""
ENV BACKEND_URL=""
ENV GMAIL_USER=""
ENV GMAIL_APP_PASSWORD=""
ENV INTERNAL_API_TOKEN=""



# Add health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:5000/', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]

# Start the application
CMD ["npm", "start"]
