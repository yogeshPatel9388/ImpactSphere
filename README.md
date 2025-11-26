# Impact Sphere — Backend (Express + MongoDB)

## Overview
Node.js + Express backend with JWT auth (access + refresh tokens), HttpOnly cookies, CSRF protection (double-submit), bcrypt password hashing, and admin endpoints. Designed for local development and deployment on Render. Works with frontend hosted on Vercel (`CLIENT_URL` in env).

## Setup (local)
1. Copy project files into `server/`.
2. Create `.env` from `.env.example` and set values (MongoDB URI, email creds, JWT secrets).
3. Install:
   
   npm install
   npm run dev (development)
   npm start (production)
