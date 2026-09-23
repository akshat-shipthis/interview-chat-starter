from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env")

    mongo_url: str = "mongodb://localhost:27017"
    mongo_db: str = "interview"
    jwt_secret: str
    jwt_algorithm: str = "HS256"
    jwt_expire_minutes: int = 480
    frontend_origin: str = "http://localhost:4200"


settings = Settings()
