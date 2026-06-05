# SocialEngage AI 🚀

SocialEngage AI is a frictionless, privacy-first social media engagement utility designed to help professionals and brands craft authentic comments, captions, bios, and hashtags instantly. 

Powered by **local open-source LLMs (via Ollama)** and **cloud-based inference (via Groq)**, the platform evaluates every generation with a proprietary **Quality Telemetry Scorecard** to ensure human likeness and brand consistency.

---

## Key Features

1. **AI Comment & Engagement Generator**:
   - Customize responses for multiple platforms: LinkedIn, Twitter/X, Instagram, Facebook, YouTube, and TikTok.
   - Multiple professional and casual tone presets: *Friendly*, *Professional*, *Expert / Thought Leader*, *Curious*, *Funny / Witty*, and *Contrarian*.
2. **Post Caption & Copywriting Creator**:
   - Turn outline ideas or article drafts into social media posts.
   - Auto-appends engaging emojis and professional spacing.
3. **Elevator Bios & Profiles**:
   - Generate professional, network-specific summaries based on your work history and target roles.
4. **Hashtags Pack**:
   - Extract relevant keywords from your copy to generate organic hashtags to optimize reach.
5. **Quality Telemetry Scorecard**:
   - **Human Likeness Rating (1-100%)**: Evaluates natural phrasing and flags repetitive patterns.
   - **Spam Filter**: Identifies link-farming, low-value phrases, or bot-like hooks.
   - **Duplicate Checker**: Scours prior local generations to maintain 100% uniqueness.
6. **Ollama & LLM Local Hub**:
   - Pull and swap open-source LLMs (like `llama3`, `mistral`, or `phi3`) dynamically.
   - Option to use cloud-accelerated Groq API for faster generation.
7. **No Authentication Overhead**:
   - Designed as a frictionless local utility. No log-ins, register prompts, or pricing paywalls.

---

## System Architecture

- **Frontend**: Next.js 15+ (App Router, Tailwind CSS, TypeScript, Lucide Icons).
- **Backend**: FastAPI (Python 3.10+), SQLite (`socialengage.db`) with SQLAlchemy ORM, and optional Redis caching.
- **AI Engine**: Ollama API (`localhost:11434`) or Groq Cloud API.

---

## Setup & Running Locally

### Option 1: Docker Compose (Recommended)

To run the complete application stack (frontend + backend + db) in a single command:

```bash
docker-compose up --build
```

- **Frontend UI**: [http://localhost:3000](http://localhost:3000)
- **Backend API**: [http://localhost:8000](http://localhost:8000)

---

### Option 2: Running Components Separately

#### 1. Backend Setup
Navigate to the `backend/` directory:

```bash
cd backend

# Create a virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run the FastAPI server
python run.py
```

Create a `.env` file in the `backend/` directory:
```env
DATABASE_URL=sqlite:///./socialengage.db
OLLAMA_URL=http://localhost:11434
GROQ_API_KEY=your_groq_api_key_here
```

#### 2. Frontend Setup
Navigate to the `frontend/` directory:

```bash
cd frontend

# Install Node.js dependencies
npm install

# Run the development server
npm run dev
```

Create a `.env` file in the `frontend/` directory:
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

---

## Health & Telemetry Endpoints

SocialEngage AI includes self-monitoring and readiness health check endpoints for production setups:

- **Shallow Health check**: `GET http://localhost:8000/health`
  - *Returns SQL database connection state.*
- **Readiness check**: `GET http://localhost:8000/ready`
  - *Performs a deep check on DB, Redis connectivity, local Ollama server, and Groq API configs.*
- **System Metrics**: `GET http://localhost:8000/metrics`
  - *Reports active user, persona count, and total engagement generation stats.*

---

## Deployment

- **Frontend**: Connect your GitHub repository to **Vercel** pointing to the `frontend/` subdirectory.
- **Backend**: Deploy on **Render** (using the provided `render.yaml` blueprint or manual Web Service configuration targeting `backend/`).
