FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm install

FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build
# Verify the build output
RUN ls -la /app/out || ls -la /app/.next

FROM alpine AS runner
WORKDIR /app
# Copy from wherever Next.js outputs (usually 'out' for static export)
COPY --from=builder /app/out /app/dist
# Verify files were copied
RUN ls -la /app/dist