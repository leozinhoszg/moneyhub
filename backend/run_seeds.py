"""Executa os seeds SQL no banco configurado em .env.

- Categorias (001): só roda se a tabela estiver vazia (a migração 0011 já
  popula as categorias padrao com INSERT IGNORE; rodar de novo duplicaria).
- Subcategorias (002): sempre roda (usa INSERT IGNORE, idempotente).
- Bancos (003): só roda se a tabela `bancos` estiver vazia (INSERTs sem
  UNIQUE em COD; rodar de novo duplicaria).
- Logotipos (004): sempre roda (UPDATE por COD, idempotente).
"""
import pymysql
from pathlib import Path
from app.core.config import get_settings

s = get_settings()
SEEDS_DIR = Path(__file__).resolve().parent / "app" / "db" / "seeds"


def split_statements(sql: str):
    lines = [ln for ln in sql.splitlines() if not ln.strip().startswith("--")]
    return [st.strip() for st in "\n".join(lines).split(";") if st.strip()]


def run_file(cur, fname):
    # utf-8-sig descarta um eventual BOM no inicio do arquivo (o Set-Content do
    # PowerShell 5.1 grava BOM, que o MySQL rejeitaria como erro de sintaxe).
    statements = split_statements((SEEDS_DIR / fname).read_text(encoding="utf-8-sig"))
    for st in statements:
        cur.execute(st)
    print(f"OK {fname}: {len(statements)} statement(s)")


conn = pymysql.connect(
    host=s.db_host, port=s.db_port, user=s.db_user,
    password=s.db_password, database=s.db_name, charset="utf8mb4",
)
try:
    with conn.cursor() as cur:
        cur.execute("SELECT COUNT(*) FROM categorias")
        if cur.fetchone()[0] == 0:
            run_file(cur, "001_categorias.sql")
        else:
            print("categorias ja populadas (migracao 0011) - pulando 001")
        run_file(cur, "002_subcategorias.sql")
        cur.execute("SELECT COUNT(*) FROM bancos")
        if cur.fetchone()[0] == 0:
            run_file(cur, "003_bancos.sql")
        else:
            print("bancos ja populados - pulando 003")
        run_file(cur, "004_bancos_logotipo.sql")
        conn.commit()
        cur.execute("SELECT COUNT(*) FROM categorias")
        print("categorias:", cur.fetchone()[0])
        cur.execute("SELECT COUNT(*) FROM subcategorias")
        print("subcategorias:", cur.fetchone()[0])
        cur.execute("SELECT COUNT(*) FROM bancos")
        print("bancos:", cur.fetchone()[0])
        cur.execute("SELECT COUNT(*) FROM bancos WHERE logotipo IS NOT NULL")
        print("bancos com logotipo:", cur.fetchone()[0])
finally:
    conn.close()
