import pytest
from sqlalchemy import create_engine, text
from urllib.parse import quote_plus

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


from app.db.bootstrap import run_migrations


def test_run_migrations_applies_all(settings):
    server = _server_engine(settings)
    test_db = "moneyhub_test_migrations"
    with server.connect() as conn:
        conn.execute(text(f"DROP DATABASE IF EXISTS {test_db}"))
        conn.execute(text(f"CREATE DATABASE {test_db} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci"))
        conn.commit()

    run_migrations(
        host=settings.db_host, port=settings.db_port,
        user=settings.db_user, password=settings.db_password,
        db_name=test_db,
    )

    db_url = f"mysql+pymysql://{settings.db_user}:{quote_plus(settings.db_password)}@{settings.db_host}:{settings.db_port}/{test_db}"
    db_engine = create_engine(db_url)
    try:
        with db_engine.connect() as conn:
            tables = [r[0] for r in conn.execute(text("SHOW TABLES")).fetchall()]
            assert "alembic_version" in tables
            assert "usuarios" in tables
            assert "categorias" in tables
            assert "subcategorias" in tables
            assert "faturas_cartao" in tables
    finally:
        db_engine.dispose()
        with server.connect() as conn:
            conn.execute(text(f"DROP DATABASE {test_db}"))
            conn.commit()
