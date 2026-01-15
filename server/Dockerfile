# syntax=docker/dockerfile:1

# --- Build stage: install production dependencies and collect source ---
FROM node:20-alpine AS builder
WORKDIR /usr/src/app

# Install only production dependencies (scoped to server app)
COPY server/package*.json ./
# Native deps (e.g., pg) need build tooling on Alpine
RUN apk add --no-cache python3 make g++ \
    && npm ci --omit=dev

# Copy application source (no TypeScript build needed for this project)
COPY server/. .

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
