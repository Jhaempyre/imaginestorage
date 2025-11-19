# Step 1: Install dependencies
FROM node:20-alpine AS deps
WORKDIR /app

# ---- INSTALL DEPENDENCIES ----
FROM base AS deps
COPY package*.json ./
RUN npm install

# Step 2: Build the app
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build


# ---- PRODUCTION DEPS ----
FROM base AS prod-deps
WORKDIR /app
COPY --from=builder /app/dist ./dist
