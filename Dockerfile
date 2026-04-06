# syntax = docker/dockerfile:1

ARG NODE_VERSION=20-alpine
FROM node:${NODE_VERSION} AS base

WORKDIR /app
ENV NODE_ENV="production"

# Build stage
FROM base AS build

RUN apk add --no-cache python3 make g++

COPY package-lock.json package.json ./
RUN npm install --include=dev --legacy-peer-deps

COPY . .

RUN npx prisma generate
RUN npm run build

RUN npm prune --omit=dev

# Final stage
FROM base

COPY --from=build /app /app

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "--require", "tsconfig-paths/register", "server.ts"]
