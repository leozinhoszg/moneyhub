from datetime import date
from io import BytesIO, StringIO
import csv
from fastapi import APIRouter, Depends, Response
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, get_db
from app.crud.share import get_effective_user_ids
from app.crud.transaction import list_transactions
from app.models.user import User


router = APIRouter()


@router.get("/reports/transactions.csv")
def export_transactions_csv(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    start_date: date | None = None,
    end_date: date | None = None,
):
    user_ids = get_effective_user_ids(db, current_user.id)
    txs = list_transactions(db, user_ids, start_date=start_date, end_date=end_date, page=1, page_size=100000)
    output = StringIO()
    writer = csv.writer(output)
    writer.writerow(["id", "tipo", "valor", "data", "descricao", "categoria_id", "conta_bancaria_id", "cartao_credito_id"])
    for t in txs:
        writer.writerow([
            t.id,
            t.tipo,
            f"{t.valor:.2f}",
            t.data_transacao.isoformat(),
            (t.descricao or "").replace("\n", " ").replace("\r", " "),
            t.categoria_id,
            t.conta_bancaria_id or "",
            t.cartao_credito_id or "",
        ])
    csv_bytes = output.getvalue().encode("utf-8-sig")
    headers = {"Content-Disposition": "attachment; filename=transacoes.csv"}
    return Response(content=csv_bytes, media_type="text/csv", headers=headers)


@router.get("/reports/transactions.pdf")
def export_transactions_pdf(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    start_date: date | None = None,
    end_date: date | None = None,
):
    from reportlab.lib.pagesizes import A4
    from reportlab.pdfgen import canvas

    user_ids = get_effective_user_ids(db, current_user.id)
    txs = list_transactions(db, user_ids, start_date=start_date, end_date=end_date, page=1, page_size=5000)

    buffer = BytesIO()
    c = canvas.Canvas(buffer, pagesize=A4)
    width, height = A4
    y = height - 50
    c.setFont("Helvetica-Bold", 14)
    c.drawString(50, y, "Relatório de Transações")
    y -= 30
    c.setFont("Helvetica", 10)
    for t in txs:
        line = f"{t.data_transacao.isoformat()} - {t.tipo} - R$ {t.valor:.2f} - {t.descricao or ''}"
        c.drawString(50, y, line)
        y -= 14
        if y < 50:
            c.showPage()
            y = height - 50
            c.setFont("Helvetica", 10)
    c.save()
    pdf_bytes = buffer.getvalue()
    headers = {"Content-Disposition": "attachment; filename=transacoes.pdf"}
    return Response(content=pdf_bytes, media_type="application/pdf", headers=headers)


