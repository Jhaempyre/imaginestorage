# Step 1: Install dependencies
FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm install

# Step 2: Build the app
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build Next.js (static export)
RUN npm run build
RUN echo "Available NPM scripts:" && npm run # ensures /app/out is generated

# Debug: show exact build output
RUN echo "---- CONTENTS OF /app/out ----" && ls -la /app/out

# Step 3: Final runtime container (only contains build output)
FROM alpine AS runner
WORKDIR /app

# Move Next.js "out" folder → /app/dist which is volume-mounted
COPY --from=builder /app/out /app/dist

# Debug: confirm files copied into volume mount location
RUN echo "---- CONTENTS OF /app/dist ----" && ls -la /app/dist

# container stays idle (this is a build-only container)
CMD ["sh", "-c", "echo 'Ready – build output is in /app/dist' && tail -f /dev/null"]
