# syntax=docker/dockerfile:1

# --- Build stage: install production dependencies and collect source ---
FROM node:20-alpine AS builder
WORKDIR /usr/src/app

# Install only production dependencies
COPY package*.json ./
RUN npm ci --omit=dev --silent

# Copy application source (no TypeScript build needed for this project)
COPY . .

# --- Runtime stage: minimal runtime with prod deps ---
FROM node:20-alpine AS runner
WORKDIR /usr/src/app

# Runtime env
ENV NODE_ENV=production
ENV PORT=5000

# Copy only what is needed to run
COPY --from=builder /usr/src/app/package*.json ./
COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY --from=builder /usr/src/app/src ./src

# Drop root for security
USER node

# Expose app port
EXPOSE 5000

# Start the app
CMD ["node", "src/index.js"]
