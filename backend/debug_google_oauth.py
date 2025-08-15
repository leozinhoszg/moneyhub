#!/usr/bin/env python3
"""
Script para debugar o problema do Google OAuth
"""

import asyncio
from fastapi import Request
from fastapi.testclient import TestClient
from app.main import app
from app.api.routes.auth import google_auth, oauth

def test_oauth_config():
    """Testa a configuração do OAuth"""
    print("🔍 Testando configuração do OAuth...")
    
    try:
        # Verificar se o OAuth está configurado
        if not hasattr(oauth, 'google'):
            print("❌ Google OAuth não está configurado")
            return False
        
        print(f"✅ Google OAuth configurado")
        print(f"   Client ID: {oauth.google.client_id}")
        print(f"   Client Secret: {oauth.google.client_secret[:10]}...")
        print(f"   Scope: {oauth.google.client_kwargs.get('scope', 'N/A')}")
        
        return True
    except Exception as e:
        print(f"❌ Erro na configuração do OAuth: {e}")
        return False

def test_google_auth_function():
    """Testa a função google_auth diretamente"""
    print("\n🔍 Testando função google_auth...")
    
    try:
        # Criar um cliente de teste
        client = TestClient(app)
        
        # Fazer requisição para a rota
        response = client.get("/api/auth/google", allow_redirects=False)
        
        print(f"Status Code: {response.status_code}")
        print(f"Headers: {dict(response.headers)}")
        print(f"Response: {response.text[:500]}")
        
        if response.status_code == 307:
            print("✅ Redirecionamento funcionando")
            location = response.headers.get('location', '')
            print(f"   URL de redirecionamento: {location}")
        else:
            print("❌ Erro na função google_auth")
            
    except Exception as e:
        print(f"❌ Erro ao testar função: {e}")
        import traceback
        traceback.print_exc()

def test_oauth_authorize_redirect():
    """Testa a função authorize_redirect do OAuth"""
    print("\n🔍 Testando authorize_redirect...")
    
    try:
        # Simular uma requisição
        from fastapi import Request
        from starlette.testclient import TestClient
        
        client = TestClient(app)
        
        # Fazer requisição
        response = client.get("/api/auth/google", allow_redirects=False)
        
        if response.status_code == 500:
            print("❌ Erro 500 - Verificando logs...")
            # Tentar acessar a documentação para ver se o servidor está funcionando
            docs_response = client.get("/docs")
            print(f"   Status da documentação: {docs_response.status_code}")
            
    except Exception as e:
        print(f"❌ Erro: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    print("="*60)
    print("🐛 DEBUG DO GOOGLE OAUTH")
    print("="*60)
    
    # Testar configuração
    if test_oauth_config():
        # Testar função
        test_google_auth_function()
        test_oauth_authorize_redirect()
    
    print("\n" + "="*60)
    print("💡 SUGESTÕES:")
    print("1. Verifique se o servidor está rodando")
    print("2. Verifique os logs do servidor para erros específicos")
    print("3. Certifique-se de que as credenciais do Google estão corretas")
    print("4. Verifique se as URLs de redirecionamento estão configuradas no Google Console")
    print("="*60)

