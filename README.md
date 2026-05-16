# Nexus Dashboard

**Live Demo** : [Nexus Dashboard](https://nexus-dashboard-am.vercel.app)

A full-stack general dashboard app with real user authentication, task management, and analytics.

**Stack:** React + Vite · Node.js + Express · MongoDB Atlas · JWT

**Deploy:** Vercel (frontend) + Railway (backend)

---

## Features

- JWT-based login and registration with bcrypt password hashing
- Kanban task board — To Do / In Progress / Done
- Dashboard with completion rate, stat cards, and recent tasks
- Profile management — edit name, avatar, change password
- Protected routes with auto-logout on token expiry
- Rate limiting and server-side input validation

---

## Project Structure

```
nexus-dashboard/
├── backend/
│   └── src/
│       ├── server.js
│       ├── middleware/auth.js
│       ├── models/          # User, Task, Note
│       └── routes/          # auth, user, tasks, stats
└── frontend/
    └── src/
        ├── App.jsx
        ├── context/AuthContext.jsx
        ├── utils/api.js
        ├── components/Layout.jsx
        └── pages/           # Login, Register, Dashboard, Tasks, Profile
```

---

## Getting Started

### Prerequisites

- Node.js v18+
- A free [MongoDB Atlas](https://mongodb.com/atlas) account

### Install

```bash
git clone https://github.com/your-username/nexus-dashboard.git
cd nexus-dashboard

cd backend && npm install
cd ../frontend && npm install
```

### Configure

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

Fill in `backend/.env`:

```env
PORT=5000
MONGODB_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/dashboard_db
JWT_SECRET=your_secret_key_min_32_chars
JWT_EXPIRE=7d
NODE_ENV=development
CLIENT_URL=http://localhost:5173
```

Fill in `frontend/.env`:

```env
VITE_API_URL=http://localhost:5000
```

### Run locally

```bash
# Terminal 1
cd backend && npm run dev

# Terminal 2
cd frontend && npm run dev
```

App runs at `http://localhost:5173`

---

## API Routes

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| POST | `/api/auth/register` | No | Register new user |
| POST | `/api/auth/login` | No | Login, returns JWT |
| GET | `/api/auth/me` | Yes | Get current user |
| GET | `/api/user/profile` | Yes | Get profile |
| PUT | `/api/user/profile` | Yes | Update profile |
| PUT | `/api/user/password` | Yes | Change password |
| GET | `/api/tasks` | Yes | List tasks |
| POST | `/api/tasks` | Yes | Create task |
| PUT | `/api/tasks/:id` | Yes | Update task |
| DELETE | `/api/tasks/:id` | Yes | Delete task |
| GET | `/api/stats/overview` | Yes | Dashboard stats |

---

## Deployment

### Backend → Railway

```bash
npm install -g @railway/cli
cd backend
railway login && railway init && railway up
railway variables set MONGODB_URI="..." JWT_SECRET="..." NODE_ENV=production CLIENT_URL="https://your-app.vercel.app"
```

### Frontend → Vercel

```bash
npm install -g vercel
cd frontend
vercel --prod
# Set VITE_API_URL = your Railway backend URL
```

---

## Environment Variables

| Variable | Description |
|----------|-------------|
| `MONGODB_URI` | MongoDB Atlas connection string |
| `JWT_SECRET` | Secret for signing tokens (32+ chars) |
| `JWT_EXPIRE` | Token expiry e.g. `7d` |
| `CLIENT_URL` | Frontend URL for CORS |
| `VITE_API_URL` | Backend URL (frontend only) |

---