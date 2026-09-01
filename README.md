# Sales Promoter

A full-stack app for managing promoters, attendance, item promotions, shops, and reporting. It consists of a React + TypeScript client and an Express + MySQL server.

## Project Structure

```
sales-promoter/
├── client/   # React + Vite + TypeScript frontend
└── server/   # Express + MySQL backend
```

## Prerequisites

- Node.js
- MySQL

## Getting Started

### Server

```bash
cd server
npm install
```

Create a `.env` file in `server/` (see `server/.env` for required variables, e.g. `PORT`, database credentials, JWT secret).

Set up the database using `server/sql/schema.sql`, then start the server:

```bash
npm start
```

The server runs on `http://localhost:2000` by default (configurable via `PORT`).

### Client

```bash
cd client
npm install
npm run dev
```

## Features

- Authentication & role-based access control
- Attendance tracking
- Product promotion management
- Shop management
- Dashboard & reporting

## Tech Stack

**Client:** React, TypeScript, Vite, Redux Toolkit, React Router, Tailwind CSS, Axios

**Server:** Express, MySQL, JWT authentication, bcrypt, Multer
