# FitSense

FitSense is a full-stack e-commerce application with a React frontend, Express backend, PostgreSQL database, JWT authentication, admin dashboard, product management, order management, and local/Cloudinary-ready image uploads.

## Project Structure

```text
FitSense/
  Backend/
  Frontend/
  vercel.json
```

## Tech Stack

- Frontend: React, Vite, Axios, React Router
- Backend: Node.js, Express
- Database: PostgreSQL
- Authentication: JWT + bcryptjs
- Validation: Joi
- Uploads: Multer + Cloudinary-ready configuration

## Environment Setup

### Backend

Copy `Backend/.env.example` to `Backend/.env` and set:

- `PORT`
- `NODE_ENV`
- `POSTGRES_URL`
- `JWT_SECRET`
- `JWT_EXPIRES_IN`
- `FRONTEND_URL`
- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`
- `CLOUDINARY_FOLDER`

### Frontend

Copy `Frontend/.env.example` to `Frontend/.env` and set:

- `VITE_API_URL`

## Local Development

### 1. Start Backend

```powershell
cd Backend
npm install
npm run seed
npm run dev
```

Backend runs on:

`http://localhost:5001`

### 2. Start Frontend

```powershell
cd Frontend
npm install
npm run dev
```

Frontend runs on:

`http://localhost:5173`

## Demo Admin Account

After seeding:

- Email: `admin@fitsense.com`
- Password: `Admin@1234`

## Database Setup

This project uses PostgreSQL with raw SQL via the `pg` driver.

- On backend startup, the app automatically creates the required tables and indexes if they do not exist.
- For a fresh setup, create an empty PostgreSQL database, update `POSTGRES_URL`, then run:

```powershell
cd Backend
npm run seed
```

## Main Features

- User registration and login
- Product listing, search, and filters
- Product details and related products
- Cart and checkout flow
- Order history for customers
- Admin dashboard with revenue and order metrics
- Product create/update/delete
- Order status management
- Customer listing and metrics
- Product image upload support

## Deployment Notes

The repo includes `vercel.json` for Vercel deployment using:

- Static frontend build from `Frontend/dist`
- Serverless backend entrypoint from `Backend/api/index.js`

## Important Notes

- Do not commit real `.env` files
- Do not commit database credentials or Cloudinary secrets
- Do not commit `node_modules` or generated build output
- Local uploads are stored in `Backend/uploads` during development
