#!/usr/bin/env bash

export NODE_ENV=production

git pull

yarn --immutable
yarn build

pm2 startOrReload ecosystem.config.cjs
