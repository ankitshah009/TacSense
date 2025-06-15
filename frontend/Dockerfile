# -------- Stage 1: Install dependencies --------
FROM node:18-alpine AS deps

WORKDIR /app

# Copy dependency files first for better caching
COPY package.json package-lock.json ./

# Install all dependencies (dev + prod) for building
RUN npm ci

# -------- Stage 2: Build the application --------
FROM node:18-alpine AS builder
WORKDIR /app

# Copy installed node_modules from deps stage
COPY --from=deps /app/node_modules ./node_modules

# Copy the rest of the source code
COPY . .

# Build the Next.js app
RUN npm run build

# -------- Stage 3: Run the production server --------
FROM node:18-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

# Copy package.json to ensure correct metadata
COPY package.json ./

# Copy built application and node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/public ./public
COPY --from=builder /app/next.config.js ./next.config.js

EXPOSE 3000

CMD ["npm", "start"] 