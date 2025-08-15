#!/usr/bin/env python3
"""
Script para testar a configuração do Google OAuth
"""

import asyncio
import httpx
from app.core.config import get_settings

async def test_google_oauth_config():
    """Testa a configuração do Google OAuth"""
    print("🔍 Testando configuração do Google OAuth...")
    
    # Testar configurações
    settings = get_settings()
    print(f"✅ Google Client ID: {settings.google_client_id[:20]}...")
    print(f"✅ Google Client Secret: {settings.google_client_secret[:10]}...")
    
    # Testar se o servidor está rodando
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get("http://localhost:8000/docs")
            if response.status_code == 200:
                print("✅ Servidor backend está rodando")
            else:
                print("⚠️  Servidor backend não está respondendo corretamente")
    except Exception as e:
        print(f"❌ Erro ao conectar com o servidor: {e}")
        print("💡 Certifique-se de que o servidor está rodando com: python -m uvicorn app.main:app --reload --port 8000")
        return
    
    # Testar rota do Google OAuth
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get("http://localhost:8000/api/auth/google", follow_redirects=False)
            print(f"✅ Rota Google OAuth respondeu com status: {response.status_code}")
            if response.status_code == 307:  # Redirect
                print(f"✅ URL de redirecionamento: {response.headers.get('location', 'N/A')}")
            else:
                print(f"⚠️  Resposta inesperada: {response.text[:200]}")
    except Exception as e:
        print(f"❌ Erro ao testar rota Google OAuth: {e}")

def test_oauth_import():
    """Testa se o OAuth está configurado corretamente"""
    try:
        from app.api.routes.auth import oauth
        print("✅ Módulo OAuth importado com sucesso")
        
        if hasattr(oauth, 'google'):
            print(f"✅ Google OAuth configurado com Client ID: {oauth.google.client_id[:20]}...")
        else:
            print("❌ Google OAuth não está configurado")
    except Exception as e:
        print(f"❌ Erro ao importar OAuth: {e}")

def test_database_connection():
    """Testa a conexão com o banco de dados"""
    try:
        from app.db.session import engine
        from app.models.user import User
        from sqlalchemy import text
        
        # Testar conexão
        with engine.connect() as conn:
            result = conn.execute(text("SELECT 1"))
            print("✅ Conexão com banco de dados OK")
            
        # Testar modelo User
        print("✅ Modelo User carregado com sucesso")
        
    except Exception as e:
        print(f"❌ Erro na conexão com banco de dados: {e}")

if __name__ == "__main__":
    print("="*60)
    print("🧪 TESTE DE CONFIGURAÇÃO DO GOOGLE OAUTH")
    print("="*60)
    
    # Testes básicos
    test_oauth_import()
    test_database_connection()
    
    # Teste assíncrono
    print("\n🌐 Testando conectividade...")
    asyncio.run(test_google_oauth_config())
    
    print("\n" + "="*60)
    print("📋 PRÓXIMOS PASSOS:")
    print("1. Se todos os testes passaram, inicie o servidor:")
    print("   python -m uvicorn app.main:app --reload --port 8000")
    print("2. Em outro terminal, inicie o frontend:")
    print("   cd ../frontend && npm run dev")
    print("3. Acesse: http://localhost:3000/auth/login")
    print("4. Clique em 'Continuar com Google'")
    print("="*60)

