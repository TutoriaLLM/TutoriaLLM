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
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile -r
RUN pnpm run -r build 

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


# フロントエンドのセットアップ（このステージでビルドを行う）
FROM base AS frontend
COPY --from=build /usr/src/tutoriallm /usr/src/tutoriallm
WORKDIR /usr/src/tutoriallm/apps/frontend
ARG VITE_BACKEND_URL
ENV VITE_BACKEND_URL=$VITE_BACKEND_URL
# 環境変数の設定
ENV PORT=3000
# 必要なポートを公開
EXPOSE 3000
# 必要な依存関係をインストール
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile --filter=frontend
# アプリケーションの起動時にビルド＆サーバーを実行
CMD ["sh", "-c", "pnpm run build && pnpm start"]
