# Make-Up Lounge

[![Live – GitHub Pages](https://img.shields.io/badge/Live-GitHub%20Pages-2ea44f?logo=github)](https://yakyakyak14.github.io/makeup-lounge/)
[![Deploy](https://github.com/yakyakyak14/makeup-lounge/actions/workflows/deploy.yml/badge.svg)](https://github.com/yakyakyak14/makeup-lounge/actions/workflows/deploy.yml)

An elegant booking platform connecting makeup artists with clients. Features include Google OAuth, services management, bookings, payments (stub), ratings, artist portfolios (images/videos), and a polished light/dark UI.

## Local development

Requirements: Node.js 18+ and npm

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone https://github.com/yakyakyak14/makeup-lounge.git

# Step 2: Navigate to the project directory.
cd makeup-lounge

# Step 3: Install the necessary dependencies.
npm ci

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## Live Demo

- App: https://yakyakyak14.github.io/makeup-lounge/

## Deployment (GitHub Pages)

- Deploys automatically on push to `main` via GitHub Actions workflow at `.github/workflows/deploy.yml`.
- Vite base path is configured for Pages: `base: "/makeup-lounge/"` in `vite.config.ts`.
- Router basename is set for production in `src/App.tsx`.
- SPA fallback added by copying `dist/index.html` to `dist/404.html` during deploy.

### Supabase OAuth Redirect (required)

In Supabase Auth → URL Configuration → Redirect URLs, add:

```
https://yakyakyak14.github.io/makeup-lounge/auth/callback
```

## Custom domain

You can point a custom domain to GitHub Pages via repository Settings → Pages. Configure DNS (CNAME/ALIAS) to the GitHub Pages hostname.
