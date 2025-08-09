FROM node:18-alpine

# Install security updates
RUN apk update && apk upgrade

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production && npm cache clean --force

# Copy source code
COPY . .

# Build the app
RUN npm run build

# Install a simple static file server
RUN npm install -g serve

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S react -u 1001

# Set permissions
RUN chown -R react:nodejs /app
USER react

EXPOSE 3000

CMD ["serve", "-s", "dist", "-l", "3000"]