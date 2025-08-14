from typing import List

from pydantic import AliasChoices, Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    database_url: str = Field(
        default=(
            "mysql+pymysql://app_user:app_password@127.0.0.1:3306/financas?charset=utf8mb4"
        ),
        description="URL de conexão do banco MySQL",
        validation_alias=AliasChoices("DATABASE_URL", "database_url"),
    )
    jwt_secret_key: str = Field(
        default="CHANGE_ME",
        description="Chave secreta JWT",
        validation_alias=AliasChoices("JWT_SECRET_KEY", "jwt_secret_key"),
    )
    jwt_algorithm: str = Field(
        default="HS256",
        description="Algoritmo JWT",
        validation_alias=AliasChoices("JWT_ALGORITHM", "jwt_algorithm"),
    )
    access_token_expire_minutes: int = Field(
        default=60 * 24,
        description="Minutos para expiração do access token",
        validation_alias=AliasChoices("ACCESS_TOKEN_EXPIRE_MINUTES", "access_token_expire_minutes"),
    )

    cors_origins: List[str] = Field(
        default_factory=lambda: ["http://localhost:3000"],
        validation_alias=AliasChoices("CORS_ORIGINS", "cors_origins"),
    )
    cookie_secure: bool = Field(
        default=False,
        validation_alias=AliasChoices("COOKIE_SECURE", "cookie_secure"),
    )
    cookie_samesite: str = Field(
        default="lax",
        validation_alias=AliasChoices("COOKIE_SAMESITE", "cookie_samesite"),
    )
    app_env: str = Field(default="dev", validation_alias=AliasChoices("APP_ENV", "app_env"))
    debug: bool = Field(default=True, validation_alias=AliasChoices("DEBUG", "debug"))

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
        _cached_settings.cors_origins = Settings.parse_origins(_cached_settings.cors_origins)  # type: ignore[arg-type]
    return _cached_settings


