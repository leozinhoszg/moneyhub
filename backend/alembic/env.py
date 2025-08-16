from __future__ import with_statement

from logging.config import fileConfig
import sys
import os
from pathlib import Path
from urllib.parse import quote_plus
from dotenv import load_dotenv

from alembic import context
from sqlalchemy import create_engine, pool

# Importar pymysql diretamente para forçar seu uso
import pymysql
pymysql.install_as_MySQLdb()

# (Opcional) Para futuras migrações autogeradas, podemos adicionar a raiz do backend ao PYTHONPATH
# ROOT_DIR = Path(__file__).resolve().parents[1]
# if str(ROOT_DIR) not in sys.path:
#     sys.path.insert(0, str(ROOT_DIR))


# this is the Alembic Config object, which provides
# access to the values within the .ini file in use.
config = context.config

# Interpret the config file for Python logging.
# This line sets up loggers basically.
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# Carregar variáveis de ambiente do arquivo .env na raiz do backend
BACKEND_DIR = Path(__file__).resolve().parents[1]
load_dotenv(dotenv_path=BACKEND_DIR / ".env", override=False)


def get_url() -> str:
    # 1) Tenta obter a URL do alembic.ini (com suporte a variáveis de ambiente)
    url_ini = config.get_main_option("sqlalchemy.url")
    if url_ini:
        expanded = os.path.expandvars(url_ini)
        if expanded:
            return expanded

    # 2) Tenta usar DATABASE_URL diretamente do ambiente
    url_env = os.getenv("DATABASE_URL")
    if url_env:
        return url_env

    # 3) Monta a URL a partir de variáveis individuais
    user = os.getenv("DB_USER", "root")
    password = os.getenv("DB_PASSWORD", "Jae66yrr@")  # default corrigido (sem '@' extra)
    host = os.getenv("DB_HOST", "127.0.0.1")
    port = os.getenv("DB_PORT", "3306")
    name = os.getenv("DB_NAME", "moneyhub")
    # Usar mysql+pymysql explicitamente
    return f"mysql+pymysql://{user}:{quote_plus(password)}@{host}:{port}/{name}"


# Para executar migrações baseadas em scripts, não precisamos do metadata.
# Se desejar autogeração futura, reative: target_metadata = Base.metadata
target_metadata = None


def run_migrations_offline() -> None:
    url = get_url()
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
        compare_type=True,
        compare_server_default=True,
    )

    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    connectable = create_engine(get_url(), poolclass=pool.NullPool)

    with connectable.connect() as connection:
        context.configure(
            connection=connection,
            target_metadata=target_metadata,
            compare_type=True,
            compare_server_default=True,
        )

        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()


