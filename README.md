# Nexus Dashboard

A full-stack dashboard app with authentication, task management, and analytics.

**Stack:** React + Vite (frontend) · Node.js + Express (backend) · MongoDB Atlas · JWT Auth

**Deploy:** Vercel (frontend) + Railway (backend)

## Quick Start

### Backend
```bash
cd backend
npm install
cp .env.example .env      # Fill in MONGODB_URI and JWT_SECRET
npm run dev               # Runs on :5000
```

### Frontend
```bash
cd frontend
npm install
cp .env.example .env      # Set VITE_API_URL=http://localhost:5000
npm run dev               # Runs on :5173
```

## Deploy

### 1. MongoDB Atlas (free)
- mongodb.com/atlas → Create cluster → Get connection string
- Paste into backend `.env` as `MONGODB_URI`

### 2. Deploy Backend to Railway
```bash
npm install -g @railway/cli
railway login
cd backend
railway init --name nexus-api
railway up
railway variables set MONGODB_URI="..." JWT_SECRET="your-secret-min-32-chars" NODE_ENV=production CLIENT_URL="https://your-vercel-url.vercel.app"
```

### 3. Deploy Frontend to Vercel
```bash
npm install -g vercel
cd frontend
vercel --prod
# When prompted: set VITE_API_URL = your Railway URL (e.g. https://nexus-api.up.railway.app)
```

## API Endpoints

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| POST | /api/auth/register | No | Register new user |
| POST | /api/auth/login | No | Login, returns JWT |
| GET | /api/auth/me | Yes | Get current user |
| GET | /api/user/profile | Yes | Get profile |
| PUT | /api/user/profile | Yes | Update profile |
| PUT | /api/user/password | Yes | Change password |
| GET | /api/tasks | Yes | List tasks (filter/paginate) |
| POST | /api/tasks | Yes | Create task |
| PUT | /api/tasks/:id | Yes | Update task |
| DELETE | /api/tasks/:id | Yes | Delete task |
| GET | /api/stats/overview | Yes | Dashboard statistics |
