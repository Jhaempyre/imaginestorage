# Stage 1 - Build
FROM node:18-alpine AS builder
WORKDIR /app

COPY package*.json ./
RUN npm install

COPY tsconfig.json ./
COPY src ./src

RUN npm run build

# Stage 2 - Runtime
FROM node:18-alpine
WORKDIR /app

COPY package*.json ./
RUN npm install --only=production

COPY --from=builder /app/dist ./dist

ENV PORT=9000
EXPOSE 9000

CMD ["node", "dist/server.js"]
