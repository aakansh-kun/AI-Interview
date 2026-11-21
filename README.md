# MineInterview — Immersive Minecraft AI Mock Interview Platform

An immersive, voice-first mock interview application that transports candidates into a polished Minecraft-inspired world, face-to-face with an adaptive AI interviewer powered exclusively by Google Gemini.

---

## 🏗️ Architecture & Logical Pipeline

```text
User
  ↓
React / Vite Frontend (Minecraft Voxel 3D World & HUD)
  ↓ HTTP
FastAPI AI Backend (Local Python or Containerized)
  ↓
Resume / Role Processing
  ↓
Gemini Question Generation
  ↓
Candidate Answer (Voice or Text)
  ├── Text Input
  └── Microphone Voice → Speech-to-Text
       ↓
Answer Evaluation Pipeline
  ├── Deterministic NLP Analysis (Fillers, Pacing, Assertiveness)
  ├── Semantic Similarity & Topic Alignment
  └── Gemini LLM Contextual Evaluation
       ↓
Final Evaluation & STAR Scoring
       ↓
Adaptive Next Question (Follow-up vs. Topic Pivot)
       ↓
Score + Actionable Feedback
```

---

## 🐳 Docker Deployment Strategy

**MineInterview's FastAPI AI backend is containerized using Docker to provide a reproducible production environment for Python, NLP/ML dependencies, resume processing, interview evaluation, and Gemini integration.**

**Docker is not required for normal local development.** The Dockerfile is primarily intended for cloud/CI deployment, where the platform builds and runs the backend container directly from the repository.

### What is Containerized
- **Python 3.12 Runtime & FastAPI / Uvicorn ASGI Server**
- **Google GenAI SDK (`google-genai`)** for Gemini LLM communication
- **NLP Analysis Modules** (`filler_detection`, `confidence_analysis`, `structure_analysis`)
- **Semantic Similarity Engine** (`semantic_similarity`)
- **PDF Resume Ingestion** (`pypdf` extraction and cleaning)
- **Interview State Engine & STAR Scoring Engine**

### Layer-Cached Image Build Architecture
The `backend/Dockerfile` separates dependency installation from source code copying to maximize Docker build caching:
1. `FROM python:3.12-slim` (Lightweight official base image)
2. `COPY requirements.txt .` & `RUN pip install --no-cache-dir -r requirements.txt` (Cached layer)
3. `COPY . .` (Only rebuilds when application code changes)
4. `EXPOSE 8000`
5. `CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]`

### Production Container Deployment Commands
For deployment on platforms such as Google Cloud Run, AWS ECS, or Render:
```bash
# Build the production backend container image
docker build -t mineinterview-backend ./backend

# Run the container with injected environment variable
docker run -p 8000:8000 -e GEMINI_API_KEY=your_gemini_api_key mineinterview-backend
```

### Health Check Endpoint
The container exposes a standard health probe:
- **`GET /health`**
  ```json
  {
    "status": "healthy",
    "service": "mineinterview-backend"
  }
  ```

---

## 💻 Local Development Workflow (Zero Docker Prerequisite)

Local development does **NOT** require Docker Desktop, WSL, Docker daemon, or container setup. You can run the project natively using Python and Node.js.

### 1. Backend Setup
```bash
# Navigate to backend directory
cd backend

# Create and activate virtual environment (optional but recommended)
python -m venv venv
# Windows: venv\Scripts\activate | macOS/Linux: source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Configure your API key (optional - built-in fallback works out of the box)
cp .env.example .env
# Edit .env and set GEMINI_API_KEY=your_key

# Start development server
uvicorn main:app --reload --port 8000
```

### 2. Frontend Setup
```bash
# In a separate terminal, navigate to frontend
cd frontend

# Install dependencies
npm install

# Start Vite development server
npm run dev
```
Open **`http://localhost:5173/`** to begin your mock interview.

---

## 📂 Project Directory Structure

```text
mineinterview/
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── world/          # MinecraftLandscape (dawn valley, mountains, cabin)
│   │   │   ├── interviewer/    # MinecraftAvatar (1:1 voxel rig), CharacterCarousel
│   │   │   └── interview/      # MinecraftInterviewRoom3D, MinecraftHUD, SetupModal
│   │   ├── pages/              # Home, Interview, Results
│   │   ├── hooks/              # useSoundEffects
│   │   ├── services/           # api.js
│   │   └── styles/             # minecraft-theme.css (Ancient City / Sculk Cyan palette)
│   ├── package.json
│   ├── vite.config.js
│   └── index.html
│
├── backend/
│   ├── main.py                 # FastAPI application, CORS, health endpoints
│   │
│   ├── api/                    # Modular API route controllers
│   │   ├── interview.py        # /api/interview/create, /answer, /complete
│   │   ├── resume.py           # /api/resume/upload
│   │   ├── audio.py            # /api/audio/preview, /transcribe
│   │   └── evaluation.py       # /api/evaluation/{id}
│   │
│   ├── services/               # Core business services
│   │   ├── gemini_service.py   # Centralized Google Gemini client (google-genai)
│   │   ├── interview_service.py# Session state machine & turn tracking
│   │   ├── resume_service.py   # PDF text extraction via pypdf
│   │   ├── speech_service.py   # Voice previews & transcription bridge
│   │   └── evaluation_service.py # Aggregates NLP, semantic similarity & LLM review
│   │
│   ├── nlp/                    # Deterministic local NLP modules
│   │   ├── filler_detection.py # Regex filler word analysis
│   │   ├── confidence_analysis.py # Assertive vs. hesitant language detection
│   │   └── structure_analysis.py # Pacing (WPM), word count, STAR methodology
│   │
│   ├── similarity/             # Semantic similarity subsystem
│   │   └── semantic_similarity.py # Cosine relevance against expected competencies
│   │
│   ├── ml/                     # Machine Learning specifications
│   │   └── README.md           # Future CNN-BiLSTM audio confidence architecture
│   │
│   ├── prompts/                # Structured Gemini system instructions
│   │   ├── interviewer.py      # Character personas (Arjun, Maya, James, Alexa)
│   │   └── evaluator.py        # Comprehensive report & review prompts
│   │
│   ├── models/                 # Pydantic data schemas
│   │   ├── interview.py        # Turn, Session, InterviewerConfig
│   │   └── evaluation.py       # FinalEvaluation, SpeechAnalysis, STARPerformance
│   │
│   ├── tests/
│   │   └── test_flow.py        # Integration test suite
│   │
│   ├── requirements.txt        # Production dependencies
│   ├── Dockerfile              # Production container packaging (python:3.12-slim)
│   ├── .dockerignore           # Excludes cache, logs, virtualenvs, secrets
│   └── .env.example            # Environment template
│
├── .gitignore
└── README.md
```

---

## 👥 Interviewer Personas

- **Arjun — Technical Engineer**: Dark hair, navy jacket with subtle sculk cyan detail, calm & analytical, system architecture trade-offs.
- **Maya — Startup Interviewer**: Indigo modern hair, warm terracotta hoodie, energetic & fast-moving, 0-to-1 prototyping.
- **James — Senior Engineering Manager**: Silver-slate hair, formal charcoal suit, crimson tie, concise & challenging, ownership & business impact.
- **Alexa — Recruiter**: Auburn hair, emerald casual blazer, cream blouse, warm & conversational, candidate journey.
