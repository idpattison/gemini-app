# Dockerfile

# Stage 1: Install dependencies and build the Next.js app
FROM cgr.dev/chainguard/node:latest-dev as builder

# Set working directory
WORKDIR /app

# Copy pnpm-lock.yaml and package.json to leverage Docker cache
COPY package.json pnpm-lock.yaml* ./
RUN pnpm fetch --prod

# Copy all source code
COPY . .

# Install dependencies (using fetched packages)
RUN pnpm install --offline --prod --frozen-lockfile

# Build the Next.js application
RUN pnpm build

# Stage 2: Create the production image
FROM cgr.dev/chainguard/node:latest-dev as runner

WORKDIR /app

# Set production environment
ENV NODE_ENV production

# Copy Next.js build artifacts and static assets
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/public ./public
COPY --from=builder /app/.pnpm-store ./.pnpm-store

# Copy next.config.js and other necessary files for runtime
COPY next.config.js .
COPY package.json .

# Expose the port Next.js runs on (default 3000)
EXPOSE 3000

# Command to run the Next.js application
CMD ["pnpm", "start"]
