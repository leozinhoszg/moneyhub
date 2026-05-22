"""Bootstrap de banco: cria DB, aplica migrações, popula seeds."""
from __future__ import annotations

import logging
import os
from pathlib import Path
from urllib.parse import quote_plus

from alembic import command
from alembic.config import Config
from sqlalchemy import create_engine, text

logger = logging.getLogger(__name__)

BACKEND_DIR = Path(__file__).resolve().parents[2]
ALEMBIC_INI = BACKEND_DIR / "alembic.ini"


def ensure_database_exists(host: str, port: int, user: str, password: str, db_name: str) -> None:
    """Cria o banco `db_name` se ainda não existir.

    Conecta ao servidor MySQL sem nome de DB e executa
    `CREATE DATABASE IF NOT EXISTS ...` com charset utf8mb4.
    """
    if not password:
        raise RuntimeError(
            "DB_PASSWORD vazio. Configure backend/.env (rode setup.py ou edite o arquivo)."
        )

    server_url = (
        f"mysql+pymysql://{user}:{quote_plus(password)}@{host}:{port}/?charset=utf8mb4"
    )
    engine = create_engine(server_url)
    try:
        with engine.connect() as conn:
            conn.execute(
                text(
                    f"CREATE DATABASE IF NOT EXISTS `{db_name}` "
                    "CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci"
                )
            )
            conn.commit()
        logger.info("Banco '%s' garantido em %s:%s", db_name, host, port)
    finally:
        engine.dispose()


def run_migrations(host: str, port: int, user: str, password: str, db_name: str) -> None:
    """Aplica `alembic upgrade head` programaticamente.

    Define DB_HOST/DB_PORT/DB_USER/DB_PASSWORD/DB_NAME no ambiente do processo
    pra que `backend/alembic/env.py` (que lê via os.getenv) use as mesmas
    credenciais do startup do app.
    """
    os.environ["DB_HOST"] = host
    os.environ["DB_PORT"] = str(port)
    os.environ["DB_USER"] = user
    os.environ["DB_PASSWORD"] = password
    os.environ["DB_NAME"] = db_name

    cfg = Config(str(ALEMBIC_INI))
    cfg.set_main_option("script_location", str(BACKEND_DIR / "alembic"))
    command.upgrade(cfg, "head")
    logger.info("Migrações aplicadas até head no banco '%s'", db_name)
