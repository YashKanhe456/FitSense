# FitSense 

A full-stack clothing e-commerce web application built with React (Vite) + Node.js (Express) + PostgreSQL (NeonDB).

---

## 🧰 Tech Stack

| Layer      | Technology                                      |
|------------|-------------------------------------------------|
| Frontend   | React 18, React Router v7, Axios, Vite          |
| Backend    | Node.js, Express 5                              |
| Database   | PostgreSQL via NeonDB (raw SQL, `pg` driver)    |
| Auth       | JWT + bcryptjs                                  |
| Uploads    | Multer (local dev) / Cloudinary (production)    |
| Deployment | Vercel                                          |

---

## ⚙️ Prerequisites

Make sure you have these installed:

- [Node.js](https://nodejs.org/) v18 or above
- npm (comes with Node.js)

---

## 🚀 Local Setup

> ℹ️ The database is already set up and seeded. You just need the connection string from the project owner.

### 1. Unzip the project

```bash
cd FitSense
```

---

### 2. Backend Setup

```bash
cd Backend
npm install
```

Create your `.env` file:

```bash
# Windows
copy .env.example .env

# Mac/Linux
cp .env.example .env
```

Open `Backend/.env` and fill in these values:

```env
PORT=5001
NODE_ENV=development
POSTGRES_URL=<paste the connection string given to you>
JWT_SECRET=anyrandomstringhere123
JWT_EXPIRES_IN=30d
FRONTEND_URL=http://localhost:5173
```

Start the backend:

```bash
npm run dev
```

Backend runs at: `http://localhost:5001`  
Health check: `http://localhost:5001/api/health`

---

### 3. Frontend Setup

Open a **new terminal** and run:

```bash
cd Frontend
npm install
```

Create your `.env` file:

```bash
# Windows
copy .env.example .env

# Mac/Linux
cp .env.example .env
```

Open `Frontend/.env` and set:

```env
VITE_API_URL=http://localhost:5001/api
```

Start the frontend:

```bash
npm run dev
```

Frontend runs at: `http://localhost:5173`

> ✅ Make sure the backend is running before opening the frontend.

---

## 🔑 Admin Credentials

Admin credentials must be configured locally by running the database seeder on your own machine — they are not documented in this repository.

> ⚠️ Never use default or demo credentials on a deployed instance. Always set a unique, strong admin password before exposing the application publicly.

---

## 📁 Project Structure

```
FitSense/
├── Backend/
│   ├── server.js           # Local server entrypoint
│   ├── app.js              # Express app setup
│   ├── seeder.js           # Seeds demo admin + products
│   ├── config/             # DB connection (auto-creates tables on startup)
│   ├── controllers/        # Route handlers (auth, products, orders, admin)
│   ├── routes/             # API route definitions
│   ├── middleware/         # Auth, validation, upload, error handling
│   ├── utils/              # JWT helpers, serializers
│   ├── validations/        # Joi request validation schemas
│   ├── uploads/            # Local uploaded images (dev only)
│   └── api/index.js        # Vercel serverless entrypoint
│
├── Frontend/
│   ├── src/
│   │   ├── App.jsx         # Route tree
│   │   ├── pages/          # Storefront + Admin pages
│   │   ├── components/     # Navbar, footer, guards, dialogs
│   │   ├── context/        # Auth + Cart state
│   │   ├── services/api.js # Axios client
│   │   └── utils/          # Currency, shipping helpers
│   └── vite.config.js      # Dev server + API proxy config
│
├── scripts/                # Helper scripts including Python report generator
├── vercel.json             # Vercel deployment config
└── README.md
```

---

## 🗄️ Database

- **No setup needed** — database is already live on NeonDB
- Tables already created: `users`, `products`, `orders`, `order_items`
- Demo data already seeded — just use the credentials above

---

## ☁️ Image Uploads

- **Local dev:** Images are saved to `Backend/uploads/` folder automatically — no extra setup needed
- **Production:** Cloudinary credentials required (not needed for local demo)

---

## 🔌 API Endpoints

| Method | Route | Description | Auth |
|--------|-------|-------------|------|
| GET | `/api/health` | Health check | Public |
| POST | `/api/auth/register` | Register new user | Public |
| POST | `/api/auth/login` | Login, returns JWT | Public |
| GET | `/api/auth/me` | Get current user | User |
| GET | `/api/products` | List products (filters: search/category/price/sort) | Public |
| GET | `/api/products/featured` | Featured products | Public |
| GET | `/api/products/:id` | Single product details | Public |
| GET | `/api/products/:id/related` | Related products by category | Public |
| POST | `/api/products` | Create product | Admin |
| PUT | `/api/products/:id` | Update product | Admin |
| DELETE | `/api/products/:id` | Delete product | Admin |
| POST | `/api/orders` | Place an order | User |
| GET | `/api/orders/my` | Get my orders | User |
| GET | `/api/orders/:id` | Get single order | User/Admin |
| GET | `/api/orders` | List all orders | Admin |
| PUT | `/api/orders/:id/status` | Update order status | Admin |
| GET | `/api/users` | List all users | Admin |
| GET | `/api/users/:id` | Single user with order history | Admin |
| GET | `/api/admin/dashboard` | Dashboard metrics + analytics | Admin |
| GET | `/api/upload/status` | Check upload mode (local/cloudinary) | Public |
| POST | `/api/upload` | Upload product image | Admin |

---

## 🔐 Environment Variables

### Backend (`Backend/.env`)

| Variable | Required | Description |
|----------|----------|-------------|
| `PORT` | No | Server port (default: 5001) |
| `NODE_ENV` | No | `development` or `production` |
| `POSTGRES_URL` | ✅ Yes | NeonDB connection string (get from project owner) |
| `JWT_SECRET` | ✅ Yes | Any random strong string |
| `JWT_EXPIRES_IN` | No | JWT lifetime (default: 30d) |
| `FRONTEND_URL` | No | Frontend URL for CORS |
| `CLOUDINARY_CLOUD_NAME` | No | Only needed for production uploads |
| `CLOUDINARY_API_KEY` | No | Only needed for production uploads |
| `CLOUDINARY_API_SECRET` | No | Only needed for production uploads |
| `CLOUDINARY_FOLDER` | No | Only needed for production uploads |

### Frontend (`Frontend/.env`)

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_API_URL` | ✅ Yes | Backend API base URL |

See `.env.example` files in both `Backend/` and `Frontend/` for templates.

---

## 🐛 Common Issues

**Backend won't start?**  
→ Check your `POSTGRES_URL` is correctly pasted with no extra spaces.

**CORS error in browser?**  
→ Make sure backend is running on port `5001` and frontend on `5173`.

**Images not uploading?**  
→ In local dev, `Backend/uploads/` folder must be writable. No Cloudinary setup needed.

**Port already in use?**  
→ Change `PORT` in `Backend/.env` and update `VITE_API_URL` in `Frontend/.env` to match.
