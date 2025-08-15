#!/usr/bin/env python3
"""
Script para testar a função de callback do Google OAuth
"""

import asyncio
from fastapi.testclient import TestClient
from app.main import app
from app.api.routes.auth import google_callback
from app.db.session import SessionLocal

def test_callback_function():
    """Testa a função de callback diretamente"""
    print("🔍 Testando função de callback...")
    
    try:
        # Criar um cliente de teste
        client = TestClient(app)
        
        # Simular uma requisição de callback com parâmetros válidos
        callback_url = "/api/auth/google/callback?state=test_state&code=test_code"
        response = client.get(callback_url, allow_redirects=False)
        
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.text[:500]}")
        
        if response.status_code == 500:
            print("❌ Erro 500 no callback")
            # Verificar se há logs de erro
            print("Verificando logs...")
        else:
            print("✅ Callback funcionando")
            
    except Exception as e:
        print(f"❌ Erro ao testar callback: {e}")
        import traceback
        traceback.print_exc()

def test_database_connection():
    """Testa a conexão com o banco de dados"""
    print("\n🔍 Testando conexão com banco de dados...")
    
    try:
        db = SessionLocal()
        result = db.execute("SELECT 1")
        print("✅ Conexão com banco OK")
        db.close()
    except Exception as e:
        print(f"❌ Erro na conexão com banco: {e}")

def test_oauth_config():
    """Testa a configuração do OAuth"""
    print("\n🔍 Testando configuração OAuth...")
    
    try:
        from app.api.routes.auth import oauth
        if hasattr(oauth, 'google'):
            print("✅ OAuth configurado")
            print(f"   Client ID: {oauth.google.client_id[:20]}...")
        else:
            print("❌ OAuth não configurado")
    except Exception as e:
        print(f"❌ Erro na configuração OAuth: {e}")

if __name__ == "__main__":
    print("="*60)
    print("🧪 TESTE DO CALLBACK GOOGLE OAUTH")
    print("="*60)
    
    test_database_connection()
    test_oauth_config()
    test_callback_function()
    
    print("\n" + "="*60)
    print("💡 SUGESTÕES:")
    print("1. Verifique se o banco de dados está acessível")
    print("2. Verifique se as credenciais do Google estão corretas")
    print("3. Verifique os logs do servidor para erros específicos")
    print("="*60)

