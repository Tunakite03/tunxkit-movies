# TunxKit Movies Frontend

Frontend for the TunxKit Movies platform, built with Next.js App Router. This app consumes the TunxKit Movies NestJS API to provide movie discovery, TV browsing, watch pages, authentication flows, watchlists, and admin screens.

## Tech Stack

- Next.js 16 (App Router)
- React 19
- TypeScript 5
- Tailwind CSS 4
- TanStack Query
- Zustand
- shadcn/ui + Radix UI
- Lucide React
- Framer Motion
- HLS.js

## Features

- Home page with trending and curated movie/TV sections
- Browse pages for movies, TV series, cinema releases, and TV shows
- Search and genre-based discovery
- Movie / TV detail pages with SEO metadata and JSON-LD
- Watch pages for playing content
- Email/password auth flows
- Google OAuth callback flow
- Forgot password, reset password, and email verification pages
- User account and watchlist management
- Admin dashboard for movies, TV shows, people, genres, users, imports, and video sources
- Responsive UI with dark mode support

## Project Structure

```text
src/
├── actions/        # Server/client actions such as auth helpers
├── app/            # App Router pages, layouts, route handlers, metadata
├── components/     # Reusable UI and feature components
├── config/         # App-level configuration
├── constants/      # Static constants such as categories and site metadata
├── hooks/          # Custom React hooks
├── lib/            # Shared utilities, API client, SEO helpers
├── services/       # API-facing service functions
├── store/          # Zustand stores and providers
└── types/          # Shared TypeScript types

public/
├── samples/        # Sample/static assets
└── placeholder-*   # Fallback media placeholders
```

## Prerequisites

- Node.js 20+
- pnpm 10+
- A running TunxKit Movies backend API

## Getting Started

### 1. Install dependencies

```bash
pnpm install
```

### 2. Create your local environment file

Copy `.env.example` to `.env.local` and update the values as needed.

```bash
cp .env.example .env.local
```

On Windows PowerShell:

```powershell
Copy-Item .env.example .env.local
```

### 3. Start the backend API

By default, the frontend expects the backend at:

- `http://localhost:4000/api/v1`

If your API runs elsewhere, update `NEXT_PUBLIC_API_URL` in `.env.local`.

### 4. Start the development server

```bash
pnpm dev
```

## Local URLs

- Frontend: `http://localhost:3000`
- Default backend API: `http://localhost:4000/api/v1`

## Environment Variables

Key variables used by the frontend:

| Variable               | Required | Purpose                                                                      |
| ---------------------- | -------- | ---------------------------------------------------------------------------- |
| `NEXT_PUBLIC_API_URL`  | Yes      | Base URL for the NestJS API, for example `http://localhost:4000/api/v1`      |
| `NEXT_PUBLIC_SITE_URL` | No       | Public site URL used for canonical links, Open Graph, and other SEO metadata |

If `NEXT_PUBLIC_SITE_URL` is not set, the app falls back to `https://tunxkit-movies.vercel.app`.

## Available Scripts

| Command        | Description                          |
| -------------- | ------------------------------------ |
| `pnpm dev`     | Start the Next.js development server |
| `pnpm build`   | Build the production bundle          |
| `pnpm start`   | Start the production server          |
| `pnpm lint`    | Run ESLint                           |
| `pnpm prepare` | Install Husky hooks                  |

## Docker

The project includes a multi-stage Dockerfile that builds a standalone Next.js image.

### Build the image

```bash
docker build -t tunxkit-movies-fe .
```

### Run the container

```bash
docker run -p 3000:3000 -e NEXT_PUBLIC_API_URL=http://host.docker.internal:4000/api/v1 tunxkit-movies-fe
```

## Deployment Notes

- `next.config.ts` uses `output: 'standalone'`
- Remote images are enabled for TMDB and Google profile images
- `vercel.json` is present for Vercel deployment compatibility
- Set `NEXT_PUBLIC_API_URL` and `NEXT_PUBLIC_SITE_URL` in your deployment environment

## Contributing

Please follow the repository's linting, formatting, and commit conventions when contributing changes.
