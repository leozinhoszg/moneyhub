from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import get_settings
from app.api.routes.auth import router as auth_router
from app.api.routes.users import router as users_router
from app.api.routes.accounts import router as accounts_router
from app.api.routes.cards import router as cards_router
from app.api.routes.categories import router as categories_router
from app.api.routes.transactions import router as transactions_router
from app.api.routes.dashboard import router as dashboard_router
from app.api.routes.fixed_expenses import router as fixed_expenses_router
from app.api.routes.shares import router as shares_router
from app.api.routes.reports import router as reports_router
from app.api.routes.uploads import router as uploads_router
from app.services.scheduler import start_scheduler, stop_scheduler
from app.db.session import engine
from app.db import base  # noqa: F401


settings = get_settings()

app = FastAPI(title="MoneyHub - Backend")


# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health_check():
    return {"status": "ok"}


# Routers
app.include_router(auth_router, prefix="/api", tags=["auth"]) 
app.include_router(users_router, prefix="/api", tags=["users"]) 
app.include_router(accounts_router, prefix="/api", tags=["accounts"]) 
app.include_router(cards_router, prefix="/api", tags=["cards"]) 
app.include_router(categories_router, prefix="/api", tags=["categories"]) 
app.include_router(transactions_router, prefix="/api", tags=["transactions"]) 
app.include_router(dashboard_router, prefix="/api", tags=["dashboard"]) 
app.include_router(fixed_expenses_router, prefix="/api", tags=["fixed_expenses"]) 
app.include_router(shares_router, prefix="/api", tags=["shares"]) 
app.include_router(reports_router, prefix="/api", tags=["reports"]) 
app.include_router(uploads_router, prefix="/api", tags=["uploads"]) 


@app.on_event("startup")
def on_startup():
    # Cria as tabelas no banco caso não existam (MVP; depois usar Alembic)
    base.Base.metadata.create_all(bind=engine)
    start_scheduler()


@app.on_event("shutdown")
def on_shutdown():
    stop_scheduler()


