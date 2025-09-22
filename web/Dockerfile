# Web (Next.js) Dockerfile
FROM node:20-alpine AS base
WORKDIR /app

# Enable corepack (yarn) and pin Yarn to match package.json packageManager
RUN corepack enable && corepack prepare yarn@3.2.3 --activate

# Copy full project before install so Yarn Berry can create and keep install-state
COPY . .

# Provide build-time env required by Next.js and check-env-variables
ARG NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY
ARG MEDUSA_BACKEND_URL
ENV NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=${NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY}
ENV MEDUSA_BACKEND_URL=${MEDUSA_BACKEND_URL}

# Install deps with Yarn Berry (node-modules linker by default here)
RUN yarn install --immutable

# Build
RUN yarn build

# Runtime image
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

COPY --from=base /app/node_modules ./node_modules
COPY --from=base /app/.next ./.next
COPY --from=base /app/public ./public
COPY --from=base /app/package.json ./package.json

EXPOSE 3000
CMD ["yarn", "start"]
