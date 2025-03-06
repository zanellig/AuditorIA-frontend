# syntax=docker.io/docker/dockerfile:1

# DOCKER_BUILDKIT=1 docker build -t auditoria:latest .

FROM node:20.18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install dependencies based on the preferred package manager
COPY package.json yarn.lock* package-lock.json* pnpm-lock.yaml* .npmrc* ./
RUN \
  if [ -f yarn.lock ]; then yarn --frozen-lockfile; \
  elif [ -f package-lock.json ]; then npm ci; \
  elif [ -f pnpm-lock.yaml ]; then corepack enable pnpm && pnpm i --frozen-lockfile; \
  else echo "Lockfile not found." && exit 1; \
  fi

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED=1

RUN --mount=type=cache,target=/root/.npm \
  npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NEXT_TELEMETRY_DISABLED=1

# --- Install smbclient ---
RUN apk add --no-cache samba-client

# --- IMPORTANT: Build-time Environment Variables ---
ARG API_MAIN
ARG API_CANARY_7000
ARG API_CANARY_8000
ARG NEXT_RUNTIME
ARG APP_ENV
ARG NODE_ENV=production
ARG NEXT_CPU_PROF
ARG NEXT_TURBOPACK_TRACING
ARG NEXT_PUBLIC_STACK_PROJECT_ID
ARG NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY
ARG HOST=10.20.62.96
ARG PORT=80

# Pass build-time ARG values as runtime ENV variables
ENV API_MAIN=${API_MAIN} \
    API_CANARY_7000=${API_CANARY_7000} \
    API_CANARY_8000=${API_CANARY_8000} \
    NEXT_RUNTIME=${NEXT_RUNTIME} \
    APP_ENV=${APP_ENV} \
    NODE_ENV=${NODE_ENV} \
    NEXT_CPU_PROF=${NEXT_CPU_PROF} \
    NEXT_TURBOPACK_TRACING=${NEXT_TURBOPACK_TRACING} \
    NEXT_PUBLIC_STACK_PROJECT_ID=${NEXT_PUBLIC_STACK_PROJECT_ID} \
    NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY=${NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY} \
    PORT=${PORT} \
    HOST=${HOST}

# --- Security ---
RUN addgroup -S nodejs && adduser -S nextjs -G nodejs

RUN mkdir -p /app/.next/cache && chown nextjs:nodejs /app/.next/cache

COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE ${PORT}

CMD ["node", "server.js"]