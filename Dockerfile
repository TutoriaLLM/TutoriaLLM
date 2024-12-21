# ベースイメージ
FROM node:20-slim AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable
RUN apt-get update && apt-get install -y iproute2 net-tools ffmpeg

# フロントエンドビルド (バックエンドはビルドするが、フロントエンドで参照する目的のため、実行ファイルは存在しない)
FROM base AS build
COPY . /usr/src/tutoriallm
WORKDIR /usr/src/tutoriallm
ARG VITE_BACKEND_URL
ENV VITE_BACKEND_URL=$VITE_BACKEND_URL
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile -r
RUN pnpm run -r build 
RUN pnpm deploy --filter=frontend --prod /prod/frontend

# バックエンドのセットアップ (ビルドを行わず、そのままstartを実行)
FROM base AS backend
COPY --from=build /usr/src/tutoriallm /usr/src/tutoriallm
WORKDIR /usr/src/tutoriallm/apps/backend
# backend パッケージの依存関係だけをインストール
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile --filter=backend
# 環境変数の設定
ENV SERVER_PORT=3001
ENV VM_PORT=3002
# 必要なポートを公開
EXPOSE 3001 3002
# アプリケーションの起動 (buildをスキップして直接スタート)
CMD [ "pnpm", "start" ]


# フロントエンドのセットアップ
# docker hubには公開しない - Not public
FROM base AS frontend
COPY --from=build /prod/frontend /frontend
WORKDIR /frontend
# 環境変数の設定
ENV PORT=3000
# 必要なポートを公開
EXPOSE 3000
# アプリケーションの起動
CMD [ "pnpm", "start" ]
