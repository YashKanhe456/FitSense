# MongoDB Atlas Setup

Your project is currently configured to use `MONGO_URI` from `Backend/.env`.

## Current status

The current local backend `.env` is still using a local MongoDB connection:

`mongodb://127.0.0.1:27017/patilMensWear`

To switch to Atlas, replace only the `MONGO_URI` value in `Backend/.env`.

## 1. Create Atlas access

In MongoDB Atlas:

- Create or open your cluster
- Go to `Database Access`
- Create a database user
- Save the username and password
- Go to `Network Access`
- Add your IP address
- For temporary testing, you can allow `0.0.0.0/0`

## 2. Get the connection string

In Atlas:

- Click `Connect`
- Choose `Drivers`
- Copy the `mongodb+srv://...` connection string

Expected format:

`mongodb+srv://<username>:<url_encoded_password>@<cluster-name>.mongodb.net/patilMensWear?retryWrites=true&w=majority&appName=PatilMensWear`

Important:

- If your password contains special characters like `@`, `#`, `%`, `/`, `:`, encode them first
- Example: `@` becomes `%40`

## 3. Update Backend/.env

Replace the local line:

`MONGO_URI=mongodb://127.0.0.1:27017/patilMensWear`

With your Atlas URI:

`MONGO_URI=mongodb+srv://yourUser:yourEncodedPassword@yourCluster.mongodb.net/patilMensWear?retryWrites=true&w=majority&appName=PatilMensWear`

## 4. Verify connection

Run:

```powershell
cd Backend
npm run check:atlas
```

If successful, you will see:

`Atlas connection successful: ...`

## 5. Seed demo data into Atlas

After the Atlas connection works:

```powershell
cd Backend
npm run seed
```

This will create:

- Admin user: `admin@patilmenswear.com`
- Password: `Admin@1234`
- Demo products for the store

## 6. Deployment env values

For Render or Vercel backend envs, set:

- `NODE_ENV=production`
- `PORT=5000` for Render local config if needed
- `MONGO_URI=<your atlas uri>`
- `JWT_SECRET=<strong random secret>`
- `JWT_EXPIRES_IN=30d`
- `FRONTEND_URL=<your deployed frontend url>`

## 7. Frontend note

Frontend does not connect to MongoDB directly.
Only the backend needs the Atlas URI.
