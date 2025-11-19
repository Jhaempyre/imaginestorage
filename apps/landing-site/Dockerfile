# Step 1: Install dependencies
FROM node:18-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm install

# Step 2: Build the app
FROM node:18-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build Next.js (static export)
RUN npm run build
RUN echo "Available NPM scripts:" && npm run # ensures /app/out is generated


#this is not running because of DockerFile to Dockerfile (will remove you after production)
# Step 3: Prepare static files.
FROM alpine AS runner
WORKDIR /app
COPY --from=builder /app/dist /app/dist