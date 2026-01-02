# --- Stage 1: Build ---
FROM node:24-alpine AS builder
WORKDIR /app

# Copy package files first for better caching
COPY package*.json ./
RUN npm ci

# Copy source and build
COPY . .
RUN npm run clean && npm run build

# --- Stage 2: Production ---
FROM node:24-alpine AS prod
WORKDIR /app

# Copy package files and install prod dependencies
COPY package*.json ./
RUN npm ci --omit=dev

# Copy built artifacts
COPY --from=builder /app/dist ./dist

# Security: run as non-root
USER node

EXPOSE 3100
CMD ["node", "dist/index.js"]
