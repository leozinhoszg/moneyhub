#!/usr/bin/env python3
"""
Script para configurar as categorias padrão no banco 'financas'
Compatível com as configurações do docker-compose.yml
"""

import sys
import os
import pymysql
from urllib.parse import quote_plus

# Configurações do banco (compatível com docker-compose.yml)
DB_CONFIG = {
    'host': '127.0.0.1',
    'port': 3306,
    'user': 'app_user',
    'password': 'app_password',
    'database': 'financas',
    'charset': 'utf8mb4'
}

# Dados das categorias padrão (usuario_id = NULL para categorias globais)
EXPENSE_CATEGORIES = [
    {'nome': 'Cartões', 'tipo': 'Despesa', 'cor': '#8b5cf6', 'icone': 'credit-card', 'usuario_id': None},
    {'nome': 'Casa', 'tipo': 'Despesa', 'cor': '#06b6d4', 'icone': 'home', 'usuario_id': None},
    {'nome': 'Educação', 'tipo': 'Despesa', 'cor': '#8b5cf6', 'icone': 'book', 'usuario_id': None},
    {'nome': 'Eletrônicos', 'tipo': 'Despesa', 'cor': '#f59e0b', 'icone': 'device', 'usuario_id': None},
    {'nome': 'Lazer', 'tipo': 'Despesa', 'cor': '#f97316', 'icone': 'game', 'usuario_id': None},
    {'nome': 'Outros', 'tipo': 'Despesa', 'cor': '#6b7280', 'icone': 'dots', 'usuario_id': None},
    {'nome': 'Restaurante', 'tipo': 'Despesa', 'cor': '#dc2626', 'icone': 'restaurant', 'usuario_id': None},
    {'nome': 'Saúde', 'tipo': 'Despesa', 'cor': '#10b981', 'icone': 'health', 'usuario_id': None},
    {'nome': 'Serviços', 'tipo': 'Despesa', 'cor': '#059669', 'icone': 'service', 'usuario_id': None},
    {'nome': 'Supermercado', 'tipo': 'Despesa', 'cor': '#ef4444', 'icone': 'cart', 'usuario_id': None},
    {'nome': 'Transporte', 'tipo': 'Despesa', 'cor': '#06b6d4', 'icone': 'car', 'usuario_id': None},
    {'nome': 'Vestuário', 'tipo': 'Despesa', 'cor': '#06b6d4', 'icone': 'shirt', 'usuario_id': None},
    {'nome': 'Viagem', 'tipo': 'Despesa', 'cor': '#06b6d4', 'icone': 'plane', 'usuario_id': None}
]

INCOME_CATEGORIES = [
    {'nome': 'Investimentos', 'tipo': 'Receita', 'cor': '#10b981', 'icone': 'chart', 'usuario_id': None},
    {'nome': 'Outros', 'tipo': 'Receita', 'cor': '#dc2626', 'icone': 'dots', 'usuario_id': None},
    {'nome': 'Presente', 'tipo': 'Receita', 'cor': '#8b5cf6', 'icone': 'gift', 'usuario_id': None},
    {'nome': 'Prêmios', 'tipo': 'Receita', 'cor': '#f59e0b', 'icone': 'award', 'usuario_id': None},
    {'nome': 'Salário', 'tipo': 'Receita', 'cor': '#06b6d4', 'icone': 'money', 'usuario_id': None}
]

def test_connection():
    """Testa a conexão com o banco de dados"""
    try:
        connection = pymysql.connect(**DB_CONFIG)
        print("✅ Conexão com o banco estabelecida com sucesso!")
        connection.close()
        return True
    except Exception as e:
        print(f"❌ Erro ao conectar com o banco: {e}")
        return False

def setup_database():
    """Configura o banco de dados e adiciona as categorias"""
    try:
        connection = pymysql.connect(**DB_CONFIG)
        cursor = connection.cursor()
        
        print("🔄 Verificando estrutura da tabela CATEGORIAS...")
        
        # Verificar se a tabela existe
        cursor.execute("SHOW TABLES LIKE 'CATEGORIAS'")
        if not cursor.fetchone():
            print("❌ Tabela CATEGORIAS não encontrada!")
            print("💡 Execute as migrações do Alembic primeiro:")
            print("   cd backend && alembic upgrade head")
            return False
        
        # Verificar se as colunas existem
        cursor.execute("SHOW COLUMNS FROM CATEGORIAS")
        columns = [row[0] for row in cursor.fetchall()]
        
        if 'cor' not in columns:
            print("⚠️  Adicionando coluna 'cor'...")
            cursor.execute("ALTER TABLE CATEGORIAS ADD COLUMN cor VARCHAR(7) NULL")
            connection.commit()
            print("✅ Coluna 'cor' adicionada!")
        
        if 'icone' not in columns:
            print("⚠️  Adicionando coluna 'icone'...")
            cursor.execute("ALTER TABLE CATEGORIAS ADD COLUMN icone VARCHAR(50) NULL")
            connection.commit()
            print("✅ Coluna 'icone' adicionada!")
        
        print("🔄 Adicionando categorias de despesas...")
        for cat_data in EXPENSE_CATEGORIES:
            # Verificar se já existe (categorias globais com usuario_id = NULL)
            cursor.execute(
                "SELECT id FROM CATEGORIAS WHERE nome = %s AND tipo = %s AND usuario_id IS NULL",
                (cat_data['nome'], cat_data['tipo'])
            )
            
            if not cursor.fetchone():
                cursor.execute(
                    "INSERT INTO CATEGORIAS (nome, tipo, cor, icone, usuario_id) VALUES (%s, %s, %s, %s, %s)",
                    (cat_data['nome'], cat_data['tipo'], cat_data['cor'], cat_data['icone'], cat_data['usuario_id'])
                )
                print(f"  ✅ Adicionada: {cat_data['nome']} ({cat_data['tipo']}) - Global")
            else:
                print(f"  ⚠️  Já existe: {cat_data['nome']} ({cat_data['tipo']}) - Global")
        
        print("🔄 Adicionando categorias de receitas...")
        for cat_data in INCOME_CATEGORIES:
            # Verificar se já existe (categorias globais com usuario_id = NULL)
            cursor.execute(
                "SELECT id FROM CATEGORIAS WHERE nome = %s AND tipo = %s AND usuario_id IS NULL",
                (cat_data['nome'], cat_data['tipo'])
            )
            
            if not cursor.fetchone():
                cursor.execute(
                    "INSERT INTO CATEGORIAS (nome, tipo, cor, icone, usuario_id) VALUES (%s, %s, %s, %s, %s)",
                    (cat_data['nome'], cat_data['tipo'], cat_data['cor'], cat_data['icone'], cat_data['usuario_id'])
                )
                print(f"  ✅ Adicionada: {cat_data['nome']} ({cat_data['tipo']}) - Global")
            else:
                print(f"  ⚠️  Já existe: {cat_data['nome']} ({cat_data['tipo']}) - Global")
        
        connection.commit()
        
        # Mostrar estatísticas
        cursor.execute("SELECT tipo, COUNT(*) as total FROM CATEGORIAS GROUP BY tipo")
        stats = cursor.fetchall()
        
        print("📊 Estatísticas das categorias:")
        total = 0
        for tipo, count in stats:
            print(f"  {tipo}: {count} categorias")
            total += count
        print(f"  Total: {total} categorias")
        
        connection.close()
        return True
        
    except Exception as e:
        print(f"❌ Erro ao configurar banco: {e}")
        return False

def main():
    print("🚀 Configurando categorias padrão no banco 'financas'...")
    print("=" * 60)
    
    # Testar conexão
    if not test_connection():
        print("\n💡 Soluções possíveis:")
        print("1. Iniciar o Docker: docker compose up -d")
        print("2. Verificar se o MySQL está rodando na porta 3306")
        print("3. Verificar as credenciais do banco")
        return False
    
    # Configurar banco
    if setup_database():
        print("\n" + "=" * 60)
        print("✅ Setup concluído com sucesso!")
        print("🎯 Agora você pode usar a página de categorias no frontend")
        return True
    else:
        print("\n" + "=" * 60)
        print("❌ Setup falhou!")
        return False

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
