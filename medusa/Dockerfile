# Medusa service Dockerfile
# Use Node 20 LTS
FROM node:20-alpine AS base

# Set working directory
WORKDIR /app

# Install dependencies (use yarn)
RUN corepack enable

# Copy package files
COPY package.json yarn.lock ./

# Install deps
RUN yarn install --frozen-lockfile

# Copy the rest of the source code
COPY . .

# Build Medusa project
RUN yarn build

# Production image
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# Copy node_modules and build artifacts from builder
COPY --from=base /app/node_modules ./node_modules
# Medusa build outputs to .medusa/server per tsconfig.json
COPY --from=base /app/.medusa/server ./.medusa/server
COPY package.json ./package.json
COPY medusa-config.ts ./medusa-config.ts

# Expose Medusa default port
EXPOSE 9000

# Start Medusa server
CMD ["yarn", "start"]
