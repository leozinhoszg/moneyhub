from app.db.base_class import Base  # noqa: F401

# Importa modelos para que o metadata seja preenchido
from app.models.user import User  # noqa: F401
from app.models.account import BankAccount  # noqa: F401
from app.models.card import CreditCard  # noqa: F401
from app.models.category import Category  # noqa: F401
from app.models.transaction import Transaction  # noqa: F401
from app.models.fixed_expense import FixedExpense  # noqa: F401
from app.models.share import Share  # noqa: F401
from app.models.document import Document  # noqa: F401


