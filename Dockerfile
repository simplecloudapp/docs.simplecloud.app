# syntax = docker/dockerfile:1

FROM oven/bun:latest as base

LABEL fly_launch_runtime="Bun"

# App lives here
WORKDIR /app

# Set production environment
ENV NODE_ENV="production"

# Throw-away build stage to reduce size of final image
FROM base as build

# Install packages needed to build
RUN apt-get update -qq && \
    apt-get install --no-install-recommends -y build-essential pkg-config

# Install dependencies
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

# Copy application code
COPY . .

# Build application
RUN bun run build

# Remove development dependencies
RUN bun install --production --frozen-lockfile

# Final stage for app image
FROM base

# Copy built application
COPY --from=build /app /app

# Start the server by default, this can be overwritten at runtime
EXPOSE 3000
CMD [ "bun", "run", "start" ]
