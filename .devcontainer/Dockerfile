# Use the Ubuntu-based devcontainer image
FROM mcr.microsoft.com/devcontainers/base:ubuntu

# Avoid prompts during package installation
ENV DEBIAN_FRONTEND=noninteractive

# 1. Install Project and Base tools via APT
# Note: zola and watchexec are typically not in standard apt repos
RUN apt-get update && apt-get install -y --no-install-recommends \
    git jq yq ripgrep curl bash \
    openssh-client gnupg procps lsof htop net-tools \
    psmisc wget rsync ca-certificates unzip xz-utils zip nano vim less \
    sudo coreutils sed grep sntp ncdu strace \
    libc6 libstdc++6 krb5-user libintl-perl tzdata liburcu-dev zlib1g \
    nodejs npm \
    && rm -rf /var/lib/apt/lists/*

# 2. Install Yarn (via npm to keep it simple on Ubuntu)
RUN npm install -g yarn

# 3. Install Zola (Binary download)
# We fetch the latest x86_64 Linux binary from GitHub
RUN ZOLA_VERSION=$(curl -s https://api.github.com/repos/getzola/zola/releases/latest | jq -r .name) && \
    curl -L https://github.com/getzola/zola/releases/download/$ZOLA_VERSION/zola-$ZOLA_VERSION-x86_64-unknown-linux-gnu.tar.gz | tar xz -C /usr/local/bin

# 4. Install Watchexec (Binary download)
RUN WATCHEXEC_VERSION=$(curl -s https://api.github.com/repos/watchexec/watchexec/releases/latest | jq -r .tag_name) && \
    curl -L https://github.com/watchexec/watchexec/releases/download/$WATCHEXEC_VERSION/watchexec-${WATCHEXEC_VERSION#v}-x86_64-unknown-linux-musl.tar.xz | tar xJ --strip-components 1 -C /usr/local/bin

# Reset frontend for interactive use
ENV DEBIAN_FRONTEND=dialog
