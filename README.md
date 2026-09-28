# Workspace Contents

This workspace contains two main sections:

## 🎯 Interview Preparation Materials (New!)

**Complete interview preparation package for Senior Frontend Developer position at IKG Team**

### Quick Start
1. **Start Here**: Read `INTERVIEW_PREP_README.md` for overview and timeline
2. **Main Guide**: `INTERVIEW_PREP.md` - Comprehensive preparation guide
3. **Technical Review**: `TECHNICAL_CHEATSHEET.md` - Quick reference for technical concepts
4. **Practice**: `PRACTICE_QUESTIONS.md` - 15+ questions with sample answers
5. **Day-of**: `INTERVIEW_QUICK_REFERENCE.md` - Print this for interview day
6. **Last Minute**: `LAST_MINUTE_PREP.md` - Final 30-minute review
7. **Company Research**: `COMPANY_RESEARCH_FOLLOWUP.md` - Research guide & follow-up templates
8. **Track Progress**: `PREPARATION_TRACKER.md` - Checklist to track your preparation

### Files Overview
- `INTERVIEW_PREP_README.md` - Start here! Complete guide to using all materials
- `INTERVIEW_PREP.md` - Main preparation guide (3-4 hour read)
- `TECHNICAL_CHEATSHEET.md` - Technical concepts quick reference
- `PRACTICE_QUESTIONS.md` - Interview questions with sample answers
- `INTERVIEW_QUICK_REFERENCE.md` - Day-of cheat sheet (PRINT THIS)
- `LAST_MINUTE_PREP.md` - 30-minute final review before interview
- `COMPANY_RESEARCH_FOLLOWUP.md` - Company research & email templates
- `PREPARATION_TRACKER.md` - Preparation progress checklist

**Recommended Timeline**: Start 5-7 days before your interview. See `INTERVIEW_PREP_README.md` for detailed timeline.

---

## 💼 Aesthetic Center Reservation System

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
