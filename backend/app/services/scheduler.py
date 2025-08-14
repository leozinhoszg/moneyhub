from datetime import date

from apscheduler.schedulers.background import BackgroundScheduler
from sqlalchemy.orm import Session

from app.crud.fixed_expense import run_fixed_expenses_for_date
from app.db.session import SessionLocal


_scheduler: BackgroundScheduler | None = None


def _job_run_fixed_expenses():
    db: Session = SessionLocal()
    try:
        # MVP: para todos os usuários cadastrados, executa; em produção, iterar de forma paginada
        # Para evitar dependência cruzada, consulta IDs diretamente via SQL simples
        users = db.execute("SELECT id FROM USUARIOS").fetchall()
        today = date.today()
        for (user_id,) in users:
            run_fixed_expenses_for_date(db, user_id, today)
    finally:
        db.close()


def start_scheduler():
    global _scheduler
    if _scheduler is not None:
        return
    _scheduler = BackgroundScheduler(timezone="UTC")
    # roda diariamente às 03:00 UTC
    _scheduler.add_job(_job_run_fixed_expenses, "cron", hour=3, minute=0)
    _scheduler.start()


def stop_scheduler():
    global _scheduler
    if _scheduler:
        _scheduler.shutdown()
        _scheduler = None


