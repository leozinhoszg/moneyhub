#!/usr/bin/env python3
"""
Script para testar o callback real do Google OAuth
"""

import asyncio
import httpx
from app.core.config import get_settings

async def test_real_callback():
    """Testa o callback real do Google OAuth"""
    print("🧪 TESTE DO CALLBACK REAL GOOGLE OAUTH")
    print("="*60)
    
    settings = get_settings()
    print(f"🔧 Configurações:")
    print(f"   Google Client ID: {settings.google_client_id}")
    print(f"   Google Client Secret: {settings.google_client_secret[:10]}...")
    print(f"   Frontend URL: {settings.frontend_url}")
    
    # Simular uma requisição de callback com parâmetros reais
    callback_url = "http://localhost:8000/api/auth/google/callback"
    
    # Parâmetros que o Google envia no callback (exemplo)
    params = {
        "state": "test_state_123",
        "code": "test_auth_code_456",
        "scope": "email profile openid",
        "authuser": "0",
        "prompt": "consent"
    }
    
    try:
        async with httpx.AsyncClient() as client:
            print(f"🌐 Fazendo requisição para: {callback_url}")
            print(f"📋 Parâmetros: {params}")
            
            response = await client.get(callback_url, params=params, follow_redirects=False)
            
            print(f"✅ Status Code: {response.status_code}")
            print(f"📋 Headers: {dict(response.headers)}")
            
            if response.status_code == 302:  # Redirect
                location = response.headers.get('location', '')
                print(f"🎯 URL de redirecionamento: {location}")
                
                if 'auth/login?error=token_error' in location:
                    print("❌ PROBLEMA IDENTIFICADO: Erro token_error")
                    print("📋 Possíveis causas:")
                    print("   1. Estado (state) inválido")
                    print("   2. Código de autorização inválido")
                    print("   3. Problema na configuração OAuth")
                    print("   4. Erro na obtenção do token")
                    print("   5. Problema com as credenciais do Google")
                elif 'auth/login?error=missing_code' in location:
                    print("❌ PROBLEMA IDENTIFICADO: Código não encontrado")
                elif 'auth/login?error=manual_token_error' in location:
                    print("❌ PROBLEMA IDENTIFICADO: Erro na requisição manual")
                elif 'dashboard?auth=success' in location:
                    print("✅ SUCESSO: Redirecionamento para dashboard")
                else:
                    print(f"⚠️ Redirecionamento inesperado: {location}")
            else:
                print(f"⚠️ Resposta inesperada: {response.text[:500]}")
                
    except Exception as e:
        print(f"❌ Erro ao testar callback: {e}")
        import traceback
        traceback.print_exc()
    
    print("\n" + "="*60)
    print("📋 PRÓXIMOS PASSOS:")
    print("1. Teste a autenticação real no navegador")
    print("2. Verifique os logs do servidor para detalhes")
    print("3. Se houver erro, verifique:")
    print("   - Credenciais do Google no .env")
    print("   - URLs de redirecionamento no Google Console")
    print("   - Configuração CORS")
    print("="*60)

if __name__ == "__main__":
    asyncio.run(test_real_callback())

