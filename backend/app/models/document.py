from datetime import datetime

from sqlalchemy import DateTime, Enum as SAEnum, ForeignKey, String, func
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base_class import Base


class TipoDocumento(str):
    COMPROVANTE = "Comprovante"
    EXTRATO = "Extrato"
    CONTRACHEQUE = "Contracheque"
    OUTRO = "Outro"


class Document(Base):
    __tablename__ = "DOCUMENTOS"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    usuario_id: Mapped[int] = mapped_column(ForeignKey("USUARIOS.id", ondelete="CASCADE"), index=True)
    transacao_id: Mapped[int | None] = mapped_column(ForeignKey("TRANSACOES.id", ondelete="SET NULL"), nullable=True)
    nome_arquivo: Mapped[str] = mapped_column(String(255), nullable=False)
    caminho_arquivo: Mapped[str] = mapped_column(String(255), nullable=False)
    tipo_documento: Mapped[str] = mapped_column(SAEnum(
        TipoDocumento.COMPROVANTE, TipoDocumento.EXTRATO, TipoDocumento.CONTRACHEQUE, TipoDocumento.OUTRO,
        name="tipo_documento"
    ), nullable=False)
    data_upload: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())


