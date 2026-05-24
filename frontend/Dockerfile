# ─── Stage 1: Dependencies ─────────────────────────────────────────────────────
FROM node:20-alpine AS deps

WORKDIR /app

# Copy package files for layer-cached install
COPY package.json package-lock.json ./
RUN npm ci --frozen-lockfile

# ─── Stage 2: Development Server ───────────────────────────────────────────────
FROM node:20-alpine AS dev

WORKDIR /app

# Copy installed node_modules from deps stage
COPY --from=deps /app/node_modules ./node_modules

# Copy all source files
COPY . .

# Expose Vite dev server port
EXPOSE 5173

# Run dev server bound to all interfaces (required inside Docker)
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "5173"]
