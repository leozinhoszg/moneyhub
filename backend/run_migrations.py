#!/usr/bin/env python3
"""
Script para executar migrações SQL diretamente
"""
import pymysql
import os
from urllib.parse import quote_plus

def get_connection():
    """Criar conexão com o banco de dados"""
    user = os.getenv("DB_USER", "root")
    password = os.getenv("DB_PASSWORD", "Jae66yrr@")
    host = os.getenv("DB_HOST", "127.0.0.1")
    name = os.getenv("DB_NAME", "moneyhub")
    
    return pymysql.connect(
        host=host,
        user=user,
        password=password,
        database=name,
        charset='utf8mb4',
        autocommit=True
    )

def run_migrations():
    """Executar todas as migrações pendentes"""
    connection = get_connection()
    cursor = connection.cursor()
    
    try:
        print("Executando migrações...")
        
        # Migração 0004: Adicionar campos provider e is_verified
        print("Executando migração 0004: Adicionar campos provider e is_verified")
        cursor.execute("""
            ALTER TABLE USUARIOS 
            ADD COLUMN provider VARCHAR(20) NOT NULL DEFAULT 'email'
        """)
        cursor.execute("""
            ALTER TABLE USUARIOS 
            ADD COLUMN is_verified BOOLEAN NOT NULL DEFAULT 0
        """)
        print("✓ Migração 0004 concluída")
        
        # Migração 0005: Adicionar campo updated_at
        print("Executando migração 0005: Adicionar campo updated_at")
        cursor.execute("""
            ALTER TABLE USUARIOS 
            ADD COLUMN updated_at DATETIME NULL
        """)
        print("✓ Migração 0005 concluída")
        
        # Migração 0006: Adicionar campo is_active
        print("Executando migração 0006: Adicionar campo is_active")
        cursor.execute("""
            ALTER TABLE USUARIOS 
            ADD COLUMN is_active BOOLEAN NOT NULL DEFAULT 1
        """)
        print("✓ Migração 0006 concluída")
        
        print("\n🎉 Todas as migrações foram executadas com sucesso!")
        
    except Exception as e:
        print(f"❌ Erro ao executar migrações: {e}")
        connection.rollback()
        raise
    finally:
        cursor.close()
        connection.close()

if __name__ == "__main__":
    run_migrations()
