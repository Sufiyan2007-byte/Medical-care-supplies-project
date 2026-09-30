# Use official Node.js LTS image (Debian-based "slim" — has proper OpenSSL,
# unlike node:20-alpine which breaks Prisma's engine on newer Alpine releases)
FROM node:20-slim AS builder

WORKDIR /app

# Prisma's engine needs OpenSSL at build time
RUN apt-get update -y && apt-get install -y openssl ca-certificates && rm -rf /var/lib/apt/lists/*

# Copy package files and install dependencies
COPY package*.json ./
COPY prisma ./prisma/

RUN npm install

# Generate Prisma Client
RUN npx prisma generate

# Copy source files
COPY . .

# Production runner stage
FROM node:20-slim AS runner

WORKDIR /app

# Prisma's engine also needs OpenSSL at runtime
RUN apt-get update -y && apt-get install -y openssl ca-certificates && rm -rf /var/lib/apt/lists/*

ENV NODE_ENV=production
ENV PORT=5000

# Copy node_modules and built code from builder
COPY --from=builder /app ./

EXPOSE 5000

CMD ["sh", "-c", "npx prisma db push && node index.js"]
