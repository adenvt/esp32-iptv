# Esp32 IPTV Server

This project built on top Nuxt 3. Look at the [Nuxt 3 documentation](https://nuxt.com/docs/getting-started/introduction) to learn more.

## Prerequisites

This project depend on `ffmpeg` and `yt-dlp`

### Debian/Ubuntu

```bash
apt-get install ffmpeg yt-dlp
```

### Homebrew

```
brew install ffmpeg yt-dlp
```

## Setup

Make sure to install the dependencies:

```bash
yarn install
```

Note: make sure your corepack was enable using command: `corepack enable`

## Development Server

Start the development server on http://localhost:3000:

```bash
yarn dev
```

## Production

Build the application for production:

```bash
yarn build
```

Locally preview production build:

```bash
yarn preview
```

Check out the [deployment documentation](https://nuxt.com/docs/getting-started/deployment) for more information.
