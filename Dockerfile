# Base image
FROM node:20-slim AS base

# Required for build /docs package
ARG OPENAPI_DOCS_URL
ENV OPENAPI_DOCS_URL=${OPENAPI_DOCS_URL}


ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
# FIX: Bad workaround (https://github.com/nodejs/corepack/issues/612)
ENV COREPACK_INTEGRITY_KEYS=0

RUN corepack enable
RUN apt-get update && apt-get install -y iproute2 net-tools ffmpeg

#Build entire repository to ensure that all dependencies are installed and built
FROM base AS build
COPY . /usr/src/tutoriallm
WORKDIR /usr/src/tutoriallm
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile -r
RUN pnpm run -r --filter=!frontend build

# Backend setup (skip build and start directly)
FROM base AS backend
COPY --from=build /usr/src/tutoriallm /usr/src/tutoriallm
WORKDIR /usr/src/tutoriallm/apps/backend
# Install only the dependencies of the backend package
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile --filter=backend
# Set environment variables
ENV SERVER_PORT=3001
ENV VM_PORT=3002
# Expose the necessary ports
EXPOSE 3001 3002
# Start the application (skip build and start directly)
CMD [ "pnpm", "start" ]


# Frontend setup (build at runtime)
FROM base AS frontend
COPY --from=build /usr/src/tutoriallm /usr/src/tutoriallm
WORKDIR /usr/src/tutoriallm/apps/frontend
# Install the necessary dependencies
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile --filter=frontend
# Expose the frontend port
ENV PORT=3000
EXPOSE 3000
# Runtime build and start using VITE_BACKEND_URL
CMD ["sh", "-c", "VITE_BACKEND_URL=$VITE_BACKEND_URL pnpm run build && pnpm start"]