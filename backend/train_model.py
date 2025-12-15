
import pandas as pd
import numpy as np
import pickle
import urllib.parse
from sqlalchemy import create_engine, Column, Integer, String, ForeignKey
from sqlalchemy.orm import sessionmaker, relationship, declarative_base
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import OneHotEncoder, LabelEncoder
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
import random

# --- 1. Configuração do Banco de Dados ---
DB_USER = "app_user"
DB_PASS = urllib.parse.quote_plus("7JZDOx3mZhIJDrGisvmU354b1WHYixiv")
DB_HOST = "dpg-d4totfnpm1nc73cahejg-a.oregon-postgres.render.com"
DB_PORT = "5432"
DB_NAME = "central_controle_fogo_7sp0"

DATABASE_URI = f'postgresql://{DB_USER}:{DB_PASS}@{DB_HOST}:{DB_PORT}/{DB_NAME}'

Base = declarative_base()

# --- 2. Mapeamento das Tabelas ---
class OccurrenceNature(Base):
    __tablename__ = 'occurrence_nature'
    id = Column(Integer, primary_key=True)
    name = Column(String)

class OccurrenceType(Base):
    __tablename__ = 'occurrence_type'
    id = Column(Integer, primary_key=True)
    name = Column(String)
    nature_id = Column(Integer, ForeignKey('occurrence_nature.id'))

class OccurrenceSubType(Base):
    __tablename__ = 'occurrence_sub_type'
    id = Column(Integer, primary_key=True)
    name = Column(String)
    occurrence_type_id = Column(Integer, ForeignKey('occurrence_type.id'))

class Address(Base):
    __tablename__ = 'address'
    id = Column(Integer, primary_key=True)
    # Mapeia a coluna 'neighborhood' do banco para a variável 'district'
    district = Column("neighborhood", String)

class Occurrence(Base):
    __tablename__ = 'occurrence'
    id = Column(Integer, primary_key=True)
    occurrence_sub_type_id = Column(Integer, ForeignKey('occurrence_sub_type.id'))
    address_id = Column(Integer, ForeignKey('address.id'))
    
    sub_type = relationship("OccurrenceSubType")
    address = relationship("Address")

# --- 3. Extração e Geração de Dados ---
def carregar_dados_treinamento():
    print("Conectando ao PostgreSQL...")
    engine = create_engine(DATABASE_URI)
    Session = sessionmaker(bind=engine)
    session = Session()

    try:
        # Busca locais e tipos REAIS
        locais_reais = [r[0] for r in session.query(Address.district).distinct() if r[0]]
        tipos_reais = [r[0] for r in session.query(OccurrenceSubType.name).distinct() if r[0]]
        
        print(f"Encontrados {len(locais_reais)} bairros e {len(tipos_reais)} tipos de ocorrência.")

        if not locais_reais or not tipos_reais:
            raise ValueError("O banco de dados parece estar vazio. Rode o Java primeiro.")

        # --- GERAÇÃO COM GÊNERO ---
        generos_possiveis = ["Masculino", "Feminino"]
        dados = []

        print("Gerando dataset de treinamento simulado (com Gênero)...")
        for _ in range(1000):
            local = random.choice(locais_reais)
            idade = random.randint(18, 80)
            genero = random.choice(generos_possiveis) # Gera Masculino ou Feminino
            tipo = random.choice(tipos_reais)
            
            dados.append({
                "localizacao": local,
                "idade": idade,
                "genero": genero, # Adiciona a coluna 'genero' ao DataFrame
                "tipo_do_caso": tipo
            })
            
        return pd.DataFrame(dados)

    finally:
        session.close()

# --- 4. Treinamento do Modelo ---
def treinar():
    df = carregar_dados_treinamento()
    
    # Agora a coluna 'genero' existe no df, então não dará erro
    X = df[["idade", "genero", "localizacao"]]
    y = df["tipo_do_caso"]

    label_encoder = LabelEncoder()
    y_encoded = label_encoder.fit_transform(y)

    preprocessor = ColumnTransformer(
        transformers=[
            ('num', 'passthrough', ['idade']),
            # OneHotEncoder agora processa 'genero' e 'localizacao'
            ('cat', OneHotEncoder(handle_unknown='ignore'), ['genero', 'localizacao'])
        ]
    )

    modelo = Pipeline(steps=[
        ('preprocessor', preprocessor),
        ('classifier', RandomForestClassifier(n_estimators=100, random_state=42))
    ])

    print("Treinando o modelo...")
    modelo.fit(X, y_encoded)
    print("Modelo treinado com sucesso!")

    with open("model.pkl", "wb") as f:
        pickle.dump({
            "pipeline": modelo,
            "label_encoder": label_encoder
        }, f)
    
    print("Arquivo 'model.pkl' gerado com sucesso!")

if __name__ == "__main__":
    treinar()