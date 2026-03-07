# File Uploader

A full-stack file management platform with authentication, folder organization, cloud storage (Supabase), share links, inline file viewing, and ZIP export.

## Tech Stack

[![React](https://img.shields.io/badge/React-20232A?logo=react&logoColor=61DAFB)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-0F172A?logo=tailwind-css&logoColor=38BDF8)](https://tailwindcss.com/)
[![Node.js](https://img.shields.io/badge/Node.js-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-000000?logo=express&logoColor=white)](https://expressjs.com/)
[![Prisma](https://img.shields.io/badge/Prisma-2D3748?logo=prisma&logoColor=white)](https://www.prisma.io/)
[![MongoDB](https://img.shields.io/badge/MongoDB-001E2B?logo=mongodb&logoColor=4DB33D)](https://www.mongodb.com/)
[![Supabase](https://img.shields.io/badge/Supabase-181818?logo=supabase&logoColor=3ECF8E)](https://supabase.com/)
[![Swagger](https://img.shields.io/badge/Swagger-85EA2D?logo=swagger&logoColor=black)](https://swagger.io/)
[![JWT](https://img.shields.io/badge/JWT-000000?logo=jsonwebtokens&logoColor=white)](https://jwt.io/)

- Frontend: React, TypeScript, Vite, Tailwind, React Query
- Backend: Node.js, Express
- Database: MongoDB (via Prisma ORM)
- Storage: Supabase Storage
- Auth: JWT cookie auth + session store
- API Docs: Swagger UI

## Project Structure

- `client/` frontend application
- `server/` backend API and business logic

## Features

- User registration and login
- Protected routes and cookie-based authentication
- Create folders and upload files to Supabase
- File actions: view in browser, download, delete
- Folder ZIP download
- Share links with expiration support
- Interactive API documentation at `/api-docs`

## Quick Start

### 1. Install dependencies

```bash
cd server
npm install

cd ../client
npm install
```

### 2. Configure environment variables

Use the provided templates first:

```bash
cp server/.env.example server/.env
cp client/.env.example client/.env
```

Then update `server/.env` with your real values:

```env
PORT=3000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
SESSION_SECRET=replace-with-a-strong-secret
SESSION_COOKIE_SAMESITE=lax
DATABASE_URL=your-mongodb-connection-string
SUPABASE_URL=your-supabase-project-url
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

Notes:

- Keep `SUPABASE_SERVICE_ROLE_KEY` in backend only.
- Ensure your `private.pem` / `public.pem` keys exist in `server/utils/`.

### 3. Run backend

```bash
cd server
npm run dev
```

### 4. Run frontend

```bash
cd client
npm run dev
```

Frontend default URL: `http://localhost:5173`
Backend default URL: `http://localhost:3000`

## Docker

The project includes container setup for both frontend and backend:

- `server/Dockerfile`
- `client/Dockerfile`
- `docker-compose.yml`
- `nginx/default.conf`

### Prerequisites

- Docker Desktop (or Docker Engine + Compose plugin)
- `server/.env` configured with valid values (especially DB and Supabase)

### Build and run

Before first deploy, ensure:

- `server/.env` exists (copy from `server/.env.example`)
- `server/utils/private.pem` and `server/utils/public.pem` exist

Start all services:

```bash
docker compose up --build
```

Run in background:

```bash
docker compose up -d --build
```

Service URLs:

- App (via Nginx): `http://localhost:8080`
- Swagger (via Nginx): `http://localhost:8080/api-docs`

Health checks:

- Backend: `http://localhost:8080/healthz` (proxied to server)
- Client container internal health: `http://client/healthz`

### Useful commands

View logs:

```bash
docker compose logs -f
```

Rebuild only one service:

```bash
docker compose build server
docker compose build client
```

Restart a single service:

```bash
docker compose restart server
docker compose restart client
docker compose restart nginx
```

Stop containers:

```bash
docker compose down
```

Stop and remove named volumes (if added later):

```bash
docker compose down -v
```

### Notes

- Nginx is the only exposed container (`8080:80`) and proxies requests to `client` and `server`.
- `/` routes to the frontend container.
- `/api`, `/share`, and `/api-docs` route to the backend container.
- If port `8080` is busy, change the host mapping in `docker-compose.yml`.

## API Documentation (Swagger)

Swagger UI is available at:

- `http://localhost:3000/api-docs`

The OpenAPI config lives in:

- `server/docs/swagger.js`

## Backend API Overview

### Auth

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/logout`
- `GET /api/auth/protected`

### Folders

- `POST /api/folders/create-folder`
- `GET /api/folders/get-folders-names`
- `GET /api/folders/folder-list`
- `PUT /api/folders/:id`
- `DELETE /api/folders/:id`

### Files

- `POST /api/files/file`
- `GET /api/files/view/:folderName/:fileUid`
- `GET /api/files/download/:folderName/:fileUid`
- `GET /api/files/download-folder/:folderName`
- `DELETE /api/files/delete/:folderName/:fileUid`

### Share

- `POST /share/:folderId`
- `GET /share/:uuid`

## Production Notes

- Set `NODE_ENV=production` in `server/.env`.
- Set `FRONTEND_URL` to your real public domain (or comma-separated domains).
- Use HTTPS and terminate TLS at a reverse proxy/load balancer.
- Use a strong `SESSION_SECRET` (32+ random bytes).
- Keep `SESSION_COOKIE_SAMESITE=lax` for same-site deployments. If frontend/backend are on different sites, use `none` and HTTPS.
- Rotate Supabase and JWT keys periodically.
- Add centralized logging and monitoring before production rollout.
- Rate limiting is enabled:
  - Global API: `200 requests / 15 minutes` per IP
  - Auth endpoints (`/api/auth/login`, `/api/auth/register`): `10 requests / 15 minutes` per IP

## Troubleshooting

- `EADDRINUSE: 3000`:
  - Another process is using port 3000. Stop it or change `PORT`.
- `row-level security policy` upload errors:
  - Confirm `SUPABASE_SERVICE_ROLE_KEY` is set in `server/.env`.
- File view opens download instead of preview:
  - Use `/api/files/view/...` endpoint and ensure browser supports that file type.
