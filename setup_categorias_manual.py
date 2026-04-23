#!/usr/bin/env python3
"""
Script para configurar as categorias padrão no MoneyHub
Execute este script quando o banco de dados estiver disponível
"""

import sys
import os
sys.path.append('backend')

from backend.app.db.session import SessionLocal
from backend.app.models.category import Category

# Dados das categorias padrão
EXPENSE_CATEGORIES = [
    {'nome': 'Cartões', 'tipo': 'Despesa', 'cor': '#8b5cf6', 'icone': 'credit-card'},
    {'nome': 'Casa', 'tipo': 'Despesa', 'cor': '#06b6d4', 'icone': 'home'},
    {'nome': 'Educação', 'tipo': 'Despesa', 'cor': '#8b5cf6', 'icone': 'book'},
    {'nome': 'Eletrônicos', 'tipo': 'Despesa', 'cor': '#f59e0b', 'icone': 'device'},
    {'nome': 'Lazer', 'tipo': 'Despesa', 'cor': '#f97316', 'icone': 'game'},
    {'nome': 'Outros', 'tipo': 'Despesa', 'cor': '#6b7280', 'icone': 'dots'},
    {'nome': 'Restaurante', 'tipo': 'Despesa', 'cor': '#dc2626', 'icone': 'restaurant'},
    {'nome': 'Saúde', 'tipo': 'Despesa', 'cor': '#10b981', 'icone': 'health'},
    {'nome': 'Serviços', 'tipo': 'Despesa', 'cor': '#059669', 'icone': 'service'},
    {'nome': 'Supermercado', 'tipo': 'Despesa', 'cor': '#ef4444', 'icone': 'cart'},
    {'nome': 'Transporte', 'tipo': 'Despesa', 'cor': '#06b6d4', 'icone': 'car'},
    {'nome': 'Vestuário', 'tipo': 'Despesa', 'cor': '#06b6d4', 'icone': 'shirt'},
    {'nome': 'Viagem', 'tipo': 'Despesa', 'cor': '#06b6d4', 'icone': 'plane'}
]

INCOME_CATEGORIES = [
    {'nome': 'Investimentos', 'tipo': 'Receita', 'cor': '#10b981', 'icone': 'chart'},
    {'nome': 'Outros', 'tipo': 'Receita', 'cor': '#dc2626', 'icone': 'dots'},
    {'nome': 'Presente', 'tipo': 'Receita', 'cor': '#8b5cf6', 'icone': 'gift'},
    {'nome': 'Prêmios', 'tipo': 'Receita', 'cor': '#f59e0b', 'icone': 'award'},
    {'nome': 'Salário', 'tipo': 'Receita', 'cor': '#06b6d4', 'icone': 'money'}
]

def add_categories():
    """Adiciona as categorias padrão ao banco de dados"""
    db = SessionLocal()
    
    try:
        print("🔄 Conectando ao banco de dados...")
        
        # Verificar se a tabela existe
        result = db.execute("SHOW TABLES LIKE 'CATEGORIAS'")
        if not result.fetchone():
            print("❌ Tabela CATEGORIAS não encontrada!")
            return False
        
        # Verificar se a coluna 'cor' existe
        result = db.execute("SHOW COLUMNS FROM CATEGORIAS LIKE 'cor'")
        if not result.fetchone():
            print("⚠️  Coluna 'cor' não encontrada. Adicionando...")
            db.execute("ALTER TABLE CATEGORIAS ADD COLUMN cor VARCHAR(7) NULL")
            db.commit()
            print("✅ Coluna 'cor' adicionada com sucesso!")
        
        print("🔄 Adicionando categorias de despesas...")
        for cat_data in EXPENSE_CATEGORIES:
            # Verificar se já existe
            existing = db.query(Category).filter(
                Category.nome == cat_data['nome'], 
                Category.tipo == cat_data['tipo']
            ).first()
            
            if not existing:
                category = Category(**cat_data)
                db.add(category)
                print(f"  ✅ Adicionada: {cat_data['nome']} ({cat_data['tipo']})")
            else:
                print(f"  ⚠️  Já existe: {cat_data['nome']} ({cat_data['tipo']})")
        
        print("🔄 Adicionando categorias de receitas...")
        for cat_data in INCOME_CATEGORIES:
            # Verificar se já existe
            existing = db.query(Category).filter(
                Category.nome == cat_data['nome'], 
                Category.tipo == cat_data['tipo']
            ).first()
            
            if not existing:
                category = Category(**cat_data)
                db.add(category)
                print(f"  ✅ Adicionada: {cat_data['nome']} ({cat_data['tipo']})")
            else:
                print(f"  ⚠️  Já existe: {cat_data['nome']} ({cat_data['tipo']})")
        
        db.commit()
        print("🎉 Categorias adicionadas com sucesso!")
        
        # Mostrar estatísticas
        total_despesas = db.query(Category).filter(Category.tipo == 'Despesa').count()
        total_receitas = db.query(Category).filter(Category.tipo == 'Receita').count()
        print(f"📊 Total de categorias: {total_despesas} despesas + {total_receitas} receitas = {total_despesas + total_receitas}")
        
        return True
        
    except Exception as e:
        db.rollback()
        print(f"❌ Erro ao adicionar categorias: {e}")
        return False
    finally:
        db.close()

if __name__ == "__main__":
    print("🚀 Configurando categorias padrão do MoneyHub...")
    print("=" * 50)
    
    success = add_categories()
    
    if success:
        print("=" * 50)
        print("✅ Setup concluído com sucesso!")
        print("🎯 Agora você pode usar a página de categorias no frontend")
    else:
        print("=" * 50)
        print("❌ Setup falhou!")
        print("💡 Verifique se:")
        print("   - O banco de dados está rodando")
        print("   - As credenciais estão corretas")
        print("   - A tabela CATEGORIAS existe")

