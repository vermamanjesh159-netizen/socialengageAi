# 🚀 Deployment Guide: SocialEngage AI

This project is structured as a monorepo containing:
* `/backend`: FastAPI service + SQLite + Redis
* `/frontend`: Next.js Web App

---

## 1. Backend Deployment (Render)

We have configured a `render.yaml` Blueprint specification. To deploy the backend stack (FastAPI API service + Redis):

1. Commit and push the repository to your GitHub account.
2. Go to your **[Render Dashboard](https://dashboard.render.com)**.
3. Click **New +** and select **Blueprint**.
4. Connect this GitHub repository.
5. Render will automatically detect `render.yaml` and configure:
   * **`socialengage-redis`** (Redis instance)
   * **`socialengage-backend`** (FastAPI Web Service running SQLite locally)
6. During creation, Render will prompt you to fill in the **`GROQ_API_KEY`** environment variable (you can enter your key or leave it empty to default to Ollama).
7. Click **Approve** to build and spin up the backend.

---

## 2. Frontend Deployment (Vercel)

The Next.js frontend is deployed to Vercel:

1. Go to **[Vercel Dashboard](https://vercel.com)**.
2. Click **Add New** -> **Project**.
3. Import this GitHub repository.
4. In the **Configure Project** step:
   * **Framework Preset**: Next.js (detected automatically).
   * **Root Directory**: Click *Edit* and select **`frontend`**.
5. Expand **Environment Variables** and add:
   * **`NEXT_PUBLIC_API_URL`**: `https://<your-backend-app-name>.onrender.com` (use the URL provided by your Render FastAPI service).
6. Click **Deploy**. Vercel will build and launch your production site.

---

## 3. Production Health Check
Once both services are running, verify integration:
1. Visit `https://<your-vercel-domain>.vercel.app/login`
2. Create an account, log in, and test generating comments.
3. Check the "Ollama & LLM Local Hub" page to verify the active status of your Groq API Key!
