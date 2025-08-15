#!/usr/bin/env python3
"""
Script para testar a compatibilidade das dependências do requirements.txt
"""

import subprocess
import sys
import os

def test_requirements():
    """Testa se todas as dependências podem ser instaladas sem conflitos"""
    
    print("🧪 Testando compatibilidade das dependências...")
    print("=" * 50)
    
    # Lista de dependências para testar
    dependencies = [
        "fastapi==0.95.2",
        "uvicorn==0.22.0", 
        "python-multipart==0.0.6",
        "sqlalchemy==1.4.49",
        "alembic==1.11.1",
        "pymysql==1.0.3",
        "cryptography==39.0.2",
        "python-jose[cryptography]==3.3.0",
        "passlib[bcrypt]==1.7.4",
        "authlib==1.2.1",
        "httpx==0.24.1",
        "pydantic==1.10.13",
        "python-dotenv==1.0.0",
        "email-validator==2.0.0",
        "starlette==0.26.1",
        "pytest==7.3.1",
        "pytest-asyncio==0.21.1",
        "loguru==0.7.0",
        "python-dateutil==2.8.2"
    ]
    
    failed_deps = []
    
    for dep in dependencies:
        print(f"📦 Testando: {dep}")
        try:
            # Testa se a dependência pode ser instalada
            result = subprocess.run(
                [sys.executable, "-m", "pip", "install", "--dry-run", dep],
                capture_output=True,
                text=True,
                timeout=30
            )
            
            if result.returncode == 0:
                print(f"   ✅ {dep} - OK")
            else:
                print(f"   ❌ {dep} - ERRO")
                print(f"      Erro: {result.stderr}")
                failed_deps.append(dep)
                
        except subprocess.TimeoutExpired:
            print(f"   ⏰ {dep} - TIMEOUT")
            failed_deps.append(dep)
        except Exception as e:
            print(f"   💥 {dep} - EXCEÇÃO: {e}")
            failed_deps.append(dep)
    
    print("\n" + "=" * 50)
    
    if failed_deps:
        print(f"❌ {len(failed_deps)} dependências com problemas:")
        for dep in failed_deps:
            print(f"   - {dep}")
        return False
    else:
        print("✅ Todas as dependências são compatíveis!")
        return True

def test_imports():
    """Testa se as dependências podem ser importadas"""
    
    print("\n🔍 Testando imports das dependências...")
    print("=" * 50)
    
    imports_to_test = [
        ("fastapi", "FastAPI"),
        ("uvicorn", "run"),
        ("sqlalchemy", "create_engine"),
        ("alembic", "command"),
        ("pymysql", "connect"),
        ("cryptography", "fernet"),
        ("jose", "jwt"),
        ("passlib", "hash"),
        ("authlib", "OAuth2Session"),
        ("httpx", "Client"),
        ("pydantic", "BaseModel"),
        ("dotenv", "load_dotenv"),
        ("email_validator", "validate_email"),
        ("starlette", "Request"),
        ("pytest", "main"),
        ("loguru", "logger"),
        ("dateutil", "parser")
    ]
    
    failed_imports = []
    
    for module, item in imports_to_test:
        try:
            __import__(module)
            print(f"   ✅ {module} - OK")
        except ImportError as e:
            print(f"   ❌ {module} - ERRO: {e}")
            failed_imports.append(module)
        except Exception as e:
            print(f"   💥 {module} - EXCEÇÃO: {e}")
            failed_imports.append(module)
    
    print("\n" + "=" * 50)
    
    if failed_imports:
        print(f"❌ {len(failed_imports)} imports com problemas:")
        for module in failed_imports:
            print(f"   - {module}")
        return False
    else:
        print("✅ Todos os imports funcionam!")
        return True

if __name__ == "__main__":
    print("🚀 Iniciando teste de compatibilidade das dependências...")
    
    # Testa instalação
    install_ok = test_requirements()
    
    # Testa imports (se a instalação funcionou)
    if install_ok:
        import_ok = test_imports()
    else:
        import_ok = False
    
    print("\n" + "=" * 50)
    print("📊 RESULTADO FINAL:")
    
    if install_ok and import_ok:
        print("🎉 SUCESSO: Todas as dependências são compatíveis!")
        print("✅ O requirements.txt está pronto para uso")
        sys.exit(0)
    else:
        print("💥 FALHA: Algumas dependências têm problemas")
        print("❌ Verifique e corrija os problemas listados acima")
        sys.exit(1)
