#!/usr/bin/env python3
"""
Script para testar o envio de email com as configurações SMTP
"""

import asyncio
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
import os
from dotenv import load_dotenv

# Carregar variáveis de ambiente
load_dotenv()

# Configurações SMTP
SMTP_HOST = os.getenv("SMTP_HOST", "smtp-relay.brevo.com")
SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))
SMTP_USERNAME = os.getenv("SMTP_USERNAME", "")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD", "")
SMTP_FROM_EMAIL = os.getenv("SMTP_FROM_EMAIL", "noreply@moneyhub.com")
SMTP_FROM_NAME = os.getenv("SMTP_FROM_NAME", "MoneyHub")

def test_smtp_connection():
    """Testa a conexão SMTP"""
    try:
        print(f"🔗 Testando conexão SMTP...")
        print(f"   Host: {SMTP_HOST}")
        print(f"   Port: {SMTP_PORT}")
        print(f"   Username: {SMTP_USERNAME}")
        print(f"   From Email: {SMTP_FROM_EMAIL}")
        
        with smtplib.SMTP(SMTP_HOST, SMTP_PORT) as server:
            server.starttls()
            server.login(SMTP_USERNAME, SMTP_PASSWORD)
            print("✅ Conexão SMTP estabelecida com sucesso!")
            return True
            
    except Exception as e:
        print(f"❌ Erro na conexão SMTP: {e}")
        return False

def send_test_email(to_email: str):
    """Envia um email de teste"""
    try:
        # Criar mensagem
        msg = MIMEMultipart('alternative')
        msg['Subject'] = "MoneyHub - Teste de Email"
        msg['From'] = f"{SMTP_FROM_NAME} <{SMTP_FROM_EMAIL}>"
        msg['To'] = to_email
        
        # Conteúdo HTML do email
        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <title>Teste MoneyHub</title>
        </head>
        <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
                <h1 style="color: white; margin: 0; font-size: 28px;">MoneyHub</h1>
                <p style="color: white; margin: 10px 0 0 0; font-size: 16px;">Sistema de Verificação por Email</p>
            </div>
            
            <div style="background-color: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e9ecef;">
                <h2 style="color: #333; margin-bottom: 20px;">🎉 Teste de Email Realizado com Sucesso!</h2>
                
                <p style="color: #666; font-size: 16px; line-height: 1.6;">
                    Este é um email de teste para verificar se o sistema de envio de emails do MoneyHub está funcionando corretamente.
                </p>
                
                <div style="background-color: #e3f2fd; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #2196f3;">
                    <p style="margin: 0; color: #1976d2; font-weight: bold;">✅ Configuração SMTP: Funcionando</p>
                    <p style="margin: 5px 0 0 0; color: #666; font-size: 14px;">
                        Servidor: {SMTP_HOST}<br>
                        Porta: {SMTP_PORT}<br>
                        De: {SMTP_FROM_EMAIL}
                    </p>
                </div>
                
                <p style="color: #666; font-size: 14px; margin-top: 30px;">
                    Se você recebeu este email, significa que o sistema de verificação por email está pronto para uso!
                </p>
                
                <hr style="border: none; border-top: 1px solid #e9ecef; margin: 30px 0;">
                
                <p style="color: #999; font-size: 12px; text-align: center; margin: 0;">
                    Este é um email automático do sistema MoneyHub. Não responda a este email.
                </p>
            </div>
        </body>
        </html>
        """
        
        # Anexar conteúdo HTML
        html_part = MIMEText(html_content, 'html', 'utf-8')
        msg.attach(html_part)
        
        # Enviar email
        print(f"📧 Enviando email de teste para {to_email}...")
        with smtplib.SMTP(SMTP_HOST, SMTP_PORT) as server:
            server.starttls()
            server.login(SMTP_USERNAME, SMTP_PASSWORD)
            server.send_message(msg)
        
        print("✅ Email de teste enviado com sucesso!")
        return True
        
    except Exception as e:
        print(f"❌ Erro ao enviar email: {e}")
        return False

if __name__ == "__main__":
    print("🚀 Testando configuração de email do MoneyHub...")
    print("=" * 50)
    
    # Testar conexão
    if test_smtp_connection():
        print("\n" + "=" * 50)
        
        # Enviar email de teste
        test_email = os.getenv("SMTP_TEST_RECIPIENT", "")
        if not test_email:
            print("\n⚠️  Defina SMTP_TEST_RECIPIENT no ambiente para enviar email de teste.")
            return
        if send_test_email(test_email):
            print(f"\n🎉 Teste completo! Verifique a caixa de entrada de {test_email}")
        else:
            print("\n❌ Falha no envio do email de teste")
    else:
        print("\n❌ Falha na conexão SMTP")
