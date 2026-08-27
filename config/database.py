import os
from sqlalchemy import create_engine
from dotenv import load_dotenv

# Carrega variáveis do .env
load_dotenv()

def get_engine():
    """Cria e retorna a conexão com o banco a partir do .env"""
    user = os.getenv('DB_USER', 'postgres')
    password = os.getenv('DB_PASSWORD', '')
    host = os.getenv('DB_HOST', 'localhost')
    port = os.getenv('DB_PORT', '5432')
    name = os.getenv('DB_NAME', 'sinan_arboviroses')
    
    if not password:
        raise ValueError("DB_PASSWORD não está definido no arquivo .env")
    
    return create_engine(f'postgresql://{user}:{password}@{host}:{port}/{name}')
