# Aesthetic Center Reservation System

A full-stack MVP for managing staff, services, and reservations at an aesthetic/beauty center.

## Tech Stack

- **Frontend**: React (Vite), plain CSS
- **Backend**: Node.js, Express
- **Database**: PostgreSQL

## Prerequisites

- Node.js 18+
- PostgreSQL (installed locally)

## Setup

### 1. PostgreSQL

Create a database and user:

```bash
# Connect to PostgreSQL (e.g. psql -U postgres)
CREATE USER aesthetic_user WITH PASSWORD 'your_password';
CREATE DATABASE aesthetic_center OWNER aesthetic_user;
\q
```

Run the migration:

```bash
psql -U aesthetic_user -d aesthetic_center -f backend/migrations/001_init.sql
```

### 2. Backend

```bash
cd backend
cp .env.example .env
# Edit .env and set DATABASE_URL, e.g.:
# DATABASE_URL=postgresql://aesthetic_user:your_password@localhost:5432/aesthetic_center

npm install
npm run dev
```

The API runs at `http://localhost:3001`.

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

The app runs at `http://localhost:5173`. Set `VITE_API_URL=http://localhost:3001/api` in `.env` if the API is on a different URL.

## API Endpoints

- `GET /api/health` - Health check
- `POST /api/upload` - Photo upload (multipart/form-data, field: `photo`)
- `GET/POST/PUT/DELETE /api/staff` - Staff CRUD
- `GET/POST/PUT/DELETE /api/services` - Services CRUD
- `GET/POST/PUT /api/service-fields` - Custom fields and column order
- `GET/POST/PUT/DELETE /api/reservations` - Reservations (query by `?date=YYYY-MM-DD`)

## Features

- **Schedule**: Time-based calendar with specialists as columns, create/edit/delete reservations, drag & drop to move reservations
- **Staff**: List, search, add, edit, delete specialists with photo URL
- **Services**: List, search, add, edit, delete services; custom fields (dynamic columns); column reordering via drag & drop

## Demo Video Checklist

1. Schedule: Create reservation by clicking slot, edit by clicking block, delete via modal, drag & drop to new slot/specialist
2. Staff: Add, edit, delete, search
3. Services: Add custom column, add/edit/delete service, reorder columns
