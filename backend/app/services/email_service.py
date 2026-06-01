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
        expiry = self.settings.email_verification_expiry_minutes
        return f"""<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Seu código MoneyHub</title>
</head>
<body style="margin:0;padding:0;background-color:#f0f2f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color:#f0f2f5;padding:32px 16px;">
        <tr>
            <td align="center">
                <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="560" style="max-width:560px;width:100%;background-color:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.08);">
                    <tr>
                        <td align="center" style="background-color:#013a56;padding:28px 24px;">
                            <span style="font-family:'Segoe UI',Helvetica,Arial,sans-serif;font-size:28px;font-weight:700;color:#ffffff;letter-spacing:-0.5px;">
                                Money<span style="color:#00cc66;">Hub</span>
                            </span>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding:40px 40px 32px 40px;color:#3d3d3d;font-size:16px;line-height:1.6;">
                            <p style="margin:0 0 20px 0;">Olá,</p>
                            <p style="margin:0 0 20px 0;">
                                Seu código do gerenciador financeiro MoneyHub chegou! &#x1F60D;
                            </p>
                            <p style="margin:0 0 28px 0;">
                                Ao copiá-lo volte à página de acesso e insira o código abaixo para confirmar sua identidade.
                            </p>
                            <p style="margin:0 0 8px 0;font-size:18px;font-weight:700;color:#1a1a1a;">
                                Seu código de acesso é:
                            </p>
                            <p style="margin:0 0 32px 0;font-size:44px;font-weight:700;color:#00cc66;letter-spacing:4px;line-height:1.1;">
                                {code}
                            </p>
                            <p style="margin:0 0 20px 0;">
                                Lembrando que essa etapa é muito importante do nosso gerenciador financeiro para mantermos a segurança dos seus dados e cumprirmos nosso compromisso com você.
                            </p>
                            <p style="margin:0 0 20px 0;">
                                Este código expira em <strong>{expiry} minutos</strong>. Se você não solicitou o código, não o utilize e ignore.
                            </p>
                            <p style="margin:28px 0 4px 0;">Abraços,</p>
                            <p style="margin:0;font-weight:700;color:#1a1a1a;">
                                Equipe MoneyHub <span style="color:#00cc66;">&#x1F49A;</span>
                            </p>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding:20px 40px 28px 40px;border-top:1px solid #eef0f2;text-align:center;color:#9aa0a6;font-size:12px;line-height:1.5;">
                            Este é um email automático, não responda a esta mensagem.<br>
                            &copy; 2025 MoneyHub &middot; Centro de Controle Financeiro
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>"""
    
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
        expiry = self.settings.email_verification_expiry_minutes

        return f"""<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Redefinir senha - MoneyHub</title>
</head>
<body style="margin:0;padding:0;background-color:#f0f2f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color:#f0f2f5;padding:32px 16px;">
        <tr>
            <td align="center">
                <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="560" style="max-width:560px;width:100%;background-color:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.08);">
                    <tr>
                        <td align="center" style="background-color:#013a56;padding:28px 24px;">
                            <span style="font-family:'Segoe UI',Helvetica,Arial,sans-serif;font-size:28px;font-weight:700;color:#ffffff;letter-spacing:-0.5px;">
                                Money<span style="color:#00cc66;">Hub</span>
                            </span>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding:40px 40px 32px 40px;color:#3d3d3d;font-size:16px;line-height:1.6;">
                            <p style="margin:0 0 20px 0;">Olá,</p>
                            <p style="margin:0 0 20px 0;">
                                Recebemos uma solicitação para redefinir a senha da sua conta no gerenciador financeiro MoneyHub. &#x1F510;
                            </p>
                            <p style="margin:0 0 28px 0;">
                                Para criar uma nova senha, clique no botão abaixo:
                            </p>
                            <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin:0 0 32px 0;">
                                <tr>
                                    <td align="center">
                                        <a href="{reset_url}" style="display:inline-block;background-color:#00cc66;color:#ffffff;text-decoration:none;font-weight:700;font-size:16px;padding:14px 36px;border-radius:6px;">
                                            Redefinir senha
                                        </a>
                                    </td>
                                </tr>
                            </table>
                            <p style="margin:0 0 8px 0;font-size:14px;color:#6b7280;">
                                Se o botão não funcionar, copie e cole o link abaixo no seu navegador:
                            </p>
                            <p style="margin:0 0 28px 0;font-size:13px;word-break:break-all;color:#013a56;background-color:#f6f8fa;padding:12px 14px;border-radius:6px;border:1px solid #eef0f2;">
                                {reset_url}
                            </p>
                            <p style="margin:0 0 20px 0;">
                                Lembrando que essa etapa é muito importante para mantermos a segurança dos seus dados e cumprirmos nosso compromisso com você.
                            </p>
                            <p style="margin:0 0 20px 0;">
                                Este link expira em <strong>{expiry} minutos</strong>. Se você não solicitou a redefinição, ignore este email com segurança.
                            </p>
                            <p style="margin:28px 0 4px 0;">Abraços,</p>
                            <p style="margin:0;font-weight:700;color:#1a1a1a;">
                                Equipe MoneyHub <span style="color:#00cc66;">&#x1F49A;</span>
                            </p>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding:20px 40px 28px 40px;border-top:1px solid #eef0f2;text-align:center;color:#9aa0a6;font-size:12px;line-height:1.5;">
                            Este é um email automático, não responda a esta mensagem.<br>
                            &copy; 2025 MoneyHub &middot; Centro de Controle Financeiro
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>"""
    
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