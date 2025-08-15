#!/usr/bin/env python3
"""
Script para simular o callback do Google OAuth
"""

import asyncio
import httpx
from app.core.config import get_settings

async def test_callback_simulation():
    """Simula o callback do Google OAuth"""
    print("🧪 SIMULAÇÃO DO CALLBACK GOOGLE OAUTH")
    print("="*60)
    
    settings = get_settings()
    print(f"🔧 Configurações:")
    print(f"   Frontend URL: {settings.frontend_url}")
    print(f"   CORS Origins: {settings.cors_origins}")
    
    # Simular uma requisição de callback com parâmetros válidos
    callback_url = "http://localhost:8000/api/auth/google/callback"
    
    # Parâmetros que o Google envia no callback
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
                
                if 'auth/login?error=oauth_error' in location:
                    print("❌ PROBLEMA IDENTIFICADO: Erro OAuth no callback")
                    print("📋 Possíveis causas:")
                    print("   1. Estado (state) inválido")
                    print("   2. Código de autorização inválido")
                    print("   3. Problema na configuração OAuth")
                    print("   4. Erro na obtenção do token")
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
    print("1. Verificar logs do servidor durante o teste real")
    print("2. Verificar se o estado (state) está sendo validado corretamente")
    print("3. Verificar se o código de autorização está sendo processado")
    print("="*60)

if __name__ == "__main__":
    asyncio.run(test_callback_simulation())

