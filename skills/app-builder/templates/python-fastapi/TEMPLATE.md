---
name: python-fastapi
description: FastAPI REST & AI service template (2026 Standards). Python 3.12+, uv, SQLAlchemy 2.0 async, Pydantic v2, pwdlib[argon2].
---

# Python FastAPI Template (2026 Edition)

## Tech Stack

| Component | Technology | Version / Notes |
|-----------|------------|-----------------|
| Language | Python | `3.12+` (`3.12` / `3.13`, strict type hints) |
| Package & Env Manager | `uv` | `pyproject.toml` + `uv.lock` (`uv init`, `uv add`, `uv run`) |
| Framework | FastAPI | Async OpenAPI 3.1 + dependency injection |
| Validation & Settings | Pydantic | `v2` + `pydantic-settings` |
| ORM & Driver | SQLAlchemy 2.0 | Async (`AsyncSession` + `asyncpg` / `aiosqlite`) |
| Migrations | Alembic | Async migration env |
| Auth & Hashing | PyJWT + `pwdlib[argon2]` | Argon2id via `pwdlib` (replaces unmaintained `passlib`, broken on Python 3.13+) |
| Quality & Tests | Ruff + Pytest | `ruff check`, `pytest`, `pytest-asyncio`, `httpx` |

---

## Directory Structure

```
project-name/
├── alembic/
│   ├── versions/
│   └── env.py               # Async SQLAlchemy migration runner
├── app/
│   ├── main.py              # FastAPI app factory, lifespan, RFC 9457 exception handlers
│   ├── config.py            # BaseSettings (.env loading & typed env validation)
│   ├── database.py          # AsyncEngine & AsyncSession dependency
│   ├── security.py          # pwdlib PasswordHash.recommended() (Argon2id) + PyJWT
│   ├── models/              # SQLAlchemy 2.0 Mapped[] models
│   ├── schemas/             # Pydantic v2 ConfigDict(extra="forbid") DTOs
│   ├── routers/             # Thin APIRouter endpoints
│   ├── services/            # Transactional domain logic
│   └── dependencies/        # Current-user & tenant RBAC guards
├── tests/
│   ├── conftest.py          # AsyncClient(transport=ASGITransport(app=app)) fixtures
│   └── test_health.py
├── .env.example
├── alembic.ini
├── pyproject.toml           # Managed by uv (no legacy requirements.txt)
└── uv.lock
```

---

## Password Hashing Pattern (`pwdlib[argon2]`)

Never use `passlib` (imports stdlib `crypt`, removed in Python 3.13). Use `pwdlib` with Argon2id:

```python
from pwdlib import PasswordHash

password_hash = PasswordHash.recommended()

def hash_password(plain: str) -> str:
    return password_hash.hash(plain)

def verify_password(plain: str, hashed: str) -> bool:
    return password_hash.verify(plain, hashed)
```

---

## Setup Steps (`uv` Workflow)

1. Initialize project with Python 3.12+:
   ```bash
   uv init {{name}} --python 3.12
   cd {{name}}
   ```

2. Add runtime dependencies:
   ```bash
   uv add "fastapi[standard]" "sqlalchemy[asyncio]" asyncpg alembic pydantic-settings pyjwt "pwdlib[argon2]"
   ```

3. Add development & test dependencies:
   ```bash
   uv add --dev pytest pytest-asyncio httpx ruff
   ```

4. Configure `.env` from `.env.example` and apply migrations:
   ```bash
   uv run alembic upgrade head
   ```

5. Run development server and tests:
   ```bash
   uv run fastapi dev app/main.py
   uv run pytest
   uv run ruff check .
   ```

---

## Best Practices (2026 Standards)

- **Manage dependencies exclusively via `uv`**: Commit `pyproject.toml` and `uv.lock`; run commands via `uv run` instead of global `pip install`.
- **Strict Input/Output Schemas**: Use `model_config = ConfigDict(extra="forbid")` on request models and explicit public response DTOs (never return ORM models directly).
- **Async Lifespan**: Manage DB pools and HTTP clients via FastAPI `lifespan` context manager (`@asynccontextmanager`), never deprecated `@app.on_event`.
- **Complete Type Annotations**: Annotate all parameters and return types on every `def` / `async def` so AST type-coverage and Ruff checks pass cleanly.
