# ─── Stage 1: Install dependencies ───────────────────────────
FROM node:20-alpine AS deps

WORKDIR /app

COPY package.json package-lock.json* ./

# Install all deps (including devDeps needed for build)
RUN npm ci


# ─── Stage 2: Build ───────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generate Prisma client then compile TypeScript
RUN npm run build


# ─── Stage 3: Production runner ───────────────────────────────
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

# Install only production dependencies
COPY package.json package-lock.json* ./
RUN npm ci --omit=dev && npm cache clean --force

# Copy compiled app
COPY --from=builder /app/dist ./dist

# Copy Prisma schema + config (needed for `prisma migrate deploy`)
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/prisma.config.ts ./prisma.config.ts

# Copy the generated Prisma client (contains runtime JS + query engine)
COPY --from=builder /app/src/generated ./src/generated

# Copy entrypoint script
COPY entrypoint.sh ./entrypoint.sh
RUN chmod +x ./entrypoint.sh

# Koyeb injects PORT automatically (default 8000).
# The app reads process.env.PORT so no hardcoding needed.
EXPOSE 8000

ENTRYPOINT ["./entrypoint.sh"]
