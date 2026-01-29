# GEMINI.md

## Project Overview

This project, named **NaviHive**, is a modern, personal website navigation management system. It allows users to organize their bookmarks into groups, sort them using a drag-and-drop interface, and customize the appearance of their navigation page. The project is built as a single-page application with a separate backend API.

The frontend is built with **React 19**, **TypeScript**, and **Vite**, using **Material UI** for components and **Tailwind CSS** for styling. The backend is a serverless application running on **Cloudflare Workers**, with data stored in a **Cloudflare D1** SQLite database. Authentication is handled using **JWT** with **bcrypt** for password hashing.

The application supports features like dark mode, data import/export in JSON format, custom CSS, and a visitor mode for read-only access.

## Building and Running

The project uses `pnpm` as the package manager. The following scripts are available in `package.json`:

*   **`pnpm dev`**: Starts the Vite development server for the frontend. The application will be available at `http://localhost:5173`. By default, it uses mock data. To use the real API, set the environment variable `VITE_USE_REAL_API=true`.
*   **`pnpm build`**: Builds the frontend and backend for production. This command runs `tsc` to check for TypeScript errors and then `vite build` to create the production assets.
*   **`pnpm run deploy`**: Deploys the application to Cloudflare Workers. This script first builds the project and then uses the `wrangler` CLI to publish it.
*   **`pnpm lint`**: Lints the codebase using ESLint to enforce code quality.
*   **`pnpm format`**: Formats the code using Prettier.
*   **`pnpm hash-password <password>`**: A utility script to generate a bcrypt hash of a password, which can then be used in the `wrangler.jsonc` configuration.

### Local Development with Cloudflare Backend

To run the frontend against a local instance of the Cloudflare Worker, you can use the `wrangler dev` command. You will need to have the `wrangler` CLI installed and configured.

## Development Conventions

*   **Code Style**: The project uses **ESLint** and **Prettier** to maintain a consistent code style. It is recommended to run `pnpm lint` and `pnpm format` before committing changes.
*   **Commits**: The `README.md` suggests following the [Conventional Commits](https://www.conventionalcommits.org/) specification for commit messages.
*   **API**: The backend API is defined in `worker/index.ts`. All API routes are prefixed with `/api/`. The frontend interacts with this API through the client defined in `src/API/client.ts`.
*   **Authentication**: Authentication is enabled by default and can be configured via environment variables in `wrangler.jsonc`. When `AUTH_ENABLED` is `true`, most API endpoints require a valid JWT.
*   **Database**: The database schema is defined in `init_table.sql`. Migrations are located in the `migrations` directory. To interact with the database locally, you can use `wrangler d1 execute`.
*   **Configuration**: The Cloudflare Worker is configured through the `wrangler.jsonc` file. This includes the project name, entry point, database bindings, and environment variables for authentication.
