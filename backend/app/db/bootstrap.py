"""Bootstrap de banco: cria DB, aplica migrações, popula seeds."""
from __future__ import annotations

import logging
from urllib.parse import quote_plus

from sqlalchemy import create_engine, text

logger = logging.getLogger(__name__)


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
