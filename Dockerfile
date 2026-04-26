FROM node:22-alpine AS base
WORKDIR /app

# Install dependencies
FROM base AS dependencies
COPY package*.json ./
RUN npm ci

# Build stage
FROM dependencies AS builder
COPY . .
RUN npm run build

# Production stage
FROM base AS runner
WORKDIR /app

# Copy built output and necessary files
COPY --from=builder /app/.output /app/.output
COPY --from=builder /app/node_modules/.output /app/node_modules/.output

ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=3000

EXPOSE 3000

CMD ["node", ".output/server/index.mjs"]
