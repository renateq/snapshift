# Snapshift

Snapshift is a lightweight web app that lets you instantly transfer images from your phone to your laptop — **no logins, no cables, no setup required.**

![banner](docs/assets/banner.png 'Banner')

## 🧩 Project Structure

### `packages/` directory

This project is structured as a **monorepo** with two main packages:

- **`packages/client`** — a [Next.js](https://nextjs.org/) app
- **`packages/server`** — a Go WebSocket server

### `tests/` directory

End-to-end (E2E) tests are written using **Playwright** and stored in the `tests` folder.

Continuous integration is handled via **GitHub Actions**, which automatically runs all tests on every pull request.

A **branch protection rule** ensures that all tests must pass before merging into the main branch.

### `scripts/` directory

Contains helper scripts for dependency management and development tasks.

## 🚀 Getting Started

Clone the repository and start the development servers:

```bash
git clone https://github.com/renateq/snapshift.git
cd snapshift
npm run install:all
npm run dev
```

> 💡 The `install:all` script installs dependencies for all packages automatically.

## 📜 Scripts

The following commands can be run from the **root directory**:

| Command               | Description                                  |
| --------------------- | -------------------------------------------- |
| `npm run dev:client`  | Run the client (Next.js) app                 |
| `npm run dev:server`  | Run the Go WebSocket server                  |
| `npm run dev`         | Run both client and server concurrently      |
| `npm run format`      | Format all files using Prettier              |
| `npm run install:all` | Install dependencies for all packages        |
| `npm run install:ci`  | Install dependencies for CI tasks            |
| `npm run test`        | Run Playwright tests                         |
| `npm run test:ui`     | Run Playwright tests in UI mode              |
| `npm run storybook`   | Start Storybook to preview client components |

## 🧠 Tech Stack

- **Frontend:** Next.js, TypeScript
- **Backend:** Go (WebSocket server)
- **Testing:** Playwright
- **CI/CD:** GitHub Actions for automated tests on PRs
- **Tooling:** Prettier, Storybook
