# AI-Powered CV Maker

A full-stack web application that generates professionally tailored CVs using GPT-4o. Users store their complete professional profile once, then generate customised CVs for any job description in seconds — with a chat interface for AI-assisted editing and one-click PDF export.

---

## Table of Contents

- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [API Reference](#api-reference)
- [Database Schema](#database-schema)
- [CV Generation Pipeline](#cv-generation-pipeline)
- [Templates](#templates)
- [Development Workflow](#development-workflow)
- [Deployment (Azure)](#deployment-azure)
- [Design Decisions](#design-decisions)

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React (Vite), React Router, Zustand, Axios |
| Backend | FastAPI (Python 3.12) |
| Database | PostgreSQL 16 |
| AI | OpenAI GPT-4o (JSON mode) |
| PDF Engine | WeasyPrint + Jinja2 |
| Auth | JWT — access + refresh tokens, bcrypt |
| Containerisation | Docker, Docker Compose |
| CI/CD | GitHub Actions |
| Cloud | Azure Container Apps, Azure Container Registry, Azure Key Vault |

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     User / Browser                          │
│         React SPA — dashboard, CV editor, chat interface    │
└─────────────────────────┬───────────────────────────────────┘
                          │ HTTPS / REST
┌─────────────────────────▼───────────────────────────────────┐
│             Frontend Container (React + Nginx)              │
│         Serves SPA, proxies /api/ calls to backend          │
└─────────────────────────┬───────────────────────────────────┘
                          │ REST / JSON
┌─────────────────────────▼───────────────────────────────────┐
│                  Backend Container (FastAPI)                 │
│    Auth, profile CRUD, CV generation, AI orchestration,     │
│    PDF export                                               │
└──────────┬──────────────────────────────┬───────────────────┘
           │ SQLAlchemy (async)            │ OpenAI SDK
┌──────────▼──────────┐        ┌──────────▼──────────────────┐
│  PostgreSQL 16       │        │  OpenAI API (GPT-4o)        │
│  users, profiles,   │        │  CV generation + chat       │
│  CVs, sessions      │        │  editing                    │
└─────────────────────┘        └─────────────────────────────┘
           │
┌──────────▼──────────────────────────────┐
│       PDF Engine (WeasyPrint)           │
│   Jinja2 HTML template → PDF bytes      │
└─────────────────────────────────────────┘
```

---

## Project Structure

```
cv-maker/
├── backend/
│   ├── app/
│   │   ├── main.py                     # FastAPI app factory, router registration
│   │   ├── config.py                   # Settings from environment variables
│   │   ├── dependencies.py             # get_current_user JWT middleware
│   │   ├── api/v1/
│   │   │   ├── auth.py                 # Register, login, refresh, me
│   │   │   ├── profile.py              # Profile CRUD (18 endpoints)
│   │   │   ├── cvs.py                  # Generate, list, get, download
│   │   │   ├── templates.py            # List available CV templates
│   │   │   └── chat.py                 # AI chat editing session
│   │   ├── core/
│   │   │   ├── security.py             # bcrypt hashing + JWT encode/decode
│   │   │   └── exceptions.py           # Custom HTTP exception handlers
│   │   ├── db/
│   │   │   ├── session.py              # Async SQLAlchemy engine + get_db
│   │   │   ├── base.py                 # Declarative base aggregator
│   │   │   └── migrations/             # Alembic migration files
│   │   ├── models/
│   │   │   ├── user.py
│   │   │   ├── profile.py              # Profile, WorkExperience, Education,
│   │   │   │                           # Skill, Project, Certification
│   │   │   ├── cv.py
│   │   │   └── chat_message.py
│   │   ├── schemas/
│   │   │   ├── auth.py
│   │   │   ├── profile.py
│   │   │   ├── cv.py
│   │   │   └── chat.py
│   │   ├── services/
│   │   │   ├── auth_service.py
│   │   │   ├── profile_service.py
│   │   │   ├── cv_service.py           # Orchestrates generation pipeline
│   │   │   ├── ai_service.py           # All OpenAI calls
│   │   │   ├── pdf_service.py          # HTML → PDF via WeasyPrint
│   │   │   └── template_service.py     # Loads and renders Jinja2 templates
│   │   ├── templates/                  # Jinja2 HTML CV templates
│   │   │   ├── base_cv.html
│   │   │   ├── template_modern.html
│   │   │   ├── template_minimal.html
│   │   │   ├── template_technical.html
│   │   │   ├── template_creative.html
│   │   │   └── template_executive.html
│   │   └── utils/
│   │       ├── prompt_builder.py       # Assembles AI prompts from profile data
│   │       └── cv_parser.py            # Parses AI JSON output → CV schema
│   ├── tests/
│   │   ├── conftest.py
│   │   ├── test_auth.py
│   │   ├── test_cv_generation.py
│   │   └── test_ai_service.py
│   ├── alembic.ini
│   ├── requirements.txt
│   └── Dockerfile
│
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   │   ├── client.js               # Axios instance + JWT interceptors
│   │   │   ├── auth.js
│   │   │   ├── profile.js
│   │   │   ├── cvs.js
│   │   │   └── chat.js
│   │   ├── store/
│   │   │   ├── authStore.js            # Global auth state (Zustand)
│   │   │   ├── profileStore.js
│   │   │   └── cvStore.js
│   │   ├── pages/
│   │   │   ├── LoginPage.jsx
│   │   │   ├── RegisterPage.jsx
│   │   │   ├── DashboardPage.jsx
│   │   │   ├── ProfilePage.jsx
│   │   │   ├── GeneratePage.jsx        # JD input + template picker
│   │   │   ├── CVListPage.jsx
│   │   │   ├── CVViewPage.jsx          # Preview + download + chat
│   │   │   └── NotFoundPage.jsx
│   │   ├── components/
│   │   │   ├── layout/
│   │   │   │   ├── Sidebar.jsx
│   │   │   │   ├── Topbar.jsx
│   │   │   │   └── PageWrapper.jsx
│   │   │   ├── profile/
│   │   │   │   ├── PersonalInfoForm.jsx
│   │   │   │   ├── WorkExperienceForm.jsx
│   │   │   │   ├── EducationForm.jsx
│   │   │   │   ├── SkillsForm.jsx
│   │   │   │   ├── ProjectsForm.jsx
│   │   │   │   └── CertificationsForm.jsx
│   │   │   ├── cv/
│   │   │   │   ├── TemplateCard.jsx
│   │   │   │   ├── CVCard.jsx
│   │   │   │   └── CVPreviewFrame.jsx
│   │   │   ├── chat/
│   │   │   │   ├── ChatPanel.jsx
│   │   │   │   └── ChatMessage.jsx
│   │   │   └── common/
│   │   │       ├── Button.jsx
│   │   │       ├── Input.jsx
│   │   │       ├── Modal.jsx
│   │   │       └── LoadingSpinner.jsx
│   │   ├── hooks/
│   │   │   ├── useAuth.js
│   │   │   ├── useProfile.js
│   │   │   └── useCV.js
│   │   ├── utils/
│   │   │   ├── formatters.js
│   │   │   └── validators.js
│   │   ├── App.jsx                     # Router, AuthGuard, session restore
│   │   └── main.jsx
│   ├── nginx.conf                      # SPA fallback + /api/ proxy
│   ├── Dockerfile
│   └── package.json
│
├── .github/
│   └── workflows/
│       └── deploy.yml                  # CI/CD pipeline
├── docker-compose.yml
├── .env.example
└── .gitignore
```

---

## Getting Started

The only prerequisite is [Docker Desktop](https://www.docker.com/products/docker-desktop/). Everything else runs inside containers.

### 1. Clone the repository

```bash
git clone https://github.com/your-username/cv-maker.git
cd cv-maker
```

### 2. Configure environment variables

```bash
cp .env.example .env
```

Open `.env` and fill in your values — see [Environment Variables](#environment-variables) below.

### 3. Start the application

```bash
docker compose up --build
```

The first run takes 3–5 minutes while base images download and packages install. Subsequent starts are much faster.

### 4. Apply database migrations

In a second terminal:

```bash
docker exec -it cv-maker-backend-1 bash
alembic upgrade head
exit
```

### 5. Open the app

| URL | Description |
|---|---|
| `http://localhost` | React frontend |
| `http://localhost:8000/docs` | FastAPI interactive API docs (Swagger) |
| `http://localhost:8000` | API health check |

---

## Environment Variables

```bash
DB_USER=cvmaker_user
DB_PASSWORD=your_strong_password_here
DB_NAME=cvmaker
SECRET_KEY=your_jwt_secret_key_here
OPENAI_API_KEY=sk-...
```

> `.env` is git-ignored. Never commit secrets to the repository.

| Variable | Description |
|---|---|
| `DB_USER` | PostgreSQL username |
| `DB_PASSWORD` | PostgreSQL password |
| `DB_NAME` | PostgreSQL database name |
| `SECRET_KEY` | JWT signing secret — any long random string |
| `OPENAI_API_KEY` | OpenAI API key from [platform.openai.com](https://platform.openai.com) |

---

## API Reference

All endpoints are prefixed with `/api/v1/`. Protected routes require `Authorization: Bearer <access_token>`.

### Auth — `/auth`

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| `POST` | `/register` | Create account, returns JWT pair | No |
| `POST` | `/login` | Login, returns JWT pair | No |
| `POST` | `/refresh` | Issue new access token from refresh token | No |
| `GET` | `/me` | Get current user info | Yes |

### Profile — `/profile`

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/` | Get entire profile (all sections) |
| `PUT` | `/personal` | Update personal info and summary |
| `GET / POST` | `/experience` | List or add work experience |
| `PUT / DELETE` | `/experience/{id}` | Update or delete an entry |
| `GET / POST` | `/education` | List or add education |
| `PUT / DELETE` | `/education/{id}` | Update or delete an entry |
| `GET / POST` | `/skills` | List or bulk upsert skills |
| `GET / POST` | `/projects` | List or add a project |
| `PUT / DELETE` | `/projects/{id}` | Update or delete a project |
| `GET / POST` | `/certifications` | List or add a certification |
| `PUT / DELETE` | `/certifications/{id}` | Update or delete a certification |

### CVs — `/cvs`

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/generate` | Generate a new CV from profile + job description |
| `GET` | `/` | List all generated CVs |
| `GET` | `/{id}` | Get a specific CV |
| `GET` | `/{id}/download` | Download CV as PDF |
| `POST` | `/{id}/chat` | Send a message to AI-edit the CV |
| `GET` | `/templates` | List available CV templates |

---

## Database Schema

```
users               — id, email, hashed_password, full_name, timestamps
profiles            — user_id (1:1), phone, location, linkedin, portfolio, summary
work_experiences    — user_id (1:many), job_title, company, dates, responsibilities (JSON)
educations          — user_id (1:many), degree, institution, year, gpa
skills              — user_id (1:many), name, category, proficiency
projects            — user_id (1:many), name, description, technologies (JSON), url
certifications      — user_id (1:many), name, issuer, issue_date, expiry_date
cvs                 — user_id (1:many), template, job_description, cv_content (JSONB), timestamps
chat_messages       — cv_id (1:many), role, content, timestamps
```

CV content is stored as JSONB, enabling fast re-rendering across different templates without re-calling the AI.

---

## CV Generation Pipeline

```
User submits job description + template choice
        │
        ▼
Backend assembles prompt from full profile data
        │
        ▼
GPT-4o (JSON mode) generates structured CV content
— relevant sections only, strict no-hallucination prompt
        │
        ▼
Pydantic validates the AI JSON output
        │
        ▼
CV content saved to database (JSONB column)
        │
        ▼
Jinja2 renders HTML using the chosen template
        │
        ▼
WeasyPrint converts HTML → PDF bytes
        │
        ▼
PDF returned to user for download
```

After generation, users can open the **AI chat panel** to refine any part of the CV using natural language — e.g. *"Make the summary more concise"* or *"Add more impact to the second bullet point"*.

---

## Templates

| Template | Style |
|---|---|
| `modern` | Clean layout with subtle colour accents |
| `minimal` | Whitespace-focused, typography-led |
| `technical` | Skills-forward, structured for engineering roles |
| `creative` | Visual hierarchy, suited to design and marketing |
| `executive` | Formal, achievement-driven, suited to senior roles |

Templates are Jinja2 HTML files with print-optimised CSS — fully ATS-compatible.

---

## Development Workflow

```bash
# Start all containers
docker compose up

# Stop containers (data is preserved)
Ctrl+C

# Wipe everything including the database
docker compose down -v
```

### Rebuilding after changes

```bash
# Backend Python files — auto-reloads via Uvicorn watchfiles (no rebuild needed)

# Frontend source changes
docker compose up --build frontend

# Dependency changes (requirements.txt or package.json)
docker compose up --build backend
docker compose up --build frontend
```

### Database migrations

```bash
# After adding or modifying a model
docker exec -it cv-maker-backend-1 bash
alembic revision --autogenerate -m "describe your change"
alembic upgrade head
exit
```

### Adding a new database table

1. Add the model class to `backend/app/models/`
2. Import it in `backend/app/models/__init__.py`
3. Import it in `backend/migrations/env.py`
4. Run the migration commands above

### Inspecting the database

```bash
# Quick terminal access
docker exec -it cv-maker-db-1 psql -U cvmaker_user -d cvmaker
\dt    # list tables
\q     # exit
```

For a GUI, temporarily add `ports: ["5432:5432"]` to the `db` service in `docker-compose.yml`, then connect with any PostgreSQL client on `localhost:5432`. Remove the port mapping before deploying.

---

## Authentication Flow

```
Register / Login  →  access_token (30 min) + refresh_token (7 days)
Every request     →  Authorization: Bearer {access_token}
Token expired     →  Axios interceptor calls /auth/refresh automatically
Refresh fails     →  User redirected to /login
```

Passwords are hashed with bcrypt and never stored in plain text. JWTs are signed with `SECRET_KEY` and cannot be forged without it.

---

## Deployment (Azure)

The app deploys to **Azure Container Apps** via GitHub Actions.

### Infrastructure

| Resource | Purpose |
|---|---|
| Azure Container Registry | Stores Docker images |
| Azure Container Apps | Runs backend and frontend containers |
| Azure Database for PostgreSQL | Managed production database |
| Azure Key Vault | Stores secrets, injected via managed identity |
| Azure Log Analytics Workspace | Centralised container logs |

### CI/CD Pipeline

Every push to `main` triggers the GitHub Actions workflow, which runs `pytest`, builds and pushes Docker images to ACR (tagged with the commit SHA), then updates the running Container Apps. Pull requests trigger tests only — no deploy.

### Required GitHub Secrets

| Secret | Value |
|---|---|
| `AZURE_CREDENTIALS` | JSON output of `az ad sp create-for-rbac` |
| `ACR_NAME` | Your ACR name (e.g. `cvmakeracr`) |
| `ACR_LOGIN_SERVER` | e.g. `cvmakeracr.azurecr.io` |
| `OPENAI_API_KEY` | Your OpenAI key |
| `SECRET_KEY` | Your JWT secret |

All production secrets are injected via Key Vault references — no secrets are stored in code or container images.

> Database migrations are run as a one-off Container Apps Job after each deploy, not at app startup, to avoid race conditions when multiple replicas start simultaneously.

---

## Design Decisions

| Area | Decision | Reason |
|---|---|---|
| Auth | JWT access + refresh tokens, bcrypt | Stateless, straightforward, secure |
| AI model | GPT-4o, JSON mode | Best output quality, structured and parseable responses |
| AI safety | Strict no-hallucination system prompt | CV content must be factual — core product requirement |
| PDF engine | WeasyPrint (Python-native) | No headless browser needed, easy to containerise |
| CV storage | JSONB column | Fast re-render across templates, edit without re-generating |
| Background jobs | FastAPI `BackgroundTasks` | Sufficient for MVP, no extra infrastructure |
| Frontend state | Zustand | Lightweight, no Redux boilerplate |
| Secrets | Azure Key Vault via managed identity | No secrets in code or images |

### Upgrade Path

When the app is stable and ready to scale:

- Replace `BackgroundTasks` → **Celery + Redis** for reliable async job queuing
- Add **Redis cache** for profile data and rendered templates
- Add **rate limiting** per user on AI generation endpoints
- Add **WebSockets** to replace polling on CV generation status
- Split PDF engine into its own container if load increases

---

*FastAPI · React · PostgreSQL · OpenAI · Azure*
