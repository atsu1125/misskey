FROM node:16.18.1-bullseye AS builder

ENV NODE_ENV=production
WORKDIR /misskey

RUN apt-get update \
 && apt-get install -y --no-install-recommends build-essential

RUN git init
RUN git submodule update --init
COPY package.json yarn.lock ./
RUN yarn install --network-timeout 100000
COPY . ./
RUN yarn build


FROM node:16.18.1-bullseye-slim AS runner

WORKDIR /misskey

RUN apt-get update \
 && apt-get install -y --no-install-recommends ffmpeg mecab mecab-ipadic-utf8 tini wget\
 && apt-get -y clean \
 && rm -rf /var/lib/apt/lists/*

COPY --from=builder /misskey/node_modules ./node_modules
COPY --from=builder /misskey/built ./built
COPY . ./

ENV NODE_ENV=production
ENTRYPOINT ["/usr/bin/tini", "--"]
CMD ["npm", "start"]
