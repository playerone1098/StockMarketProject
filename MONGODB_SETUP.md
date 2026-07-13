# MongoDB Atlas Setup Guide

## 1. Create MongoDB Atlas Account
1. Go to https://www.mongodb.com/cloud/atlas
2. Sign up for a free account
3. Create a new project

## 2. Create a Cluster
1. Click "Build a Cluster"
2. Choose "M0 Sandbox" (FREE)
3. Select a cloud provider and region closest to you
4. Click "Create Cluster"

## 3. Configure Network Access
1. Go to "Network Access" in the left sidebar
2. Click "Add IP Address"
3. Select "Allow Access from Anywhere" (0.0.0.0/0)
4. Click "Confirm"

## 4. Create Database User
1. Go to "Database Access" in the left sidebar
2. Click "Add New Database User"
3. Enter username and password
4. Select "Read and write to any database"
5. Click "Add User"

## 5. Get Connection String
1. Go to "Clusters" → "Connect" for your cluster
2. Select "Connect your application"
3. Copy the connection string
4. Replace `<username>` with your database username
5. Replace `<password>` with your database password
6. Replace `<your-database-name>` with your desired database name

## 6. Update Environment Variables & Database Isolation
Update the `.env` file in `/backend/`. StockVista automatically isolates development/test data from production data based on `NODE_ENV`.

- **Development/Local:** Connects to the `stockvista_dev` database by default.
- **Production (AWS/Vercel):** Connects to the `stockvista_prod` database by default.

To override this, you can set the database name explicitly using the `MONGODB_DB_NAME` environment variable.

Example `.env` configuration:
```env
# MongoDB Atlas Connection string (without specifying database name path)
MONGODB_URI=mongodb+srv://your-username:your-password@cluster.mongodb.net/?appName=StockVista

# Optional database override (defaults to stockvista_prod in production, stockvista_dev in development)
MONGODB_DB_NAME=stockvista_dev
```

## 7. Restart Backend
```bash
cd backend
npm run dev
```

## 8. Create Admin User
```bash
node scripts/createAdmin.js
```

## 9. Create Sample Deals (Optional)
```bash
node scripts/createSampleDeals.js
```

## Important Notes:
- Keep your MongoDB credentials secure
- Don't commit the .env file with real credentials to git
- The free M0 cluster has 512MB storage limit
- Consider upgrading to a paid tier for production use
