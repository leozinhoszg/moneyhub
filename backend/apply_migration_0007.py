#!/usr/bin/env python3
"""
Script para aplicar a migração 0007 - Atualizar tabela de usuários
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

def apply_migration_0007():
    """Aplicar migração 0007 - Atualizar tabela de usuários"""
    connection = get_connection()
    cursor = connection.cursor()
    
    try:
        print("Aplicando migração 0007: Atualizar tabela de usuários...")
        
        # 1. Verificar nome da tabela
        print("1. Verificando nome da tabela...")
        cursor.execute("SHOW TABLES LIKE 'usuarios'")
        if cursor.fetchone():
            print("   ✓ Tabela 'usuarios' já existe")
        else:
            cursor.execute("SHOW TABLES LIKE 'USUARIOS'")
            if cursor.fetchone():
                print("   Renomeando tabela USUARIOS para usuarios...")
                cursor.execute("RENAME TABLE USUARIOS TO usuarios")
                print("   ✓ Tabela renomeada com sucesso")
            else:
                print("   ❌ Nenhuma tabela de usuários encontrada")
                return
        
        # 2. Verificar e criar índices
        print("2. Verificando índices...")
        try:
            cursor.execute("CREATE UNIQUE INDEX ix_usuarios_google_id ON usuarios (google_id)")
            print("   ✓ Índice único para google_id criado")
        except Exception as e:
            if "Duplicate key name" in str(e):
                print("   ✓ Índice único para google_id já existe")
            else:
                print(f"   ⚠ Aviso ao criar índice: {e}")
        
        # 3. Garantir que senha_hash pode ser NULL
        print("3. Verificando campo senha_hash...")
        cursor.execute("ALTER TABLE usuarios MODIFY COLUMN senha_hash VARCHAR(255) NULL")
        print("   ✓ Campo senha_hash configurado como NULL")
        
        # 4. Atualizar registros existentes para garantir consistência
        print("4. Atualizando dados existentes...")
        
        # Atualizar provider para usuários que não têm
        cursor.execute("""
            UPDATE usuarios 
            SET provider = CASE 
                WHEN google_id IS NOT NULL AND senha_hash IS NOT NULL THEN 'both'
                WHEN google_id IS NOT NULL THEN 'google'
                ELSE 'email'
            END
            WHERE provider IS NULL OR provider = ''
        """)
        print("   ✓ Providers atualizados")
        
        # Atualizar is_verified para usuários Google
        cursor.execute("""
            UPDATE usuarios 
            SET is_verified = 1, email_verificado = 1
            WHERE google_id IS NOT NULL AND is_verified = 0
        """)
        print("   ✓ Usuários Google marcados como verificados")
        
        # Garantir que usuários ativos são marcados como tal
        cursor.execute("""
            UPDATE usuarios 
            SET is_active = 1
            WHERE is_active IS NULL
        """)
        print("   ✓ Usuários marcados como ativos")
        
        # 5. Verificar estrutura final
        print("5. Verificando estrutura final...")
        cursor.execute("DESCRIBE usuarios")
        columns = cursor.fetchall()
        print("   Estrutura final da tabela usuarios:")
        for col in columns:
            print(f"     {col[0]}: {col[1]}")
        
        print("\n🎉 Migração 0007 aplicada com sucesso!")
        print("✅ Tabela 'usuarios' atualizada e consistente")
        print("✅ Índices criados")
        print("✅ Dados existentes atualizados")
        
    except Exception as e:
        print(f"❌ Erro ao aplicar migração: {e}")
        connection.rollback()
        raise
    finally:
        cursor.close()
        connection.close()

if __name__ == "__main__":
    apply_migration_0007()
