# Medical Website Monorepo

Welcome to the Medical Website codebase. This repository is structured as a monorepo containing both the frontend client and the backend server.

## Repository Structure

```text
medical-website-monorepo/
├── client/                 # Frontend Vite + React Application
│   ├── Dockerfile
│   └── package.json
├── server/                 # Backend Express.js Server
│   ├── Dockerfile
│   └── package.json
├── docker-compose.yml      # Runs database + server + client together
├── eslint.config.js        # Shared ESLint Flat Config
├── .prettierrc             # Shared Prettier configuration
├── .prettierignore         # Prettier ignore patterns
├── .gitignore              # Git ignore rules
└── package.json            # Root configuration defining workspaces
```

## Getting Started (without Docker)

### Prerequisites

You need [Node.js](https://nodejs.org/) installed on your machine.

### Installation

To install all dependencies for the entire workspace (root, client, and server) at once, run:

```bash
npm install
```

This commands reads the workspace configurations and installs and links all projects appropriately.

### Linting and Formatting

This repository uses a shared ESLint Flat Configuration and Prettier configuration to ensure code consistency across both the frontend and backend.

- **Check Linting**:
  ```bash
  npm run lint
  ```
- **Fix Linting Errors**:
  ```bash
  npm run lint:fix
  ```
- **Format Code**:
  ```bash
  npm run format
  ```
- **Verify Format**:
  ```bash
  npm run format:check
  ```

## Running with Docker (recommended for sharing the project)

This is the easiest way to hand the project to someone else (a client, another developer, a tester). Docker packages the database, backend, and frontend into containers, so the other person does not need to install Node.js, PostgreSQL, or any dependency by hand — they only need Docker installed.

### Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed and running (Windows, Mac, or Linux). It already includes Docker Compose.

### 1. Set up the server's environment file

The server needs a `.env` file with real values (database connection, JWT secret, email API key, etc.). This file is **never committed to git** and must be created manually once, on whichever machine will run the project.

```bash
cd server
cp .env.example .env
```

Then open `server/.env` and fill in the real values (at minimum `JWT_SECRET`, and the Brevo email settings if order/contact emails should work). You do **not** need to change `DATABASE_URL` — `docker-compose.yml` automatically points the server at the database container.

### 2. Build and start everything

From the project root:

```bash
docker compose up --build
```

This will:
- Start a PostgreSQL database container (with its data saved in a Docker volume, so it survives restarts).
- Build and start the backend server (applies the database schema automatically on startup).
- Build and start the frontend, served by nginx.

The first run will take a few minutes (downloading images, installing dependencies, building the frontend). After that, `docker compose up` is fast, since Docker caches the build.

### 3. Open the site

- Frontend: [http://localhost:8080](http://localhost:8080)
- Backend API: [http://localhost:5000](http://localhost:5000)

### 4. Seed sample data (optional, first time only)

To load the starter product catalogue into the database:

```bash
docker compose exec server node prisma/seed.js
```

### 5. Stopping

```bash
docker compose down
```

Add `-v` (`docker compose down -v`) only if you also want to wipe the database volume and start fresh next time.

### Everyday commands

| Task                                   | Command                                |
| --------------------------------------- | --------------------------------------- |
| Start everything (rebuild if changed)   | `docker compose up --build`             |
| Start everything (no rebuild)           | `docker compose up`                     |
| Start in the background                 | `docker compose up -d`                  |
| Stop everything                         | `docker compose down`                   |
| View logs                               | `docker compose logs -f`                |
| View logs for just the server           | `docker compose logs -f server`         |
| Rebuild after changing code             | `docker compose up --build`             |
| Promote an account to admin/developer   | `docker compose exec server node scripts/setRole.js someone@example.com developer` |

### Notes

- Ports used: `8080` (site), `5000` (API), `5432` (database). If any of these are already in use on the host machine, change the left-hand side of the port mapping in `docker-compose.yml` (for example `"8081:80"`).
- The frontend is built to call the backend at `http://localhost:5000` by default. If the site will be reached from a different address, rebuild the client with `docker compose build --build-arg VITE_API_URL=<backend URL> client`.
- This Docker setup is meant for running the finished project (demoing to a client, local testing). For active day-to-day coding, the non-Docker `npm run dev` workflow above is faster to iterate with.
