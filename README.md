# CV Maker — AI-Powered CV Generator

A full-stack web application that generates professionally tailored CVs using GPT-4o. Users store their complete professional profile once, then generate customized CVs for any job description in seconds.

---

## Project Status

| Phase | Description | Status |
|---|---|---|
| Phase 0 | Environment setup — Docker, scaffold | ✅ Complete |
| Phase 1 | Auth & user accounts — JWT, register, login | ✅ Complete |
| Phase 2 | Profile data management — all CV sections CRUD | ✅ Complete |
| Phase 3 | AI CV generation — GPT-4o, PDF output | 🔄 In Progress |
| Phase 4 | Templates & AI chat editing | ⏳ Pending |
| Phase 5 | Polish, error handling, tests | ⏳ Pending |
| Phase 6 | Azure deployment, CI/CD | ⏳ Pending |

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React + Vite + React Router + Zustand |
| Backend | FastAPI (Python 3.12) |
| Database | PostgreSQL 16 |
| AI | OpenAI GPT-4o |
| PDF Engine | WeasyPrint |
| Auth | JWT (access + refresh tokens) + bcrypt |
| Containerization | Docker + Docker Compose |
| Deployment | Azure Container Apps (Phase 6) |

---

## Prerequisites

You only need **one thing** installed on your machine:

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) — everything else runs inside containers

---

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/your-username/cv-maker.git
cd cv-maker
```

### 2. Create your environment file

```bash
cp .env.example .env
```

Open `.env` and fill in your values:

```bash
DB_USER=cvmaker_user
DB_PASSWORD=your_strong_password_here
DB_NAME=cvmaker
SECRET_KEY=your_jwt_secret_key_here
OPENAI_API_KEY=sk-...
```

### 3. Start the application

```bash
docker compose up --build
```

First run takes 3–5 minutes (downloading base images and installing packages). Subsequent runs are much faster.

### 4. Run database migrations

In a second terminal:

```bash
docker exec -it cv-maker-backend-1 bash
alembic upgrade head
exit
```

### 5. Open the app

| URL | Description |
|---|---|
| http://localhost | React frontend |
| http://localhost:8000/docs | FastAPI interactive API docs |
| http://localhost:8000 | API health check |

---

## Environment Variables

| Variable | Description | Example |
|---|---|---|
| `DB_USER` | PostgreSQL username | `cvmaker_user` |
| `DB_PASSWORD` | PostgreSQL password | `strongpassword123` |
| `DB_NAME` | PostgreSQL database name | `cvmaker` |
| `SECRET_KEY` | JWT signing secret (any random string) | `supersecretkey` |
| `OPENAI_API_KEY` | OpenAI API key for CV generation | `sk-...` |

---

## Project Structure

```
cv-maker/
├── backend/
│   ├── app/
│   │   ├── api/v1/
│   │   │   ├── auth.py          # Register, login, refresh, me endpoints
│   │   │   └── profile.py       # All profile CRUD endpoints (18 total)
│   │   ├── core/
│   │   │   └── security.py      # bcrypt hashing + JWT creation/decode
│   │   ├── db/
│   │   │   ├── base.py          # SQLAlchemy declarative base
│   │   │   └── session.py       # Async DB engine + get_db dependency
│   │   ├── models/
│   │   │   ├── user.py          # Users table
│   │   │   └── profile.py       # Profile, WorkExperience, Education,
│   │   │                        # Skill, Project, Certification tables
│   │   ├── schemas/
│   │   │   ├── auth.py          # Request/response shapes for auth
│   │   │   └── profile.py       # Request/response shapes for profile
│   │   ├── services/
│   │   │   └── profile_service.py  # All profile business logic
│   │   ├── config.py            # Settings from environment variables
│   │   ├── dependencies.py      # get_current_user JWT middleware
│   │   └── main.py              # FastAPI app, router registration
│   ├── migrations/              # Alembic migration files
│   ├── alembic.ini              # Alembic configuration
│   ├── requirements.txt         # Python dependencies
│   └── Dockerfile               # Backend container build instructions
│
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   │   ├── client.js        # Axios instance + JWT interceptors
│   │   │   ├── auth.js          # Auth API functions
│   │   │   └── profile.js       # Profile API functions
│   │   ├── store/
│   │   │   ├── authStore.js     # Global auth state (Zustand)
│   │   │   └── profileStore.js  # Global profile state (Zustand)
│   │   ├── pages/
│   │   │   ├── LoginPage.jsx
│   │   │   ├── RegisterPage.jsx
│   │   │   ├── DashboardPage.jsx
│   │   │   └── ProfilePage.jsx
│   │   ├── components/profile/
│   │   │   ├── PersonalInfoForm.jsx
│   │   │   ├── WorkExperienceForm.jsx
│   │   │   ├── EducationForm.jsx
│   │   │   ├── SkillsForm.jsx
│   │   │   ├── ProjectsForm.jsx
│   │   │   └── CertificationsForm.jsx
│   │   ├── App.jsx              # Router, AuthGuard, session restore
│   │   └── main.jsx             # React entry point
│   ├── nginx.conf               # Serve SPA + proxy /api/ to backend
│   ├── Dockerfile               # Frontend container build instructions
│   └── package.json             # JavaScript dependencies
│
├── docker-compose.yml           # Multi-service orchestration
├── .env                         # Your secrets (never committed)
├── .env.example                 # Template for secrets
└── .gitignore                   # Ignores .env, node_modules, etc.
```

---

## API Endpoints

### Auth — `/api/v1/auth`

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| POST | `/register` | Create account, returns JWT pair | No |
| POST | `/login` | Login, returns JWT pair | No |
| POST | `/refresh` | Get new access token | No |
| GET | `/me` | Get current user info | Yes |

### Profile — `/api/v1/profile`

| Method | Endpoint | Description |
|---|---|---|
| GET | `/` | Get entire profile (all sections) |
| PUT | `/personal` | Update personal info + summary |
| GET/POST | `/experience` | List or add work experience |
| PUT/DELETE | `/experience/{id}` | Update or delete an entry |
| GET/POST | `/education` | List or add education |
| PUT/DELETE | `/education/{id}` | Update or delete an entry |
| GET/POST | `/skills` | List or bulk upsert skills |
| GET/POST | `/projects` | List or add project |
| PUT/DELETE | `/projects/{id}` | Update or delete a project |
| GET/POST | `/certifications` | List or add certification |
| PUT/DELETE | `/certifications/{id}` | Update or delete a certification |

All profile endpoints require a valid Bearer JWT token.

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
```

---

## Daily Development Workflow

```bash
# Start Docker Desktop first, wait for "Engine running"

# Navigate to project
cd "D:\WORK-windows\Personal Project\cv-maker"

# Start all containers
docker compose up

# Stop containers (data is preserved)
Ctrl+C

# Wipe everything including database
docker compose down -v
```

### Rebuilding after code changes

```bash
# Backend code changes — auto-reloads via Uvicorn watchfiles
# (no rebuild needed for backend Python files)

# Frontend code changes — requires rebuild
docker compose up --build frontend

# Dependency changes (requirements.txt or package.json)
docker compose up --build backend   # or frontend
```

### Database migrations

```bash
# After adding a new model
docker exec -it cv-maker-backend-1 bash
alembic revision --autogenerate -m "describe your change"
alembic upgrade head
exit
```

---

## How to Add a New Database Table

1. Add the model class to `backend/app/models/profile.py`
2. Import it in `backend/app/models/__init__.py`
3. Import it in `backend/migrations/env.py`
4. Run migrations:
```bash
docker exec -it cv-maker-backend-1 bash
alembic revision --autogenerate -m "add your_table table"
alembic upgrade head
exit
```

---

## Viewing the Database

### Option 1 — Terminal (quick)
```bash
docker exec -it cv-maker-db-1 psql -U cvmaker_user -d cvmaker
\dt          # list all tables
\q           # exit
```

### Option 2 — pgAdmin or VSCode PostgreSQL extension

Add this to the `db` service in `docker-compose.yml` temporarily:
```yaml
ports:
  - "5432:5432"
```

Then connect with:
```
Host:     localhost
Port:     5432
Database: cvmaker
Username: cvmaker_user
Password: your_password
```

Remove the port mapping before deploying to production.

---

## Authentication Flow

```
Register/Login → receive access_token (30 min) + refresh_token (7 days)
Every request  → Authorization: Bearer {access_token}
Token expired  → client automatically calls /auth/refresh
Refresh fails  → user redirected to /login
```

Passwords are hashed with bcrypt — never stored in plain text.
JWTs are signed with SECRET_KEY — cannot be forged without the key.

---

## Sharing This Project

Anyone with Docker Desktop can run this project:

```bash
git clone https://github.com/your-username/cv-maker.git
cd cv-maker
cp .env.example .env
# Fill in .env with their own values
docker compose up --build
```

They need their own:
- Database password (any string)
- Secret key (any random string)
- OpenAI API key (from platform.openai.com)

---

## Contributing

This is a personal project. Not open for contributions at this time.

---

## License

Private — personal use only.
