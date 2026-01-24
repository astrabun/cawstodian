# Multi-stage Dockerfile using pnpm
FROM node:slim AS builder
WORKDIR /app

# Install pnpm globally (avoid relying on corepack availability)
RUN npm install -g pnpm@latest

# Install dependencies using the lockfile when present
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# Copy source and build (if a build script exists)
COPY . .
RUN pnpm build

FROM node:slim AS runner
# Ensure pnpm is available in the runtime image
WORKDIR /app
RUN npm install -g pnpm@latest
ENV NODE_ENV=production

# Copy built app and node_modules from builder
COPY --from=builder /app /app

# Run the app using pnpm
CMD ["pnpm", "start"]
