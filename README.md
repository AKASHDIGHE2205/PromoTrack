# 🚀 PromoTrack — Sales Promoter

A full-stack application for managing **sales promoters, attendance, shops, product promotions, file uploads, location tracking, SMS notifications, and reports**.

## ✨ Features

* 🔐 Authentication & role-based access
* 👨‍💼 Promoter management
* 🏪 Shop management
* 🕐 Attendance & check-in/check-out
* 📦 Product promotion management
* 📁 File/image uploads
* 🗺️ Google Maps & location tracking
* 📱 SMS notifications
* 📊 Dashboard & reports

## 🛠️ Tech Stack

**Frontend:** React, TypeScript, Vite, Redux Toolkit, React Router, Tailwind CSS, Axios

**Backend:** Node.js, Express.js, MySQL, JWT, bcrypt, Multer

**Integrations:** Google Maps, SMS API

## 📁 Project Structure

```text
PromoTrack/
├── client/    # React + TypeScript
└── server/    # Express + MySQL
```

## ⚙️ Setup

### Server

```bash
cd server
npm install
```

Create `.env`:

```env
PORT=2000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=promotrack
JWT_SECRET=your_secret
GOOGLE_MAPS_API_KEY=your_key
SMS_API_KEY=your_key
```

Setup the database using:

```text
server/sql/schema.sql
```

Start the server:

```bash
npm start
```

### Client

```bash
cd client
npm install
npm run dev
```

## 🌐 Application

Frontend:

```text
http://localhost:5173
```

Backend:

```text
http://localhost:2000
```

## 👨‍💻 Author

**Akash Dighe**
