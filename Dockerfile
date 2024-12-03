FROM node:20-slim AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

FROM base AS build
COPY . /usr/src/tutoriallm
WORKDIR /usr/src/tutoriallm
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile
RUN pnpm run -r build
RUN pnpm deploy --filter=backend --prod /prod/backend
RUN pnpm deploy --filter=frontend --prod /prod/frontend

#バックエンドのビルド
FROM base AS backend
COPY --from=build /prod/backend /backend
WORKDIR /backend
# 環境変数を設定
ENV SERVER_PORT=3001
ENV VM_PORT=3002
EXPOSE 3001 3002
CMD [ "pnpm", "start" ]

#フロントエンドのビルド
FROM base AS frontend
COPY --from=build /prod/frontend /frontend
WORKDIR /frontend
# 環境変数を設定
ENV PORT=3000
EXPOSE 3000
CMD [ "pnpm", "start" ]
