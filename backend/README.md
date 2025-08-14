# Backend - MoneyHub

## Requisitos

- Python 3.11+
- MySQL 8 (ou Docker)

## Executando com Docker

```bash
cp backend/.env.example backend/.env
docker-compose up --build
```

A API estará em `http://localhost:8000`.

## Executando localmente (sem Docker)

```bash
python -m venv .venv && . .venv/bin/activate  # Windows: .venv\\Scripts\\activate
pip install -r backend/requirements.txt
cp backend/.env.example backend/.env
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

## Rotas iniciais

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/logout` (envie header `x-csrf-token` com valor do cookie `XSRF-TOKEN`)
- `GET /api/users/me`
