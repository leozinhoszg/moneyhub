#!/usr/bin/env python3
"""
Script para testar a configuração do Google OAuth
"""

import asyncio
import httpx
from app.core.config import get_settings
from app.api.routes.auth import oauth

async def test_google_oauth_config():
    """Testa a configuração do Google OAuth"""
    print("🧪 TESTE DA CONFIGURAÇÃO GOOGLE OAUTH")
    print("="*60)
    
    settings = get_settings()
    print(f"🔧 Configurações:")
    print(f"   Google Client ID: {settings.google_client_id}")
    print(f"   Google Client Secret: {settings.google_client_secret[:10]}...")
    print(f"   Frontend URL: {settings.frontend_url}")
    
    # Verificar se o OAuth está configurado
    try:
        google_oauth = oauth.google
        print(f"✅ OAuth Google configurado: {google_oauth}")
        print(f"   Client ID: {google_oauth.client_id}")
        print(f"   Authorize URL: {google_oauth.authorize_url}")
        print(f"   Access Token URL: {google_oauth.access_token_url}")
        # userinfo_endpoint pode não estar disponível diretamente
        print(f"   OAuth App: {type(google_oauth)}")
    except Exception as e:
        print(f"❌ Erro na configuração OAuth: {e}")
        return
    
    # Testar se o servidor está rodando
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get("http://localhost:8000/health")
            if response.status_code == 200:
                print("✅ Servidor backend está rodando")
            else:
                print("⚠️ Servidor backend não está respondendo corretamente")
                return
    except Exception as e:
        print(f"❌ Erro ao conectar com o servidor: {e}")
        return
    
    # Testar rota de autenticação Google
    try:
        async with httpx.AsyncClient() as client:
            print("🌐 Fazendo requisição para /api/auth/google...")
            response = await client.get("http://localhost:8000/api/auth/google", follow_redirects=False)
            print(f"✅ Rota Google OAuth respondeu com status: {response.status_code}")
            
            if response.status_code == 302:  # Redirect
                location = response.headers.get('location', '')
                print(f"✅ URL de redirecionamento: {location}")
                
                # Verificar se a URL contém os parâmetros corretos
                if 'accounts.google.com' in location:
                    print("✅ Redirecionamento para Google OK")
                    
                    # Verificar se contém client_id
                    if settings.google_client_id in location:
                        print("✅ Client ID está na URL")
                    else:
                        print("❌ Client ID não está na URL")
                    
                    # Verificar se contém redirect_uri
                    if 'redirect_uri=http%3A%2F%2Flocalhost%3A8000%2Fapi%2Fauth%2Fgoogle%2Fcallback' in location:
                        print("✅ Redirect URI está na URL")
                    else:
                        print("❌ Redirect URI não está na URL")
                        
                else:
                    print("⚠️ Redirecionamento não parece ser para Google")
            else:
                print(f"⚠️ Resposta inesperada: {response.text[:200]}")
                
    except Exception as e:
        print(f"❌ Erro ao testar rota Google OAuth: {e}")
        import traceback
        traceback.print_exc()
    
    print("\n" + "="*60)
    print("📋 PRÓXIMOS PASSOS:")
    print("1. Teste a autenticação real")
    print("2. Verifique os logs do servidor")
    print("3. Se ainda houver erro, verifique:")
    print("   - Credenciais do Google no .env")
    print("   - URLs de redirecionamento no Google Console")
    print("   - Configuração CORS")
    print("="*60)

if __name__ == "__main__":
    asyncio.run(test_google_oauth_config())
