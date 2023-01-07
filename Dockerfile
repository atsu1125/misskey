FROM fedora:37 AS builder

ENV NODE_ENV=production
WORKDIR /misskey

RUN dnf update -y \
 && dnf groupinstall -y "Development Tools" \
 && dnf install -y wget gcc-c++

ENV NODE_VER="16.18.1"
RUN ARCH= && \
    unameArch="$(uname -m)" && \
  case "${unameArch##*-}" in \
    x86_64) ARCH='x64';; \
    aarch64) ARCH='arm64';; \
    *) echo "unsupported architecture"; exit 1 ;; \
  esac && \
    echo "Etc/UTC" > /etc/localtime && \
  cd ~ && \
	wget -q https://nodejs.org/download/release/v$NODE_VER/node-v$NODE_VER-linux-$ARCH.tar.gz && \
	tar xf node-v$NODE_VER-linux-$ARCH.tar.gz && \
	rm node-v$NODE_VER-linux-$ARCH.tar.gz && \
	mv node-v$NODE_VER-linux-$ARCH /opt/node

ENV PATH="${PATH}:/opt/node/bin"

RUN npm install -g npm@latest && \
	npm install -g yarn

COPY package.json yarn.lock ./
RUN yarn install --network-timeout 100000
COPY . ./
RUN yarn build

FROM fedora:37 AS runner

WORKDIR /misskey

RUN dnf update -y \
 && dnf install -y \
 https://download1.rpmfusion.org/free/fedora/rpmfusion-free-release-$(rpm -E %fedora).noarch.rpm \
 https://download1.rpmfusion.org/nonfree/fedora/rpmfusion-nonfree-release-$(rpm -E %fedora).noarch.rpm \
 && dnf install -y ffmpeg mecab tini wget

COPY --from=builder /misskey/node_modules ./node_modules
COPY --from=builder /misskey/built ./built
# Copy over all the langs needed for runtime
COPY --from=builder /opt/node /opt/node
COPY . ./

# Add more PATHs to the PATH
ENV PATH="${PATH}:/opt/node/bin"

ENV NODE_ENV=production
ENTRYPOINT ["/usr/bin/tini", "--"]
CMD ["npm", "start"]
