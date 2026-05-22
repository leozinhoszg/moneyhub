import pytest
from sqlalchemy import create_engine, text

from app.core.config import get_settings
from app.db.bootstrap import ensure_database_exists


@pytest.fixture
def settings():
    return get_settings()


def _server_engine(settings):
    from urllib.parse import quote_plus
    pwd = quote_plus(settings.db_password)
    url = f"mysql+pymysql://{settings.db_user}:{pwd}@{settings.db_host}:{settings.db_port}/?charset=utf8mb4"
    return create_engine(url)


def test_ensure_database_creates_when_missing(settings):
    server = _server_engine(settings)
    test_db = "moneyhub_test_bootstrap"
    with server.connect() as conn:
        conn.execute(text(f"DROP DATABASE IF EXISTS {test_db}"))
        conn.commit()

    ensure_database_exists(
        host=settings.db_host,
        port=settings.db_port,
        user=settings.db_user,
        password=settings.db_password,
        db_name=test_db,
    )

    with server.connect() as conn:
        result = conn.execute(
            text("SELECT SCHEMA_NAME FROM information_schema.SCHEMATA WHERE SCHEMA_NAME = :n"),
            {"n": test_db},
        ).fetchone()
        assert result is not None
        conn.execute(text(f"DROP DATABASE {test_db}"))
        conn.commit()


def test_ensure_database_is_idempotent(settings):
    server = _server_engine(settings)
    test_db = "moneyhub_test_bootstrap"
    ensure_database_exists(
        host=settings.db_host, port=settings.db_port,
        user=settings.db_user, password=settings.db_password,
        db_name=test_db,
    )
    ensure_database_exists(
        host=settings.db_host, port=settings.db_port,
        user=settings.db_user, password=settings.db_password,
        db_name=test_db,
    )
    with server.connect() as conn:
        conn.execute(text(f"DROP DATABASE IF EXISTS {test_db}"))
        conn.commit()
