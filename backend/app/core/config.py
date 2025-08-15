from typing import List

from pydantic import AliasChoices, Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    # Configurações do Banco de Dados
    db_host: str = Field(
        default="127.0.0.1",
        description="Host do banco de dados",
        validation_alias=AliasChoices("DB_HOST", "db_host"),
    )
    db_port: int = Field(
        default=3306,
        description="Porta do banco de dados",
        validation_alias=AliasChoices("DB_PORT", "db_port"),
    )
    db_user: str = Field(
        default="root",
        description="Usuário do banco de dados",
        validation_alias=AliasChoices("DB_USER", "db_user"),
    )
    db_password: str = Field(
        default="Jae66yrr@",
        description="Senha do banco de dados",
        validation_alias=AliasChoices("DB_PASSWORD", "db_password"),
    )
    db_name: str = Field(
        default="moneyhub",
        description="Nome do banco de dados",
        validation_alias=AliasChoices("DB_NAME", "db_name"),
    )
    
    # URL de conexão construída a partir das variáveis individuais
    @property
    def database_url(self) -> str:
        # Faz o escape da senha para evitar problemas com caracteres especiais
        from urllib.parse import quote_plus
        password_escaped = quote_plus(self.db_password)
        return f"mysql+pymysql://{self.db_user}:{password_escaped}@{self.db_host}:{self.db_port}/{self.db_name}?charset=utf8mb4"
    
    # Configurações JWT
    jwt_secret_key: str = Field(
        default="CHANGE_ME",
        description="Chave secreta JWT",
        validation_alias=AliasChoices("JWT_SECRET", "jwt_secret_key"),
    )
    jwt_algorithm: str = Field(
        default="HS256",
        description="Algoritmo JWT",
        validation_alias=AliasChoices("JWT_ALGORITHM", "jwt_algorithm"),
    )
    access_token_expire_minutes: int = Field(
        default=60,
        description="Minutos para expiração do access token",
        validation_alias=AliasChoices("JWT_EXPIRATION_MINUTES", "access_token_expire_minutes"),
    )
    jwt_refresh_secret: str = Field(
        default="CHANGE_ME",
        description="Chave secreta para refresh token",
        validation_alias=AliasChoices("JWT_REFRESH_SECRET", "jwt_refresh_secret"),
    )
    jwt_refresh_expiration_days: int = Field(
        default=7,
        description="Dias para expiração do refresh token",
        validation_alias=AliasChoices("JWT_REFRESH_EXPIRATION_DAYS", "jwt_refresh_expiration_days"),
    )
    
    # Configurações de Ambiente
    app_env: str = Field(
        default="development", 
        description="Ambiente da aplicação",
        validation_alias=AliasChoices("ENVIRONMENT", "app_env")
    )
    debug: bool = Field(
        default=True, 
        description="Modo debug",
        validation_alias=AliasChoices("DEBUG", "debug")
    )
    
    # Configurações CORS
    cors_origins: str = Field(
        default="http://localhost:3000,http://127.0.0.1:3000",
        description="Origens permitidas para CORS (separadas por vírgula)",
        validation_alias=AliasChoices("CORS_ORIGINS", "cors_origins"),
    )
    
    # Configurações de Cookies
    cookie_secure: bool = Field(
        default=False,
        description="Cookies seguros (HTTPS)",
        validation_alias=AliasChoices("COOKIE_SECURE", "cookie_secure"),
    )
    cookie_samesite: str = Field(
        default="none",
        description="Configuração SameSite dos cookies",
        validation_alias=AliasChoices("COOKIE_SAMESITE", "cookie_samesite"),
    )
    cookie_domain: str = Field(
        default="http://localhost:3000,http://127.0.0.1:3000",
        description="Domínios permitidos para cookies (separados por vírgula)",
        validation_alias=AliasChoices("COOKIE_DOMAIN", "cookie_domain"),
    )
    
    # Configurações de Segurança
    security_cookies_enabled: bool = Field(
        default=False,
        description="Habilitar cookies de segurança",
        validation_alias=AliasChoices("SECURITY_COOKIES_ENABLED", "security_cookies_enabled"),
    )
    refresh_from_cookie: bool = Field(
        default=False,
        description="Usar refresh token de cookie",
        validation_alias=AliasChoices("REFRESH_FROM_COOKIE", "refresh_from_cookie"),
    )
    csrf_enforce: bool = Field(
        default=False,
        description="Forçar proteção CSRF",
        validation_alias=AliasChoices("CSRF_ENFORCE", "csrf_enforce"),
    )
    
    # Configurações de Hosts
    trusted_hosts: str = Field(
        default="localhost,127.0.0.1",
        description="Hosts confiáveis (separados por vírgula)",
        validation_alias=AliasChoices("TRUSTED_HOSTS", "trusted_hosts"),
    )
    
    # Configurações de Debug
    debug_routes_enabled: bool = Field(
        default=False,
        description="Habilitar rotas de debug",
        validation_alias=AliasChoices("DEBUG_ROUTES_ENABLED", "debug_routes_enabled"),
    )
    
    # Configurações Google OAuth
    google_client_id: str = Field(
        default="",
        description="ID do cliente Google OAuth",
        validation_alias=AliasChoices("GOOGLE_CLIENT_ID", "google_client_id"),
    )
    google_client_secret: str = Field(
        default="",
        description="Segredo do cliente Google OAuth",
        validation_alias=AliasChoices("GOOGLE_CLIENT_SECRET", "google_client_secret"),
    )
    
    # URL do frontend para redirecionamentos
    frontend_url: str = Field(
        default="http://localhost:3000",
        description="URL do frontend para redirecionamentos OAuth",
        validation_alias=AliasChoices("FRONTEND_URL", "frontend_url"),
    )
    
    # Configurações de sessão (necessário para OAuth)
    session_secret_key: str = Field(
        default="",
        description="Chave secreta para sessões OAuth",
        validation_alias=AliasChoices("SESSION_SECRET_KEY", "session_secret_key"),
    )

    model_config = SettingsConfigDict(env_file=".env", env_ignore_empty=True, extra="ignore")

    @staticmethod
    def parse_origins(origins_value: str | List[str]) -> List[str]:
        if isinstance(origins_value, list):
            return origins_value
        if not origins_value:
            return []
        return [origin.strip() for origin in origins_value.split(",") if origin.strip()]


_cached_settings: Settings | None = None


def get_settings() -> Settings:
    global _cached_settings
    if _cached_settings is None:
        _cached_settings = Settings()
        # Normaliza CORS_ORIGINS quando passado como string via env
        _cached_settings.cors_origins = Settings.parse_origins(_cached_settings.cors_origins)
        # Normaliza COOKIE_DOMAIN quando passado como string via env
        _cached_settings.cookie_domain = Settings.parse_origins(_cached_settings.cookie_domain)
        # Normaliza TRUSTED_HOSTS quando passado como string via env
        _cached_settings.trusted_hosts = Settings.parse_origins(_cached_settings.trusted_hosts)
    return _cached_settings


