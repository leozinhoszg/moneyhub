import smtplib
import secrets
import string
from datetime import datetime, timedelta
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import Optional

from app.core.config import get_settings


class EmailService:
    def __init__(self):
        self.settings = get_settings()
        
    def generate_verification_code(self) -> str:
        """Gera um código de verificação de 6 dígitos"""
        return ''.join(secrets.choice(string.digits) for _ in range(6))
    
    def create_verification_email_html(self, code: str, user_name: str) -> str:
        """Cria o HTML do email de verificação"""
        return f"""
        <!DOCTYPE html>
        <html lang="pt-BR">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Verificação de Email - MoneyHub</title>
            <style>
                @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700&family=Open+Sans:wght@400;500;600&display=swap');
                
                body {{
                    font-family: 'Open Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                    line-height: 1.6;
                    color: #333;
                    max-width: 600px;
                    margin: 0 auto;
                    padding: 20px;
                    background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
                }}
                .container {{
                    background-color: white;
                    padding: 40px;
                    border-radius: 24px;
                    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
                    border: 1px solid rgba(226, 232, 240, 0.5);
                }}
                .header {{
                    text-align: center;
                    margin-bottom: 40px;
                }}
                .logo-container {{
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    width: 120px;
                    height: 120px;
                    margin-bottom: 20px;
                    position: relative;
                }}
                .logo-bg {{
                    position: absolute;
                    inset: 0;
                    background: linear-gradient(135deg, #10b981 0%, #059669 100%);
                    border-radius: 50%;
                    opacity: 0.1;
                }}
                .logo-icon {{
                    width: 80px;
                    height: 80px;
                    background: linear-gradient(135deg, #10b981 0%, #059669 100%);
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    position: relative;
                    z-index: 10;
                }}
                .logo-icon::before {{
                    content: '📊';
                    font-size: 36px;
                    filter: brightness(0) invert(1);
                }}
                .logo-text {{
                    font-family: 'Montserrat', sans-serif;
                    font-size: 32px;
                    font-weight: 700;
                    margin-bottom: 8px;
                }}
                .logo-money {{
                    color: #013a56;
                }}
                .logo-hub {{
                    color: #00cc66;
                }}
                .subtitle {{
                    font-family: 'Open Sans', sans-serif;
                    font-size: 18px;
                    font-weight: 600;
                    color: #1e293b;
                    margin-bottom: 8px;
                }}
                .description {{
                    font-family: 'Open Sans', sans-serif;
                    font-size: 14px;
                    color: #64748b;
                }}
                .content {{
                    margin: 32px 0;
                }}
                .greeting {{
                    font-size: 16px;
                    color: #1e293b;
                    margin-bottom: 24px;
                }}
                .message {{
                    font-size: 15px;
                    color: #475569;
                    margin-bottom: 32px;
                    line-height: 1.7;
                }}
                .verification-code {{
                    background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
                    border: 2px dashed #10b981;
                    padding: 32px 24px;
                    text-align: center;
                    margin: 40px 0;
                    border-radius: 16px;
                    position: relative;
                }}
                .code-label {{
                    font-size: 14px;
                    color: #059669;
                    margin-bottom: 16px;
                    font-weight: 600;
                }}
                .code {{
                    font-size: 36px;
                    font-weight: 700;
                    color: #013a56;
                    letter-spacing: 12px;
                    font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
                    background: white;
                    padding: 16px 24px;
                    border-radius: 12px;
                    border: 1px solid #10b981;
                    display: inline-block;
                    box-shadow: 0 4px 6px -1px rgba(16, 185, 129, 0.1);
                }}
                .warning {{
                    background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
                    border: 1px solid #f59e0b;
                    padding: 20px;
                    border-radius: 12px;
                    margin: 32px 0;
                    position: relative;
                }}
                .warning-icon {{
                    display: inline-block;
                    margin-right: 8px;
                    font-size: 16px;
                }}
                .warning-text {{
                    font-size: 14px;
                    color: #92400e;
                    font-weight: 500;
                }}
                .footer {{
                    margin-top: 40px;
                    padding-top: 24px;
                    border-top: 1px solid #e2e8f0;
                    text-align: center;
                }}
                .footer-text {{
                    font-size: 12px;
                    color: #64748b;
                    margin: 4px 0;
                }}
                .team-signature {{
                    font-size: 15px;
                    color: #1e293b;
                    margin: 24px 0 16px 0;
                }}
                .team-name {{
                    font-weight: 600;
                    color: #013a56;
                }}
                
                /* Responsive */
                @media (max-width: 640px) {{
                    .container {{
                        padding: 24px;
                        border-radius: 16px;
                    }}
                    .logo-text {{
                        font-size: 28px;
                    }}
                    .code {{
                        font-size: 28px;
                        letter-spacing: 8px;
                        padding: 12px 16px;
                    }}
                }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <div class="logo-container">
                        <div class="logo-bg"></div>
                        <div class="logo-icon"></div>
                    </div>
                    <div class="logo-text">
                        <span class="logo-money">Money</span><span class="logo-hub">Hub</span>
                    </div>
                    <div class="subtitle">Verificação de Email</div>
                    <div class="description">Obrigado por se cadastrar no MoneyHub!</div>
                </div>
                
                <div class="content">
                    <div class="greeting">Olá <strong>{user_name}</strong>,</div>
                    
                    <div class="message">
                        Para completar seu cadastro, use o código de verificação abaixo:
                    </div>
                    
                    <div class="verification-code">
                        <div class="code-label">Seu código de verificação é:</div>
                        <div class="code">{code}</div>
                    </div>
                    
                    <div class="message">
                        Digite este código na página de cadastro para ativar sua conta.
                    </div>
                    
                    <div class="warning">
                        <span class="warning-icon">⚠️</span>
                        <span class="warning-text">
                            <strong>Importante:</strong> Este código expira em {self.settings.email_verification_expiry_minutes} minutos. 
                            Se você não solicitou este cadastro, pode ignorar este email.
                        </span>
                    </div>
                    
                    <div class="message">
                        Se você tiver alguma dúvida, entre em contato conosco.
                    </div>
                    
                    <div class="team-signature">
                        Atenciosamente,<br>
                        <span class="team-name">Equipe MoneyHub</span>
                    </div>
                </div>
                
                <div class="footer">
                    <div class="footer-text">Este é um email automático, não responda a esta mensagem.</div>
                    <div class="footer-text">© 2025 MoneyHub - Centro de Controle Financeiro</div>
                </div>
            </div>
        </body>
        </html>
        """
    
    async def send_verification_email(self, email: str, code: str, user_name: str) -> bool:
        """Envia email de verificação"""
        try:
            # Criar mensagem
            msg = MIMEMultipart('alternative')
            msg['Subject'] = f"MoneyHub - Código de Verificação: {code}"
            msg['From'] = f"{self.settings.smtp_from_name} <{self.settings.smtp_from_email}>"
            msg['To'] = email
            
            # Versão texto simples
            text_content = f"""
            Olá {user_name},
            
            Seu código de verificação do MoneyHub é: {code}
            
            Digite este código na página de cadastro para ativar sua conta.
            Este código expira em {self.settings.email_verification_expiry_minutes} minutos.
            
            Se você não solicitou este cadastro, pode ignorar este email.
            
            Atenciosamente,
            Equipe MoneyHub
            """
            
            # Versão HTML
            html_content = self.create_verification_email_html(code, user_name)
            
            # Anexar ambas as versões
            part1 = MIMEText(text_content, 'plain')
            part2 = MIMEText(html_content, 'html')
            
            msg.attach(part1)
            msg.attach(part2)
            
            # Enviar email
            with smtplib.SMTP(self.settings.smtp_host, self.settings.smtp_port) as server:
                server.starttls()
                server.login(self.settings.smtp_username, self.settings.smtp_password)
                server.send_message(msg)
            
            return True
            
        except Exception as e:
            print(f"Erro ao enviar email: {e}")
            return False
    
    def is_code_expired(self, created_at: datetime) -> bool:
        """Verifica se o código de verificação expirou"""
        expiry_time = created_at + timedelta(minutes=self.settings.email_verification_expiry_minutes)
        return datetime.now() > expiry_time
    
    def generate_reset_token(self) -> str:
        """Gera um token de reset de senha de 32 caracteres"""
        return ''.join(secrets.choice(string.ascii_letters + string.digits) for _ in range(32))
    
    def create_password_reset_email_html(self, reset_token: str, user_name: str) -> str:
        """Cria o HTML do email de reset de senha"""
        reset_url = f"{self.settings.frontend_url}/auth/reset-password?token={reset_token}"
        
        return f"""
        <!DOCTYPE html>
        <html lang="pt-BR">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Reset your password - MoneyHub</title>
            <style>
                @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700&family=Open+Sans:wght@400;500;600&display=swap');
                
                body {{
                    font-family: 'Open Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                    line-height: 1.6;
                    color: #333;
                    max-width: 600px;
                    margin: 0 auto;
                    padding: 20px;
                    background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
                }}
                .container {{
                    background-color: white;
                    padding: 40px;
                    border-radius: 24px;
                    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
                    border: 1px solid rgba(226, 232, 240, 0.5);
                }}
                .header {{
                    text-align: center;
                    margin-bottom: 40px;
                }}
                .logo-container {{
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    width: 120px;
                    height: 120px;
                    margin-bottom: 20px;
                    position: relative;
                }}
                .logo-bg {{
                    position: absolute;
                    inset: 0;
                    background: linear-gradient(135deg, #10b981 0%, #059669 100%);
                    border-radius: 50%;
                    opacity: 0.1;
                }}
                .logo-icon {{
                    width: 80px;
                    height: 80px;
                    background: linear-gradient(135deg, #10b981 0%, #059669 100%);
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    position: relative;
                    z-index: 10;
                }}
                .logo-icon::before {{
                    content: '📊';
                    font-size: 36px;
                    filter: brightness(0) invert(1);
                }}
                .logo-text {{
                    font-family: 'Montserrat', sans-serif;
                    font-size: 32px;
                    font-weight: 700;
                    margin-bottom: 8px;
                }}
                .logo-money {{
                    color: #013a56;
                }}
                .logo-hub {{
                    color: #00cc66;
                }}
                .subtitle {{
                    font-family: 'Open Sans', sans-serif;
                    font-size: 18px;
                    font-weight: 600;
                    color: #1e293b;
                    margin-bottom: 8px;
                }}
                .description {{
                    font-family: 'Open Sans', sans-serif;
                    font-size: 14px;
                    color: #64748b;
                }}
                .content {{
                    margin: 32px 0;
                }}
                .greeting {{
                    font-size: 16px;
                    color: #1e293b;
                    margin-bottom: 24px;
                }}
                .message {{
                    font-size: 15px;
                    color: #475569;
                    margin-bottom: 32px;
                    line-height: 1.7;
                }}
                .button-container {{
                    text-align: center;
                    margin: 40px 0;
                }}
                .reset-button {{
                    display: inline-block;
                    background: linear-gradient(135deg, #10b981 0%, #059669 100%);
                    color: white;
                    padding: 16px 32px;
                    text-decoration: none;
                    border-radius: 12px;
                    font-family: 'Montserrat', sans-serif;
                    font-weight: 700;
                    font-size: 16px;
                    box-shadow: 0 10px 15px -3px rgba(16, 185, 129, 0.3), 0 4px 6px -2px rgba(16, 185, 129, 0.1);
                    transition: all 0.3s ease;
                    border: none;
                }}
                .reset-button:hover {{
                    background: linear-gradient(135deg, #059669 0%, #047857 100%);
                    transform: translateY(-2px);
                    box-shadow: 0 20px 25px -5px rgba(16, 185, 129, 0.4), 0 10px 10px -5px rgba(16, 185, 129, 0.2);
                }}
                .link-fallback {{
                    margin: 24px 0;
                    padding: 16px;
                    background-color: #f8fafc;
                    border-radius: 8px;
                    border: 1px solid #e2e8f0;
                }}
                .link-text {{
                    font-size: 14px;
                    color: #475569;
                    margin-bottom: 8px;
                }}
                .link-url {{
                    word-break: break-all;
                    font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
                    font-size: 12px;
                    color: #0f172a;
                    background-color: white;
                    padding: 8px 12px;
                    border-radius: 6px;
                    border: 1px solid #e2e8f0;
                }}
                .warning {{
                    background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
                    border: 1px solid #f59e0b;
                    padding: 20px;
                    border-radius: 12px;
                    margin: 32px 0;
                    position: relative;
                }}
                .warning-icon {{
                    display: inline-block;
                    margin-right: 8px;
                    font-size: 16px;
                }}
                .warning-text {{
                    font-size: 14px;
                    color: #92400e;
                    font-weight: 500;
                }}
                .footer {{
                    margin-top: 40px;
                    padding-top: 24px;
                    border-top: 1px solid #e2e8f0;
                    text-align: center;
                }}
                .footer-text {{
                    font-size: 12px;
                    color: #64748b;
                    margin: 4px 0;
                }}
                .team-signature {{
                    font-size: 15px;
                    color: #1e293b;
                    margin: 24px 0 16px 0;
                }}
                .team-name {{
                    font-weight: 600;
                    color: #013a56;
                }}
                
                /* Responsive */
                @media (max-width: 640px) {{
                    .container {{
                        padding: 24px;
                        border-radius: 16px;
                    }}
                    .logo-text {{
                        font-size: 28px;
                    }}
                    .reset-button {{
                        padding: 14px 28px;
                        font-size: 15px;
                    }}
                }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <div class="logo-container">
                        <div class="logo-bg"></div>
                        <div class="logo-icon"></div>
                    </div>
                    <div class="logo-text">
                        <span class="logo-money">Money</span><span class="logo-hub">Hub</span>
                    </div>
                    <div class="subtitle">Reset your password</div>
                    <div class="description">We received a request to reset the password for your account.</div>
                </div>
                
                <div class="content">
                    <div class="greeting">Olá <strong>{user_name}</strong>,</div>
                    
                    <div class="message">
                        Recebemos uma solicitação para redefinir a senha da sua conta MoneyHub.
                    </div>
                    
                    <div class="button-container">
                        <a href="{reset_url}" class="reset-button">Reset password</a>
                    </div>
                    
                    <div class="link-fallback">
                        <div class="link-text">Se o botão não funcionar, copie e cole o link abaixo no seu navegador:</div>
                        <div class="link-url">{reset_url}</div>
                    </div>
                    
                    <div class="warning">
                        <span class="warning-icon">⚠️</span>
                        <span class="warning-text">
                            <strong>Importante:</strong> Este link expira em {self.settings.email_verification_expiry_minutes} minutos. 
                            Se você não solicitou esta redefinição, pode ignorar este email com segurança.
                        </span>
                    </div>
                    
                    <div class="message">
                        Se você tiver alguma dúvida, entre em contato conosco.
                    </div>
                    
                    <div class="team-signature">
                        Atenciosamente,<br>
                        <span class="team-name">Equipe MoneyHub</span>
                    </div>
                </div>
                
                <div class="footer">
                    <div class="footer-text">Este é um email automático, não responda a esta mensagem.</div>
                    <div class="footer-text">© 2025 MoneyHub - Centro de Controle Financeiro</div>
                </div>
            </div>
        </body>
        </html>
        """
    
    async def send_password_reset_email(self, email: str, reset_token: str, user_name: str) -> bool:
        """Envia email de reset de senha"""
        try:
            # Criar mensagem
            msg = MIMEMultipart('alternative')
            msg['Subject'] = "MoneyHub - Redefinir Senha"
            msg['From'] = f"{self.settings.smtp_from_name} <{self.settings.smtp_from_email}>"
            msg['To'] = email
            
            # Versão texto simples
            reset_url = f"{self.settings.frontend_url}/auth/reset-password?token={reset_token}"
            text_content = f"""
            Olá {user_name},
            
            Recebemos uma solicitação para redefinir a senha da sua conta MoneyHub.
            
            Clique no link abaixo para redefinir sua senha:
            {reset_url}
            
            Este link expira em {self.settings.email_verification_expiry_minutes} minutos.
            
            Se você não solicitou esta redefinição, pode ignorar este email com segurança.
            
            Atenciosamente,
            Equipe MoneyHub
            """
            
            # Versão HTML
            html_content = self.create_password_reset_email_html(reset_token, user_name)
            
            # Anexar ambas as versões
            part1 = MIMEText(text_content, 'plain')
            part2 = MIMEText(html_content, 'html')
            
            msg.attach(part1)
            msg.attach(part2)
            
            # Enviar email
            with smtplib.SMTP(self.settings.smtp_host, self.settings.smtp_port) as server:
                server.starttls()
                server.login(self.settings.smtp_username, self.settings.smtp_password)
                server.send_message(msg)
            
            return True
            
        except Exception as e:
            print(f"Erro ao enviar email de reset: {e}")
            return False


# Instância global do serviço de email
email_service = EmailService()