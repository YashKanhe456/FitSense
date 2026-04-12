# Patil Mens Wear

Patil Mens Wear is a full-stack e-commerce project for men&apos;s fashion built with:

- React + Vite frontend
- Node.js + Express backend
- PostgreSQL
- JWT authentication
- LocalStorage cart
- COD checkout
- Role-based admin dashboard
- Cloudinary-ready product image uploads for production

## Project Structure

```text
Fullstack/
  Backend/
  Frontend/
  vercel.json
```

## Local Run

### 1. Backend

```powershell
cd Backend
npm install
npm run dev
```

Backend default URL:

`http://localhost:5000`

### 2. Frontend

```powershell
cd Frontend
npm install
npm run dev
```

Frontend default URL:

`http://localhost:5173`

## Demo Admin Account

After seeding:

- Email: `admin@patilmenswear.com`
- Password: `Admin@1234`

Seed command:

```powershell
cd Backend
npm run seed
```

## Environment Files

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

## Production Build

### Frontend build

```powershell
cd Frontend
npm run build
```

### Backend entrypoints

- `Backend/server.js` for local/Render style startup
- `Backend/api/index.js` for serverless/Vercel style deployment

## Vercel Deployment

This repo is configured for a single Vercel deployment using:

- Static frontend from `Frontend/`
- Serverless API from `Backend/api/index.js`
- Route rewrites from `vercel.json`

### Production Environment Variables

Set these in Vercel before launching:

- `POSTGRES_URL`
- `JWT_SECRET`
- `JWT_EXPIRES_IN`
- `FRONTEND_URL`
- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`
- `CLOUDINARY_FOLDER`

### Suggested Production Values

- `JWT_EXPIRES_IN=30d`
- `CLOUDINARY_FOLDER=patil-mens-wear`
- `FRONTEND_URL=https://your-production-domain.vercel.app`

### Launch Checklist

1. Create a Cloudinary account and copy the three credentials into Vercel env vars.
2. Set a strong `JWT_SECRET` that is at least 32 characters long.
3. Set `POSTGRES_URL` to the production Neon/Postgres connection string.
4. Deploy to Vercel.
5. Open `/api/health` on the deployed domain and confirm it responds successfully.
6. Log in to the admin panel and test one real product image upload.
7. Create a test order and confirm products, cart, checkout, and orders work end to end.

## Important Notes

- Do not commit real `.env` files
- Do not commit your database or Cloudinary secrets
- Product image uploads require Cloudinary in production
- The backend now validates env vars on startup and will reject weak production JWT secrets
