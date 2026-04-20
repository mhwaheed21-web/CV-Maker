# AI-Powered CV Maker

> A full-stack web application that generates professionally tailored CVs using GPT-4o. Store your professional profile once, then generate a customised, ATS-optimised CV for any job description in seconds — with an AI chat interface for iterative editing and one-click PDF export.

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [API Reference](#api-reference)
- [Database Schema](#database-schema)
- [CV Generation Pipeline](#cv-generation-pipeline)
- [CV Templates](#cv-templates)
- [AI Safety & Hallucination Prevention](#ai-safety--hallucination-prevention)
- [Authentication Flow](#authentication-flow)
- [Development Workflow](#development-workflow)
- [Testing](#testing)
- [Deployment (Azure)](#deployment-azure)
- [CI/CD Pipeline](#cicd-pipeline)
- [Design Decisions](#design-decisions)
- [Upgrade Path](#upgrade-path)

---

## Features

- **Profile-Once, Generate-Many** — enter your full professional profile (work experience, education, skills, projects, certifications) and generate unlimited tailored CVs without re-entering data
- **AI-Tailored Generation** — GPT-4o rewrites your profile content to match the language, keywords, and priorities of each specific job description
- **ATS Optimisation** — structured output designed to pass Applicant Tracking Systems
- **5 Professional Templates** — minimal, modern, technical, creative, and executive styles
- **AI Chat Editing** — refine any section using plain English after generation (e.g. *"Move skills above experience"*, *"Rewrite the summary to be more concise"*)
- **PDF Export** — download a print-ready A4 PDF with one click
- **Full CV History** — all generated CVs are saved, accessible, and re-editable
- **Persistent Chat History** — AI editing conversations are saved per CV
- **JWT Authentication** — secure register/login with automatic token refresh

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 (Vite), React Router v6, Zustand, Axios |
| Backend | FastAPI (Python 3.12), SQLAlchemy (async), Alembic |
| Database | PostgreSQL 16 |
| AI | OpenAI GPT-4o (JSON mode) |
| PDF Engine | WeasyPrint + Jinja2 |
| Auth | JWT — access + refresh tokens, bcrypt password hashing |
| Containerisation | Docker, Docker Compose |
| CI/CD | GitHub Actions |
| Cloud | Azure Container Apps, Azure Container Registry, Azure Key Vault, Azure Database for PostgreSQL |

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
│  CVs, chat history  │        │  editing                    │
└─────────────────────┘        └─────────────────────────────┘
           │
┌──────────▼──────────────────────────────┐
│       PDF Engine (WeasyPrint)           │
│   Jinja2 HTML template → PDF bytes      │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                   DevOps & Deployment                       │
│  ┌─────────────────┐  ┌──────────────┐  ┌───────────────┐  │
│  │  Docker Compose │  │GitHub Actions│  │  Azure        │  │
│  │   Local dev     │  │ CI/CD        │  │  Container    │  │
│  └─────────────────┘  └──────────────┘  │  Apps         │  │
│                                         └───────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

Nginx on the frontend container proxies all `/api/*` requests to the backend, so the React app never needs to know the backend's internal address.

---

## Project Structure

```
cv-maker/
├── backend/
│   ├── app/
│   │   ├── main.py                    # FastAPI app factory, router registration
│   │   ├── config.py                  # Settings via pydantic-settings (env vars)
│   │   ├── dependencies.py            # Shared DI: get_db, get_current_user
│   │   │
│   │   ├── api/v1/
│   │   │   ├── auth.py                # /auth/register, /auth/login, /auth/refresh, /auth/me
│   │   │   ├── profile.py             # /profile/* — all CV data sections CRUD
│   │   │   ├── cvs.py                 # /cvs/* — generate, list, get, download, delete
│   │   │   ├── templates.py           # /templates — list available templates
│   │   │   └── chat.py                # /cvs/{id}/chat — AI editing session
│   │   │
│   │   ├── core/
│   │   │   ├── security.py            # JWT encode/decode, bcrypt hashing
│   │   │   └── exceptions.py          # Global HTTP exception handlers
│   │   │
│   │   ├── db/
│   │   │   ├── session.py             # Async SQLAlchemy engine + session factory
│   │   │   ├── base.py                # Declarative base import aggregator
│   │   │   └── migrations/            # Alembic migration files
│   │   │       └── versions/
│   │   │
│   │   ├── models/
│   │   │   ├── user.py
│   │   │   ├── profile.py             # Profile, WorkExperience, Education,
│   │   │   │                          #   Skill, Project, Certification
│   │   │   ├── cv.py                  # GeneratedCV
│   │   │   └── chat_message.py
│   │   │
│   │   ├── schemas/                   # Pydantic request/response schemas
│   │   │   ├── auth.py
│   │   │   ├── profile.py
│   │   │   ├── cv.py
│   │   │   └── chat.py
│   │   │
│   │   ├── services/                  # Business logic layer
│   │   │   ├── auth_service.py        # Registration, login, token refresh
│   │   │   ├── profile_service.py     # CRUD for all profile sections
│   │   │   ├── cv_service.py          # Orchestrates generation pipeline
│   │   │   ├── ai_service.py          # All OpenAI calls (generation + editing)
│   │   │   ├── pdf_service.py         # HTML → PDF via WeasyPrint
│   │   │   └── template_service.py    # Loads and renders Jinja2 CV templates
│   │   │
│   │   ├── templates/                 # Jinja2 HTML templates for CV output
│   │   │   ├── base_cv.html
│   │   │   ├── template_minimal.html
│   │   │   ├── template_modern.html
│   │   │   ├── template_technical.html
│   │   │   ├── template_creative.html
│   │   │   └── template_executive.html
│   │   │
│   │   └── utils/
│   │       ├── prompt_builder.py      # Assembles AI prompts from profile data
│   │       └── cv_parser.py           # Parses + validates AI JSON output
│   │
│   ├── tests/
│   │   ├── conftest.py
│   │   ├── test_auth.py
│   │   ├── test_cv_generation.py
│   │   └── test_ai_service.py
│   │
│   ├── alembic.ini
│   ├── requirements.txt
│   └── Dockerfile
│
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   │   ├── client.js              # Axios instance + JWT interceptors
│   │   │   ├── auth.js
│   │   │   ├── profile.js
│   │   │   ├── cvs.js
│   │   │   └── chat.js
│   │   │
│   │   ├── store/                     # Zustand global state
│   │   │   ├── authStore.js
│   │   │   ├── profileStore.js
│   │   │   └── cvStore.js
│   │   │
│   │   ├── pages/
│   │   │   ├── LoginPage.jsx
│   │   │   ├── RegisterPage.jsx
│   │   │   ├── DashboardPage.jsx      # Overview + navigation hub
│   │   │   ├── ProfilePage.jsx        # All CV data sections
│   │   │   ├── GeneratePage.jsx       # JD input + template picker
│   │   │   ├── CVListPage.jsx         # History of generated CVs
│   │   │   ├── CVViewPage.jsx         # Preview + download + chat panel
│   │   │   └── NotFoundPage.jsx
│   │   │
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
│   │   │   │   ├── TemplateCard.jsx   # Template preview thumbnail
│   │   │   │   ├── CVCard.jsx         # CV history list item
│   │   │   │   └── CVPreviewFrame.jsx # CV HTML rendered in iframe
│   │   │   ├── chat/
│   │   │   │   ├── ChatPanel.jsx      # AI editing sidebar
│   │   │   │   └── ChatMessage.jsx
│   │   │   └── common/
│   │   │       ├── Button.jsx
│   │   │       ├── Input.jsx
│   │   │       ├── Modal.jsx
│   │   │       └── LoadingSpinner.jsx
│   │   │
│   │   ├── hooks/
│   │   │   ├── useAuth.js
│   │   │   ├── useProfile.js
│   │   │   └── useCV.js
│   │   │
│   │   ├── utils/
│   │   │   ├── formatters.js
│   │   │   └── validators.js
│   │   │
│   │   ├── App.jsx                    # Router setup, AuthGuard
│   │   └── main.jsx
│   │
│   ├── nginx.conf                     # SPA fallback + /api/ proxy to backend
│   ├── Dockerfile
│   └── package.json
│
├── .github/
│   └── workflows/
│       └── deploy.yml                 # CI/CD — test → build → push → deploy
│
├── docker-compose.yml
├── .env.example
└── .gitignore
```

---

## Getting Started

The only prerequisite is [Docker Desktop](https://www.docker.com/products/docker-desktop/). Everything else runs inside containers.

### 1. Clone the repository

```bash
git clone https://github.com/mhwaheed21-web/CV-Maker.git
cd CV-Maker
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

The first run takes 3–5 minutes while base images download and dependencies install. Subsequent starts are much faster.

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
| `http://localhost:8000/docs` | FastAPI interactive API docs (Swagger UI) |
| `http://localhost:8000` | API health check — returns `{"status": "ok"}` |

---

## Environment Variables

Copy `.env.example` to `.env` and fill in your values:

```bash
# Database
DB_USER=cvmaker_user
DB_PASSWORD=your_strong_password_here

# Backend
SECRET_KEY=your_jwt_secret_key_here
OPENAI_API_KEY=sk-...
```

> `.env` is git-ignored. **Never commit secrets to the repository.**

| Variable | Description |
|---|---|
| `DB_USER` | PostgreSQL username |
| `DB_PASSWORD` | PostgreSQL password |
| `SECRET_KEY` | JWT signing secret — any long random string |
| `OPENAI_API_KEY` | OpenAI API key from [platform.openai.com](https://platform.openai.com) |

---

## API Reference

All endpoints are prefixed with `/api/v1/`. Protected routes require the `Authorization: Bearer <access_token>` header.

### Auth — `/api/v1/auth`

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/register` | Create account, returns JWT pair | No |
| `POST` | `/login` | Email + password → access + refresh tokens | No |
| `POST` | `/refresh` | Exchange refresh token for new access token | No |
| `POST` | `/logout` | Invalidate refresh token | Yes |
| `GET` | `/me` | Get current user info | Yes |

### Profile — `/api/v1/profile`

All profile endpoints require authentication. Data is always scoped to the current user.

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/` | Fetch entire profile (all sections in one response) |
| `PUT` | `/personal` | Update personal info and professional summary |
| `GET` | `/experience` | List work experience entries |
| `POST` | `/experience` | Add a new work experience entry |
| `PUT` | `/experience/{id}` | Update a specific entry |
| `DELETE` | `/experience/{id}` | Remove an entry |
| `GET` | `/education` | List education records |
| `POST` | `/education` | Add an education record |
| `PUT` | `/education/{id}` | Update an education record |
| `DELETE` | `/education/{id}` | Remove an education record |
| `GET` | `/skills` | List skills |
| `POST` | `/skills` | Bulk upsert skills list |
| `GET` | `/projects` | List projects |
| `POST` | `/projects` | Add a project |
| `PUT` | `/projects/{id}` | Update a project |
| `DELETE` | `/projects/{id}` | Remove a project |
| `GET` | `/certifications` | List certifications |
| `POST` | `/certifications` | Add a certification |
| `PUT` | `/certifications/{id}` | Update a certification |
| `DELETE` | `/certifications/{id}` | Remove a certification |

### CVs — `/api/v1/cvs`

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/generate` | Submit job description + template → triggers AI pipeline, returns `{cv_id, status}` immediately |
| `GET` | `/` | List all generated CVs for current user |
| `GET` | `/{id}` | Fetch full CV content and metadata |
| `GET` | `/{id}/status` | Poll generation status: `pending / generating / complete / failed` |
| `GET` | `/{id}/download` | Stream PDF bytes with `Content-Disposition` header |
| `POST` | `/{id}/regenerate` | Re-run pipeline with new or same job description |
| `DELETE` | `/{id}` | Delete CV and its chat history |

> **Note on async generation:** `POST /cvs/generate` returns immediately with a `cv_id`. The frontend polls `GET /cvs/{id}/status` every 2 seconds to avoid HTTP timeout issues on long AI calls.

### AI Chat Editing — `/api/v1/cvs/{id}/chat`

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/messages` | Load full chat history for this CV |
| `POST` | `/send` | Send an edit instruction → returns updated `cv_content` + AI confirmation |

### Templates — `/api/v1/templates`

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/` | List all available templates with preview metadata |

---

## Database Schema

```
users
  id (UUID, PK), email (unique), hashed_password, full_name, created_at, updated_at

profiles                          — 1:1 with users
  user_id (FK), phone, location, linkedin_url, portfolio_url,
  professional_summary, updated_at

work_experiences                  — 1:many with users
  user_id (FK), job_title, company_name, start_date, end_date,
  is_current (BOOL), responsibilities (JSONB), display_order

educations                        — 1:many with users
  user_id (FK), degree, institution, graduation_year, gpa, display_order

skills                            — 1:many with users
  user_id (FK), name, category, proficiency

projects                          — 1:many with users
  user_id (FK), name, description, technologies (JSONB), url, display_order

certifications                    — 1:many with users
  user_id (FK), name, issuer, issue_date, expiry_date

generated_cvs                     — 1:many with users
  user_id (FK), title, job_description (TEXT), template_id,
  cv_content (JSONB), status (pending/generating/complete/failed), created_at

chat_messages                     — 1:many with generated_cvs
  cv_id (FK), role (user/assistant), content (TEXT), created_at
```

**Key design decisions:**

- `responsibilities` and `technologies` are stored as JSONB arrays — they are always read and written with their parent record, so no join table is needed at MVP scale.
- `cv_content` on `generated_cvs` stores the entire structured CV JSON, enabling re-rendering across different templates and chat editing without re-querying all profile tables.
- `display_order` integers on experience, projects, and education allow the AI chat to reorder sections by updating a single integer field.
- `status` lifecycle: `pending → generating → complete → failed`

---

## CV Generation Pipeline

```
POST /cvs/generate (returns immediately with cv_id)
│
├─ 1. Auth check         — verify JWT, extract user_id
├─ 2. Validate request   — JD text present, template_id valid
├─ 3. Create DB record   — GENERATED_CVS row, status = "pending"
├─ 4. Return to client   — { cv_id, status: "pending" }
│
└─ Background task (FastAPI BackgroundTasks):
   │
   ├─ 5. Fetch profile    — load all user data from all profile tables
   ├─ 6. Build prompt     — prompt_builder.py assembles JD + profile JSON
   ├─ 7. Call OpenAI      — GPT-4o, JSON mode, structured CV schema
   ├─ 8. Parse + validate — cv_parser.py + Pydantic schema validation
   ├─ 9. Save cv_content  — persist JSON to DB, set status = "generating"
   ├─ 10. Render HTML     — Jinja2 template + cv_content injected
   ├─ 11. Generate PDF    — WeasyPrint renders HTML → PDF bytes
   ├─ 12. Store PDF       — set status = "complete"
   └─ 13. Error handling  — on any failure, set status = "failed", log error
```

### AI Output Schema

Both generation and editing produce this JSON structure:

```json
{
  "summary": "Professional summary text...",
  "sections": [
    {
      "type": "experience",
      "title": "Work Experience",
      "display_order": 1,
      "items": [
        {
          "heading": "Senior Software Engineer — Acme Corp",
          "subheading": "Jan 2021 – Present",
          "bullets": [
            "Led migration of monolith to microservices, reducing deploy time by 40%",
            "Mentored team of 4 junior engineers"
          ]
        }
      ]
    },
    {
      "type": "skills",
      "title": "Technical Skills",
      "display_order": 2,
      "items": [
        { "heading": "Languages", "bullets": ["Python", "TypeScript", "SQL"] }
      ]
    }
  ]
}
```

### Frontend Polling

```
1. User submits JD → POST /cvs/generate → receives { cv_id }
2. Frontend polls  GET /cvs/{cv_id}/status every 2 seconds
3. When status == "complete" → fetch GET /cvs/{cv_id} for full content
4. When status == "failed"   → show error with retry option
```

---

## CV Templates

All templates are Jinja2 HTML files with print-optimised CSS. They all consume the same `cv_content` JSON structure, so switching templates never requires re-generating the AI content.

| Template ID | Style |
|---|---|
| `minimal` | Clean white background, simple typography, single column |
| `modern` | Accent colour sidebar, two-column layout |
| `technical` | Monospace accents, compact, skills-first layout |
| `creative` | Bold header, subtle colour accents, slightly more visual |
| `executive` | Formal, wide margins, achievement-driven, conservative |

All templates include `@media print` CSS with `@page { size: A4; margin: 15mm; }` and `page-break-inside: avoid` on sections.

---

## AI Safety & Hallucination Prevention

CV accuracy is a core product requirement. The system prompt for both generation and editing enforces strict rules:

**Generation system prompt:**
```
You are an expert CV writer and ATS optimization specialist.

RULES — follow without exception:
1. Only use information explicitly provided in the user's profile data.
   Do NOT invent, embellish, or add any experience, skills, companies,
   dates, or qualifications not present in the input.
2. Rewrite and rephrase the user's own content to be more professional,
   impactful, and keyword-aligned with the job description.
3. Select and prioritize sections/content most relevant to the job description.
4. Use strong action verbs. Quantify achievements where data supports it.
5. Return ONLY valid JSON matching the schema. No prose outside JSON.
```

**Chat editing system prompt:**
```
RULES:
1. Apply ONLY the requested change. Do not alter unrelated sections.
2. Do NOT add any information not already present in the CV.
3. Return the complete updated cv_content JSON.
4. Also return a brief natural-language confirmation of what you changed.
```

After every AI call, `cv_parser.py` validates the response against a Pydantic schema before any data is saved.

---

## Authentication Flow

```
Register / Login  →  access_token (30 min) + refresh_token (7 days)
Every request     →  Authorization: Bearer {access_token}
Token expires     →  Axios interceptor calls POST /auth/refresh automatically
Refresh fails     →  User is redirected to /login
Logout            →  Refresh token invalidated on server
```

- Passwords are hashed with **bcrypt** and never stored in plain text
- JWTs are signed with `SECRET_KEY` and cannot be forged without it
- The Axios client in `src/api/client.js` handles token attachment and silent refresh transparently — all API functions work the same whether the token is fresh or has just been refreshed

---

## Development Workflow

```bash
# Start all containers
docker compose up

# Stop containers (data is preserved in Docker volume)
Ctrl+C

# Wipe everything including the database volume
docker compose down -v
```

### Rebuilding after changes

```bash
# Backend Python files — Uvicorn auto-reloads (no rebuild needed)

# After changing frontend source files
docker compose up --build frontend

# After changing requirements.txt or package.json
docker compose up --build backend
docker compose up --build frontend
```

### Running database migrations

```bash
# After adding or modifying an ORM model
docker exec -it cv-maker-backend-1 bash
alembic revision --autogenerate -m "describe your change"
alembic upgrade head
exit
```

### Adding a new database table

1. Add the model class to `backend/app/models/`
2. Import it in `backend/app/models/__init__.py`
3. Import it in `backend/app/db/migrations/env.py` so Alembic detects it
4. Run the migration commands above

### Inspecting the database directly

```bash
docker exec -it cv-maker-db-1 psql -U cvmaker_user -d cvmaker
\dt        # list all tables
\d users   # describe a specific table
\q         # exit
```

For a GUI client (TablePlus, DBeaver, etc.): temporarily add `ports: ["5432:5432"]` to the `db` service in `docker-compose.yml`, connect on `localhost:5432`, then remove the port mapping before deploying.

---

## Testing

Tests live in `backend/tests/` and use `pytest`.

```bash
# Run all tests
docker exec -it cv-maker-backend-1 bash
pytest tests/ -v
```

### Test coverage

**`test_auth.py`**
- Register a new user → receives JWT
- Login with correct credentials → receives JWT
- Login with wrong password → 401
- Access protected route without token → 401
- Token refresh → new access token returned

**`test_profile.py`**
- Create a work experience entry
- GET profile returns all sections
- Update an experience entry
- Delete an experience entry
- User A cannot access or modify user B's profile data

**`test_cv_generation.py`**
- Prompt builder serialises profile data correctly
- `cv_parser` validates AI output schema
- Background task sets `status=complete` on success
- Background task sets `status=failed` on OpenAI error (mocked)

**`test_chat.py`**
- Chat send updates `cv_content` in the database
- Chat history is persisted across requests
- Chat messages are rejected if they try to introduce hallucinated content

---

## Deployment (Azure)

### Azure Resource Map

```
Resource Group: cvmaker-rg
│
├── Azure Container Registry (ACR)     — stores backend + frontend Docker images
├── Azure Container Apps Environment   — cvmaker-env
│   ├── Container App: cvmaker-backend (internal ingress)
│   └── Container App: cvmaker-frontend (external ingress, public URL)
├── Azure Database for PostgreSQL      — Flexible Server, managed production DB
├── Azure Key Vault                    — stores OPENAI_API_KEY, SECRET_KEY, DB password
└── Azure Log Analytics Workspace      — centralised container logs
```

### Step 1 — Provision Azure Resources (one-time)

```bash
az login
az account set --subscription "your-subscription-id"

# Resource group
az group create --name cvmaker-rg --location eastus

# Container Registry
az acr create --resource-group cvmaker-rg \
  --name cvmakeracr --sku Basic --admin-enabled true

# PostgreSQL Flexible Server
az postgres flexible-server create \
  --resource-group cvmaker-rg \
  --name cvmaker-db \
  --admin-user cvmaker_user \
  --admin-password "YourStrongPassword!" \
  --sku-name Standard_B1ms \
  --tier Burstable

# Key Vault + secrets
az keyvault create --name cvmaker-kv --resource-group cvmaker-rg
az keyvault secret set --vault-name cvmaker-kv --name "openai-api-key" --value "sk-..."
az keyvault secret set --vault-name cvmaker-kv --name "secret-key" --value "your-jwt-secret"

# Log Analytics Workspace
az monitor log-analytics workspace create \
  --resource-group cvmaker-rg --workspace-name cvmaker-logs

# Container Apps Environment
az containerapp env create \
  --name cvmaker-env \
  --resource-group cvmaker-rg \
  --location eastus \
  --logs-workspace-id $(az monitor log-analytics workspace show \
      --resource-group cvmaker-rg --workspace-name cvmaker-logs \
      --query customerId -o tsv)

# Container Apps (placeholder image — CI/CD will update these)
az containerapp create \
  --name cvmaker-backend \
  --resource-group cvmaker-rg \
  --environment cvmaker-env \
  --image mcr.microsoft.com/azuredocs/containerapps-helloworld \
  --target-port 8000 \
  --ingress internal

az containerapp create \
  --name cvmaker-frontend \
  --resource-group cvmaker-rg \
  --environment cvmaker-env \
  --image mcr.microsoft.com/azuredocs/containerapps-helloworld \
  --target-port 80 \
  --ingress external
```

### Step 2 — Configure GitHub Secrets

Go to **GitHub repo → Settings → Secrets and variables → Actions → New repository secret**

| Secret Name | Value |
|---|---|
| `AZURE_CREDENTIALS` | JSON output of `az ad sp create-for-rbac` (see below) |
| `ACR_NAME` | `cvmakeracr` |
| `ACR_LOGIN_SERVER` | `cvmakeracr.azurecr.io` |
| `OPENAI_API_KEY` | Your OpenAI key |
| `SECRET_KEY` | Your JWT secret |

```bash
# Generate AZURE_CREDENTIALS
az ad sp create-for-rbac \
  --name "cvmaker-github-actions" \
  --role contributor \
  --scopes /subscriptions/{subscription-id}/resourceGroups/cvmaker-rg \
  --sdk-auth
# Copy the entire JSON output → paste as the AZURE_CREDENTIALS secret
```

### Step 3 — Run Database Migrations in Production

Migrations run as a one-off Container Apps Job — not at app startup — to avoid race conditions when multiple replicas start simultaneously:

```bash
az containerapp job create \
  --name cvmaker-migrate \
  --resource-group cvmaker-rg \
  --environment cvmaker-env \
  --image cvmakeracr.azurecr.io/backend:latest \
  --replica-timeout 300 \
  --replica-retry-limit 1 \
  --trigger-type Manual \
  --command "alembic upgrade head"

az containerapp job start \
  --name cvmaker-migrate \
  --resource-group cvmaker-rg
```

### Step 4 — Inject Production Environment Variables

All secrets are pulled from Key Vault via managed identity — no secrets in code or container images:

```bash
az containerapp update \
  --name cvmaker-backend \
  --resource-group cvmaker-rg \
  --set-env-vars \
    OPENAI_API_KEY=secretref:openai-api-key \
    SECRET_KEY=secretref:secret-key \
    DATABASE_URL="postgresql+asyncpg://cvmaker_user:YourPassword@cvmaker-db.postgres.database.azure.com:5432/cvmaker" \
    ENVIRONMENT=production
```

---

## CI/CD Pipeline

Every push to `main` triggers `.github/workflows/deploy.yml`:

```
push to main
    │
    ├─ Job 1: test
    │   ├─ Set up Python 3.12
    │   ├─ pip install -r requirements.txt
    │   └─ pytest tests/ -v --tb=short
    │
    └─ Job 2: build-and-deploy (only if tests pass, only on main)
        ├─ Azure login
        ├─ Login to ACR
        ├─ Build + push backend image (tagged with git SHA + latest)
        ├─ Build + push frontend image (tagged with git SHA + latest)
        ├─ az containerapp update → backend (deploy SHA-tagged image)
        └─ az containerapp update → frontend (deploy SHA-tagged image)
```

Pull requests trigger `Job 1` (tests) only — no deployment.

The entire pipeline from push to live URL takes approximately 5 minutes.

---

## Design Decisions

| Area | Decision | Reason |
|---|---|---|
| Auth | JWT access + refresh tokens, bcrypt | Stateless, straightforward, well-supported |
| AI model | GPT-4o, JSON mode | Best output quality, structured and parseable |
| AI safety | Strict no-hallucination system prompt | CV content must be factual — core product requirement |
| PDF engine | WeasyPrint (Python-native) | No headless browser needed, easy to containerise |
| CV storage | JSONB column (`cv_content`) | Fast re-render across templates, editable without re-calling AI |
| Background jobs | FastAPI `BackgroundTasks` | Sufficient for MVP, no extra infrastructure or queue service |
| Frontend state | Zustand | Lightweight, simple API, no Redux boilerplate |
| Container orchestration | Docker Compose (dev) / Azure Container Apps (prod) | Simple, cost-effective for small-to-medium scale |
| Secrets management | Azure Key Vault via managed identity | No secrets in code, images, or environment files |
| Templates | Jinja2 HTML + print CSS | Easy to maintain, ATS-friendly plain HTML output |

---

## Upgrade Path

When the app is stable and ready to scale beyond MVP:

- Replace `BackgroundTasks` → **Celery + Redis** for reliable async job queuing with retries
- Add **Redis cache** layer for profile data and rendered templates
- Add **rate limiting** middleware per user on AI generation endpoints
- Add **WebSockets** to replace polling on CV generation status
- Split PDF engine into its own container if PDF rendering becomes a bottleneck
- Add **Blob Storage** (Azure) for PDF files rather than DB storage

---

*FastAPI · React · PostgreSQL · GPT-4o · WeasyPrint · Docker · Azure Container Apps*
