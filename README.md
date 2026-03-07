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

Create `server/.env` with:

```env
PORT=3000
FRONTEND_URL=http://localhost:5173
SESSION_SECRET=replace-with-a-strong-secret
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

### Prerequisites

- Docker Desktop (or Docker Engine + Compose plugin)
- `server/.env` configured with valid values (especially DB and Supabase)

### Build and run

```bash
docker compose up --build
```

Run in background:

```bash
docker compose up -d --build
```

Service URLs:

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:3000`
- Swagger: `http://localhost:3000/api-docs`

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

- Client image is served by Nginx on container port `80` and mapped to host `5173`.
- Server runs on container port `3000` and is mapped to host `3000`.
- If ports are busy, change host mappings in `docker-compose.yml`.

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

- Set `NODE_ENV=production` and use HTTPS.
- Use a strong `SESSION_SECRET`.
- Restrict CORS `FRONTEND_URL` to your production client domain.
- Rotate Supabase and JWT keys periodically.
- Add centralized logging and monitoring before production rollout.

## Troubleshooting

- `EADDRINUSE: 3000`:
  - Another process is using port 3000. Stop it or change `PORT`.
- `row-level security policy` upload errors:
  - Confirm `SUPABASE_SERVICE_ROLE_KEY` is set in `server/.env`.
- File view opens download instead of preview:
  - Use `/api/files/view/...` endpoint and ensure browser supports that file type.
