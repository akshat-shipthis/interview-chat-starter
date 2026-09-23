# Interview Chat — starter repo

A FastAPI + MongoDB backend and an Angular frontend with login already working.
The task is shared separately.

---

## 1. Setup

### Prerequisites

| Tool    | Version               | Check                          |
| ------- | --------------------- | ------------------------------ |
| MongoDB | 8.x, on port 27017    | the seed step below succeeds   |
| uv      | any recent            | `uv --version`                 |
| Node.js | 20.19+, 22.12+ or 24+ | `node --version`               |

You do not need to install Python yourself: `uv` downloads Python 3.14 on first sync.

**Install MongoDB** (skip if it is already running):

- macOS:
  ```bash
  brew tap mongodb/brew
  brew install mongodb-community
  brew services start mongodb-community
  ```
- Windows / Linux: follow https://www.mongodb.com/docs/manual/administration/install-community/ and
  start it as a service.

**Install uv** (skip if `uv --version` works):

```bash
curl -LsSf https://astral.sh/uv/install.sh | sh     # macOS / Linux, or: brew install uv
```

On Windows: `powershell -ExecutionPolicy ByPass -c "irm https://astral.sh/uv/install.ps1 | iex"`

### Backend — http://localhost:8000 (API docs at http://localhost:8000/docs)

```bash
cd backend
uv sync
cp .env.example .env
uv run python -m app.seed
uv run uvicorn run:app --reload --port 8000
```

In VS Code you can instead open the `backend` folder and run **Python : FastAPI (uvicorn)** from
the Run and Debug panel.

### Frontend — http://localhost:4200

In a second terminal:

```bash
cd frontend
npm install
npm start
```

Open http://localhost:4200 and sign in with any account below.

### Linting

- Backend: `uv run ruff check .`
- Frontend: `npm run lint`

---

## 2. Seeded logins

Every user's password is `password123`.

| Name       | Email             |
| ---------- | ----------------- |
| Aarti Rao  | aarti@example.com |
| Dev Menon  | dev@example.com   |
| Kiran Shah | kiran@example.com |
| Meera Iyer | meera@example.com |
| Rohit Nair | rohit@example.com |

`uv run python -m app.seed` resets the `users` collection. Anyone signed in will need to sign in again.

---

## 3. Signing in as two users

Each browser tab keeps its own session. Sign in as one user in a tab, then open a **new** tab
(not a duplicated one) and sign in as another.

---

## 4. API reference

Endpoints other than login expect `Authorization: Bearer <access_token>`.

A `User` looks like:

```json
{ "id": "6710c3e2a4b5f1d2e3c4b5a6", "name": "Aarti Rao", "email": "aarti@example.com", "initials": "AR" }
```

| Method | Path              | Body                  | Response                                        |
| ------ | ----------------- | --------------------- | ----------------------------------------------- |
| POST   | `/api/auth/login` | `{ email, password }` | `{ access_token, token_type, user }`, or 401    |
| GET    | `/api/auth/me`    |                       | the signed-in `User`                            |
| GET    | `/api/users`      |                       | `User[]`: every user except the caller, by name |

---

## 5. Where things live

```
backend/
  run.py                  uvicorn entry point (run:app)
  pyproject.toml, uv.lock dependencies, managed by uv
  app/
    main.py               app setup, CORS, routers
    config.py             settings loaded from .env
    db.py                 Mongo client
    auth/                 login, /me, password hashing, JWT
    users/                user model, service and router
    seed.py
frontend/src/
  environments/           apiUrl
  styles.css              design tokens and shared classes (.btn, .input, .card, .avatar, ...)
  app/
    app.routes.ts         /login, /chat, everything else redirects
    auth/                 AuthService, guard, interceptor
    users/                User model and UserService
    login/                login page
    chat/                 empty page
```

---

## 6. Troubleshooting

- **Seed or login hangs, then errors:** MongoDB is not running on `localhost:27017`. Start it
  (`brew services start mongodb-community` on macOS) or point `MONGO_URL` in `backend/.env` at it.
- **Port 8000 is taken:** run uvicorn with another `--port`, then update `apiUrl` in
  `frontend/src/environments/environment.ts` to match.
- **Port 4200 is taken:** run `npm start -- --port <port>` and set `FRONTEND_ORIGIN` in
  `backend/.env` to `http://localhost:<port>`.
