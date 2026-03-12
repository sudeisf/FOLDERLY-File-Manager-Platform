# FOLDERLY-file-manager-platform

FOLDERLY is a full-stack file manager platform with secure authentication, folder organization, cloud storage (Supabase), share links, starring, notifications, inline file viewing, and ZIP export.

## About

A full-stack file management platform that lets users upload and organize files into folders, share files or folders with expiring links, star important items, manage downloads and deletions, receive notifications, and export folders as ZIPs, powered by secure JWT auth and Supabase cloud storage.

## Topics

`file-manager`, `file-sharing`, `cloud-storage`, `react`, `typescript`, `nodejs`, `express`, `prisma`, `mongodb`, `supabase`, `jwt-authentication`, `tailwindcss`, `notifications`, `docker`, `zip-export`

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
- File manager dashboard with grid/list view toggle
- Details panel actions for file download, delete, and folder share
- Profile page with account/security/preferences sections
- Notifications page with working `All`, `Unread`, and `System` tabs
- Upgrade Plans modal with pricing tiers (demo UI)
- Interactive API documentation at `/api-docs`

## Frontend Routes (Protected)

- `/protected/all-files` main file manager experience
- `/protected/shared` shared content view
- `/protected/starred` starred items view
- `/protected/profile` profile and account settings
- `/protected/notifications` notifications center

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
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=http://localhost:3000/api/auth/google/callback
```

Notes:

- Keep `SUPABASE_SERVICE_ROLE_KEY` in backend only.
- Ensure your `private.pem` / `public.pem` keys exist in `server/utils/`.
- For Google login, configure the callback URL in Google Cloud Console exactly as `GOOGLE_CALLBACK_URL`.

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

## Testing

Backend tests use Jest + Supertest.

Run backend tests:

```bash
cd server
npm test
```

Watch mode:

```bash
cd server
npm run test:watch
```

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
- `GET /api/auth/google`
- `GET /api/auth/google/callback`
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

### Notifications

- `GET /api/notifications/count` — Get unread notification count
- `GET /api/notifications` — Get all notifications
- `PUT /api/notifications/read-all` — Mark all notifications as read
- `PUT /api/notifications/{id}/read` — Mark notification as read
- `POST /api/notifications/enqueue-test` — Enqueue a test notification

### Profile

- `GET /api/profile/me` — Get current user profile
- `PUT /api/profile/me` — Update current user profile
- `POST /api/profile/me/avatar` — Upload profile avatar
- `GET /api/profile/me/activity` — Get user recent activity

### Favorites

- `GET /api/favorites` — Get user favorites

### Shared

- `GET /api/shared` — List items shared with current user
- `GET /api/shared/my-activity` — Get user recent shared activity
- `POST /api/shared/folders/{id}/share-with` — Share folder with users
- `GET /api/shared/{type}/{id}/activity` — Get activity for shared item

---

All endpoints require authentication unless otherwise noted. See Swagger UI (`/api-docs`) for full request/response schemas.
