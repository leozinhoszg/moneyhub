#!/usr/bin/env python3
"""
Script para testar o fluxo OAuth completo
"""

import asyncio
import httpx
from app.core.config import get_settings

async def test_oauth_flow():
    """Testa o fluxo OAuth completo"""
    print("🧪 TESTE DO FLUXO OAUTH COMPLETO")
    print("="*60)
    
    settings = get_settings()
    print(f"🔧 Configurações:")
    print(f"   Frontend URL: {settings.frontend_url}")
    print(f"   CORS Origins: {settings.cors_origins}")
    print(f"   Google Client ID: {settings.google_client_id[:20]}...")
    
    # Testar se o servidor está rodando
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get("http://localhost:8000/docs")
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
            print(f"📋 Headers: {dict(response.headers)}")
            
            if response.status_code == 307:  # Redirect
                location = response.headers.get('location', '')
                print(f"✅ URL de redirecionamento: {location}")
                
                # Verificar se a URL contém os parâmetros corretos
                if 'accounts.google.com' in location:
                    print("✅ Redirecionamento para Google OK")
                else:
                    print("⚠️ Redirecionamento não parece ser para Google")
            elif response.status_code == 500:
                print(f"❌ Erro 500: {response.text}")
            else:
                print(f"⚠️ Resposta inesperada: {response.text[:200]}")
                
    except Exception as e:
        print(f"❌ Erro ao testar rota Google OAuth: {e}")
        import traceback
        traceback.print_exc()
    
    print("\n" + "="*60)
    print("📋 PRÓXIMOS PASSOS:")
    print("1. Acesse: http://localhost:3000/auth/login")
    print("2. Clique em 'Continuar com Google'")
    print("3. Verifique os logs do servidor para detalhes")
    print("4. Se houver erro, verifique:")
    print("   - Credenciais do Google no .env")
    print("   - URLs de redirecionamento no Google Console")
    print("   - Configuração CORS")
    print("="*60)

if __name__ == "__main__":
    asyncio.run(test_oauth_flow())
