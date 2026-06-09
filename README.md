# Inventory & Order Management System

A full-stack Inventory and Order Management System built with React, FastAPI, and PostgreSQL — fully containerized with Docker and deployed on Vercel + Railway.

## Live Demo

| | URL |
|---|---|
| **Frontend** | https://inventory-system-vert-six.vercel.app/ |
| **Backend API** | https://inventory-system-production-aa3f.up.railway.app/docs |

---

## Features

- **Product Management** — Add, edit, delete products with SKU, price, and stock tracking
- **Customer Management** — Add and manage customers with contact details
- **Order Management** — Create multi-item orders with automatic stock deduction and total calculation
- **Dashboard** — Real-time stats for products, customers, orders, revenue, and low stock alerts
- **Business Logic** — Unique SKU/email enforcement, insufficient stock prevention, stock restore on order cancellation

---

## Tech Stack

### Frontend
- React 18 + TypeScript
- Vite
- Tailwind CSS
- shadcn/ui
- React Query (TanStack Query)
- React Hook Form + Zod
- React Router v6
- Axios

### Backend
- Python 3.11
- FastAPI
- SQLAlchemy ORM
- Pydantic v2
- Uvicorn

### Database
- PostgreSQL (hosted on Railway)

### DevOps
- Docker + Docker Compose
- Railway (backend + database)
- Vercel (frontend)
- Docker Hub

---

## Running Locally with Docker

### Prerequisites
- Docker and Docker Compose installed
- A PostgreSQL database URL (Railway or local)

### 1. Clone the repo

```bash
git clone https://github.com/YOUR_USERNAME/inventory-system.git
cd inventory-system
```

### 2. Create root `.env`

```env
DATABASE_URL=postgresql://postgres:password@host:port/dbname
FRONTEND_URL=http://localhost:3000
VITE_API_URL=http://localhost:8000
```

### 3. Run with Docker Compose

```bash
docker compose up --build
```

- Frontend → http://localhost:3000
- Backend API → http://localhost:8000
- Swagger docs → http://localhost:8000/docs

---

## Running Locally without Docker

### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate       # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

Create `backend/.env`:

```env
DATABASE_URL=postgresql://postgres:password@host:port/dbname
FRONTEND_URL=http://localhost:5173
```

```bash
uvicorn app.main:app --reload --port 8000
```

### Frontend

```bash
cd frontend
npm install
```

Create `frontend/.env`:

```env
VITE_API_URL=http://localhost:8000
```

```bash
npm run dev
```

Visit http://localhost:5173

---

## Docker Hub

Backend image available at:

```
docker pull YOUR_DOCKERHUB_USERNAME/inventory-backend:latest
```

---

## Business Rules

- Product SKU must be unique
- Customer email must be unique
- Product quantity cannot go negative
- Orders are rejected if stock is insufficient
- Placing an order automatically reduces stock
- Cancelling an order automatically restores stock
- Order total is calculated automatically by the backend

---

## Deployment

| Service | Platform | Notes |
|---------|----------|-------|
| Frontend | Vercel | Set `VITE_API_URL` env var to backend URL |
| Backend | Railway | Deployed via Dockerfile, set `DATABASE_URL` and `FRONTEND_URL` |
| Database | Railway PostgreSQL | URL injected as `DATABASE_URL` |
| Docker Image | Docker Hub | `YOUR_DOCKERHUB_USERNAME/inventory-backend:latest` |