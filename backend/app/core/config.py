from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import List

class Settings(BaseSettings):
    PROJECT_NAME: str = "GAARA-II: Dashboard Inteligente e Alerta Precoce de Dengue"
    API_V1_STR: str = "/api/v1"
    USE_MOCK_DATA: bool = True
    CORS_ORIGINS: List[str] = [
        "http://localhost:4200",
        "http://127.0.0.1:4200",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "*"
    ]
    DATA_DIR: str = "app/mocks/data"
    
    model_config = SettingsConfigDict(case_sensitive=True)

settings = Settings()
