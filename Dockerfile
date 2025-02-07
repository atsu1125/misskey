FROM node:20.12.2-bookworm AS builder

ENV NODE_ENV=production
ENV COREPACK_DEFAULT_TO_LATEST=0
WORKDIR /misskey

RUN apt-get update \
 && apt-get install -y --no-install-recommends build-essential

COPY package.json pnpm-lock.yaml ./

RUN corepack enable pnpm

RUN pnpm i --frozen-lockfile

COPY . ./

RUN pnpm build

FROM node:20.12.2-bookworm-slim AS runner

ENV COREPACK_DEFAULT_TO_LATEST=0
WORKDIR /misskey

RUN apt-get update \
 && apt-get install -y --no-install-recommends ffmpeg mecab mecab-ipadic-utf8 tini curl wget\
 && apt-get -y clean \
 && rm -rf /var/lib/apt/lists/* \
 && corepack enable pnpm

COPY --from=builder /misskey/node_modules ./node_modules
COPY --from=builder /misskey/built ./built
COPY . ./

ENV NODE_ENV=production
ENTRYPOINT ["/usr/bin/tini", "--"]
CMD ["pnpm", "start"]
