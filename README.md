# JK Interiors Sales CRM

A simple professional sales CRM for an interiors company using a Next.js frontend and Express backend.

## Structure

- `frontend`: Next.js CRM interface
- `backend`: Express API with seeded login and sales workflow endpoints

## Seeded Login

- Email: `admin@jkinteriors.com`
- Password: `Jk@12345`

## Run

Install each app separately:

```bash
cd backend
npm install
npm run dev
```

```bash
cd frontend
npm install
npm run dev
```

The frontend expects the API at `http://localhost:5000/api`. You can override it with:

```bash
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```
