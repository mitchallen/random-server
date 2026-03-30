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

# Upgrade OS packages to fix vulnerabilities (e.g. zlib)
RUN apk update && apk upgrade --no-cache && rm -rf /var/cache/apk/*

# Copy package files and install prod dependencies, then remove npm/yarn/corepack (not needed at runtime)
COPY package*.json ./
RUN npm ci --omit=dev && \
    rm -rf /usr/local/lib/node_modules/npm /usr/local/lib/node_modules/corepack /opt/yarn*

# Copy built artifacts
COPY --from=builder /app/dist ./dist

# Security: run as non-root
USER node

EXPOSE 3100
CMD ["node", "dist/index.js"]
