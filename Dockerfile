# Step 1: Build stage
FROM node:20-alpine AS builder
WORKDIR /app

# Copy package files and prisma schema first for better caching
COPY package*.json ./
COPY prisma ./prisma/

# Install dependencies
RUN npm ci

# Copy the rest of the application code
COPY . .

# Generate Prisma Client
RUN npx prisma generate

# Build the NestJS application
RUN npm run build

# Step 2: Runtime stage
FROM node:20-alpine AS runner
WORKDIR /app

# Copy package files and prisma schema
COPY package*.json ./
COPY prisma ./prisma/

# Install only production dependencies
RUN npm ci --omit=dev

# Generate Prisma Client for the production environment
RUN npx prisma generate

# Copy built application from builder stage
COPY --from=builder /app/dist ./dist

# Expose port
EXPOSE 3000

# Set environment variable defaults
ENV NODE_ENV=production
ENV PORT=3000

# Run migrations and start the NestJS server
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/main"]
