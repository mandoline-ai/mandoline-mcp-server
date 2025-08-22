# syntax=docker/dockerfile:1

ARG NODE_VERSION=20.10.0
FROM node:${NODE_VERSION}-slim AS base
LABEL fly_launch_runtime="Node.js"
WORKDIR /app
ENV NODE_ENV=production

FROM base AS build

# OS tooling needed for native deps
RUN apt-get update -qq \
  && apt-get install --no-install-recommends -y \
     build-essential node-gyp pkg-config python-is-python3

# install deps first for better layer cache
COPY package*.json ./
RUN npm ci --include=dev

# then copy sources & build
COPY . .
RUN npm run build

# strip dev deps
RUN npm prune --omit=dev

FROM base
COPY --from=build /app /app

EXPOSE 8080
CMD ["npm", "run", "start"]
