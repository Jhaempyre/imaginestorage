# ---- BASE IMAGE WITH SYSTEM DEPENDENCIES ----
FROM node:18-bullseye AS base

RUN apt-get update && apt-get install -y \
    poppler-utils \
    libreoffice \
    ffmpeg \
    && apt-get clean

WORKDIR /app

# ---- INSTALL DEPENDENCIES ----
FROM base AS deps
COPY package*.json ./
RUN npm install


# ---- BUILD ----
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build


# ---- PRODUCTION DEPS ----
FROM base AS prod-deps
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production


# ---- FINAL RUNTIME ----
FROM base AS runner
WORKDIR /app

COPY --from=prod-deps /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist

USER node
EXPOSE 3000

CMD ["node", "dist/main.js"]