FROM node:22-slim AS base
WORKDIR /app

# Install dependencies
FROM base AS dependencies
COPY package*.json ./
RUN npm install

# Build stage
FROM dependencies AS builder
COPY . .
RUN npm run build

# Production stage
FROM base AS runner
WORKDIR /app

# Copy built output
COPY --from=builder /app/.output ./

ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=3000

EXPOSE 3000

CMD ["node", "server/index.mjs"]
