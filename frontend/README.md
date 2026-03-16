# Aesthetic Center — Frontend

React frontend for the Aesthetic Center Reservation System. Schedule view, staff management, and services management.

## What it does

- **Schedule** — Day view by specialist, create/edit/delete reservations, drag & drop to move them
- **Staff** — List, search, add, edit, delete specialists with photo upload
- **Services** — List, search, add, edit, delete services; custom columns; drag to reorder columns

## Run it

```bash
npm install
npm run dev
```

Opens at `http://localhost:5173`.

The backend must be running at `http://localhost:3001`. If it’s elsewhere, create a `.env` file:

```
VITE_API_URL=http://localhost:3001/api
```

## Build for production

```bash
npm run build
npm run preview
```

## Tech

- React 19, Vite 7, React Router 7
- Plain CSS (design tokens in `src/styles/variables.css`)
