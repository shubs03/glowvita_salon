# GlowVita Salon

Welcome to GlowVita Salon, a Next.js 15 monorepo project built with Turborepo. This repository contains a suite of applications designed to work together seamlessly.

## What's inside?

This Turborepo includes the following packages and applications:

### Apps
g 
- `web`: The main public-facing website.
- `crm`: A customer relationship management portal for vendors.
- `admin`: An internal administrative dashboard.

### Packages

- `ui`: A shared UI component library.
- `store`: Shared Redux Toolkit store, slices, and RTK Query APIs.
- `lib`: Shared utilities, constants, and database connection logic.
- `typescript-config`: Shared `tsconfig.json`s used throughout the monorepo.
- `eslint-config-custom`: Shared ESLint configurations.

### Architecture

- **Monorepo**: Turborepo for managing the multi-package/multi-app repository.
- **Framework**: Next.js 15 (App Router).
- **State Management**: Redux Toolkit with RTK Query.
- **Authentication**: JWT-based authentication with roles, using httpOnly cookies.
- **Database**: MongoDB with a shared connection utility.
- **Styling**: Tailwind CSS with a shared, configurable theme.

## Getting Started

To get started with this monorepo, you'll need to have Node.js, npm/yarn/pnpm, and a MongoDB instance available.

### 1. Install Dependencies

From the root of the project, run:

```bash
npm install
```

### 2. Set up Environment Variables

Each application in the `apps` directory requires its ow n `.env.local` file. You can copy the contents from `.env.local.example` in each app's directory and fill in the required values.

A single `.env` file at the root of the project can also be used to share environment variables across all apps during development.

**Required variables:**

- `MONGO_URI`: Your MongoDB connection string.
- `JWT_SECRET`: A secret key for signing JWTs.

### 3. Run Development Servers

To run all applications in development mode, execute the following command from the root directory:

```bash
npm run dev
```

This will start the development servers for `web`, `crm`, and `admin` concurrently.

- **Web App**: `http://localhost:3000`
- **CRM App**: `http://localhost:3001`
- **Admin App**: `http://localhost:3002`

## Building for Production

To build all applications for production, run:

```bash
npm run build
```
