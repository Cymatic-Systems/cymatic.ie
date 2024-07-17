FROM alpine:3.20.1

# Base tools
RUN apk add --no-cache git jq yq ripgrep curl bash

# Pre-install packages used by devcontainers common-utils:2
RUN apk add --no-cache openssh-client gnupg procps lsof htop net-tools \
    psmisc wget rsync ca-certificates unzip xz zip nano vim less jq \
    libgcc libstdc++ krb5-libs libintl lttng-ust tzdata userspace-rcu zlib \
    sudo coreutils sed grep which ncdu shadow strace

# Project tools
RUN apk add --no-cache nodejs yarn zola watchexec
