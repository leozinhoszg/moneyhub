#!/usr/bin/env python3
"""
Script para configurar o Google OAuth no MoneyHub
"""

import os
import sys

def check_env_file():
    """Verifica se o arquivo .env existe e tem as configurações do Google OAuth"""
    env_file = ".env"
    
    if not os.path.exists(env_file):
        print("❌ Arquivo .env não encontrado!")
        print("📝 Criando arquivo .env baseado no exemplo...")
        
        # Copiar do arquivo de exemplo
        if os.path.exists("env example"):
            with open("env example", "r", encoding="utf-8") as f:
                content = f.read()
            
            with open(env_file, "w", encoding="utf-8") as f:
                f.write(content)
                f.write("\n# Configurações Google OAuth\n")
                f.write("GOOGLE_CLIENT_ID=your_google_client_id_here\n")
                f.write("GOOGLE_CLIENT_SECRET=your_google_client_secret_here\n")
            
            print("✅ Arquivo .env criado com sucesso!")
        else:
            print("❌ Arquivo 'env example' não encontrado!")
            return False
    
    # Verificar se as configurações do Google estão presentes
    with open(env_file, "r", encoding="utf-8") as f:
        content = f.read()
    
    has_google_config = "GOOGLE_CLIENT_ID" in content and "GOOGLE_CLIENT_SECRET" in content
    
    if not has_google_config:
        print("⚠️  Configurações do Google OAuth não encontradas no .env")
        print("📝 Adicionando configurações do Google OAuth...")
        
        with open(env_file, "a", encoding="utf-8") as f:
            f.write("\n# Configurações Google OAuth\n")
            f.write("GOOGLE_CLIENT_ID=your_google_client_id_here\n")
            f.write("GOOGLE_CLIENT_SECRET=your_google_client_secret_here\n")
        
        print("✅ Configurações do Google OAuth adicionadas!")
    
    return True

def print_setup_instructions():
    """Imprime as instruções de configuração"""
    print("\n" + "="*60)
    print("🔧 CONFIGURAÇÃO DO GOOGLE OAUTH")
    print("="*60)
    
    print("\n📋 Passos para configurar:")
    print("1. Acesse: https://console.cloud.google.com/")
    print("2. Crie um novo projeto ou selecione um existente")
    print("3. Vá para 'APIs & Services' > 'Credentials'")
    print("4. Clique em 'Create Credentials' > 'OAuth 2.0 Client IDs'")
    print("5. Configure como 'Web application'")
    
    print("\n🌐 URLs autorizadas:")
    print("   JavaScript origins:")
    print("   - http://localhost:3000")
    print("   - http://127.0.0.1:3000")
    print("\n   Redirect URIs:")
    print("   - http://localhost:8000/api/auth/google/callback")
    print("   - http://127.0.0.1:8000/api/auth/google/callback")
    
    print("\n🔑 Após criar, você receberá:")
    print("   - Client ID (ex: 123456789-abcdef.apps.googleusercontent.com)")
    print("   - Client Secret (ex: GOCSPX-abcdefghijklmnop)")
    
    print("\n📝 Edite o arquivo .env e substitua:")
    print("   GOOGLE_CLIENT_ID=seu_client_id_real")
    print("   GOOGLE_CLIENT_SECRET=seu_client_secret_real")
    
    print("\n🚀 Para testar:")
    print("1. python -m uvicorn app.main:app --reload --port 8000")
    print("2. Acesse: http://localhost:3000/auth/login")
    print("3. Clique em 'Continuar com Google'")

def main():
    """Função principal"""
    print("🔍 Verificando configuração do Google OAuth...")
    
    if check_env_file():
        print("✅ Arquivo .env configurado!")
        print_setup_instructions()
    else:
        print("❌ Erro na configuração do arquivo .env")
        sys.exit(1)

if __name__ == "__main__":
    main()

