# --- Stage 1 ---

# Use Node.js 24 Alpine image as a parent image
FROM node:24-alpine AS builder

# Set the working directory to /app
WORKDIR /app

# Copy files to the container
COPY . .

# Install dependencies
RUN npm install

# Clean project (just in case dist gets checked in)
RUN npm run clean

# Build TypeScript project
RUN npm run build

# --- Stage 2 ---

FROM node:24-alpine AS prod

# Set the working directory for Stage 2
WORKDIR /app

# Copy just the dist folder from Stage 1
COPY --from=builder ./app/dist ./dist

# Copy package.json, etc to root
COPY package* ./

# Install packages needed for prod
RUN npm install --production

# Set the container's default command to start the server
CMD ["npm", "start"]

# Document which port to use
EXPOSE 3100