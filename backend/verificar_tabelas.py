import urllib.parse
from sqlalchemy import create_engine, inspect

# Configurações (Mesmas do seu projeto)
DB_USER = "postgres"
DB_PASS = urllib.parse.quote_plus("131295Felipe@")
DB_HOST = "localhost"
DB_PORT = "5432"
DB_NAME = "central_controle_fogo"

DATABASE_URI = f'postgresql://{DB_USER}:{DB_PASS}@{DB_HOST}:{DB_PORT}/{DB_NAME}'

try:
    engine = create_engine(DATABASE_URI)
    inspector = inspect(engine)
    
    print("=== Colunas na tabela 'address' ===")
    columns = inspector.get_columns('address')
    for column in columns:
        print(f"- {column['name']} ({column['type']})")
        
except Exception as e:
    print(f"Erro ao conectar: {e}")