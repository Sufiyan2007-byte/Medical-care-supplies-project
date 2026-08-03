# Medical Website Monorepo

Welcome to the Medical Website codebase. This repository is structured as a monorepo containing both the frontend client and the backend server.

## Repository Structure

```text
medical-website-monorepo/
├── client/                 # Frontend Vite + React Application
│   └── package.json
├── server/                 # Backend Express.js Server
│   └── package.json
├── eslint.config.js        # Shared ESLint Flat Config
├── .prettierrc             # Shared Prettier configuration
├── .prettierignore         # Prettier ignore patterns
├── .gitignore              # Git ignore rules
└── package.json            # Root configuration defining workspaces
```

## Getting Started

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
