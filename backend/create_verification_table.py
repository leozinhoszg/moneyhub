#!/usr/bin/env python3
"""
Script para criar a tabela verification_codes diretamente no banco MySQL
"""

import pymysql
import sys

# Configurações do banco de dados
DB_CONFIG = {
    'host': '127.0.0.1',
    'port': 3306,
    'user': 'root',
    'password': 'zaq12wsxZAQ!@WSX',
    'database': 'moneyhub',
    'charset': 'utf8mb4'
}

# SQL para criar a tabela
CREATE_TABLE_SQL = """
CREATE TABLE IF NOT EXISTS verification_codes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    code VARCHAR(6) NOT NULL,
    created_at DATETIME NOT NULL,
    used BOOLEAN DEFAULT FALSE,
    user_data TEXT,
    INDEX ix_verification_codes_email (email),
    INDEX ix_verification_codes_id (id)
);
"""

def create_verification_codes_table():
    """Cria a tabela verification_codes no banco de dados"""
    try:
        # Conectar ao banco
        print("Conectando ao banco de dados MySQL...")
        connection = pymysql.connect(**DB_CONFIG)
        
        with connection.cursor() as cursor:
            # Criar a tabela
            print("Criando tabela verification_codes...")
            cursor.execute(CREATE_TABLE_SQL)
            
            # Verificar se a tabela foi criada
            cursor.execute("SHOW TABLES LIKE 'verification_codes'")
            result = cursor.fetchone()
            
            if result:
                print("✅ Tabela verification_codes criada com sucesso!")
                
                # Mostrar estrutura da tabela
                cursor.execute("DESCRIBE verification_codes")
                columns = cursor.fetchall()
                print("\n📋 Estrutura da tabela:")
                for column in columns:
                    print(f"  - {column[0]} ({column[1]})")
            else:
                print("❌ Erro: Tabela não foi criada")
                return False
        
        # Commit das mudanças
        connection.commit()
        return True
        
    except pymysql.Error as e:
        print(f"❌ Erro MySQL: {e}")
        return False
    except Exception as e:
        print(f"❌ Erro geral: {e}")
        return False
    finally:
        if 'connection' in locals():
            connection.close()
            print("🔌 Conexão com o banco fechada")

if __name__ == "__main__":
    print("🚀 Iniciando criação da tabela verification_codes...")
    success = create_verification_codes_table()
    
    if success:
        print("\n✅ Script executado com sucesso!")
        sys.exit(0)
    else:
        print("\n❌ Script falhou!")
        sys.exit(1)
