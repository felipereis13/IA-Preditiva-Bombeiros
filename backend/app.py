
from flask import Flask, jsonify, request, abort
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.orm import joinedload
from sqlalchemy import func
from datetime import datetime
import pickle
import pandas as pd
import os
import urllib.parse

# Tratamento para joblib
try:
    from joblib import load
except ImportError:
    import pickle as load

app = Flask(__name__)
CORS(app)

# --- Configuração do Banco PostgreSQL ---
DB_USER = "app_user"
DB_PASS = urllib.parse.quote_plus("7JZDOx3mZhIJDrGisvmU354b1WHYixiv")
DB_HOST = "dpg-d4totfnpm1nc73cahejg-a.oregon-postgres.render.com"
DB_PORT = "5432"
DB_NAME = "central_controle_fogo_7sp0"

app.config['SQLALCHEMY_DATABASE_URI'] = f'postgresql://{DB_USER}:{DB_PASS}@{DB_HOST}:{DB_PORT}/{DB_NAME}'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)

# --- Models ---

class OccurrenceNature(db.Model):
    __tablename__ = 'occurrence_nature'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String)

class OccurrenceType(db.Model):
    __tablename__ = 'occurrence_type'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String)
    nature_id = db.Column(db.Integer, db.ForeignKey('occurrence_nature.id'))
    nature = db.relationship("OccurrenceNature")

class OccurrenceSubType(db.Model):
    __tablename__ = 'occurrence_sub_type'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String)
    occurrence_type_id = db.Column(db.Integer, db.ForeignKey('occurrence_type.id'))
    type = db.relationship("OccurrenceType")

class Address(db.Model):
    __tablename__ = 'address'
    id = db.Column(db.Integer, primary_key=True)
    district = db.Column("neighborhood", db.String) 
    city = db.Column(db.String)

class Occurrence(db.Model):
    __tablename__ = 'occurrence'
    id = db.Column(db.Integer, primary_key=True)
    occurrence_arrival_time = db.Column(db.TIMESTAMP(timezone=True))
    occurrence_details = db.Column(db.String)
    occurrence_has_victims = db.Column(db.Boolean)
    occurrence_sub_type_id = db.Column(db.Integer, db.ForeignKey('occurrence_sub_type.id'))
    address_id = db.Column(db.Integer, db.ForeignKey('address.id')) 
    sub_type = db.relationship("OccurrenceSubType")
    address = db.relationship("Address")

    def to_dict_compativel(self):
        data_iso = self.occurrence_arrival_time.isoformat() if self.occurrence_arrival_time else datetime.now().isoformat()
        tipo_str = self.sub_type.name if self.sub_type else "Desconhecido"
        local_str = self.address.district if self.address else "Desconhecido"
        return {
            "id": self.id,
            "data_do_caso": data_iso,
            "tipo_do_caso": tipo_str,
            "localizacao": local_str,
            "detalhes": self.occurrence_details,
            "vitima": { "etnia": "N/A", "idade": 0, "tem_vitima": self.occurrence_has_victims }
        }

# --- Rotas ---

@app.route('/api/casos', methods=['GET'])
def listar_casos():
    ocorrencias = db.session.query(Occurrence).options(joinedload(Occurrence.sub_type), joinedload(Occurrence.address)).all()
    return jsonify([o.to_dict_compativel() for o in ocorrencias]), 200

@app.route('/api/opcoes', methods=['GET'])
def opcoes():
    locais = [r[0] for r in db.session.query(Address.district).distinct().order_by(Address.district).all() if r[0]]
    tipos = [r[0] for r in db.session.query(OccurrenceSubType.name).distinct().all() if r[0]]
    return jsonify({ "generos": ["Masculino", "Feminino"], "etnias": [], "locais": locais, "tipos": tipos })

@app.route('/api/predizer', methods=['POST'])
def predizer():
    try:
        if not os.path.exists("model.pkl"): raise FileNotFoundError("Modelo não encontrado")
        with open("model.pkl", "rb") as f:
             data_pkl = pickle.load(f)
             modelo = data_pkl["pipeline"]
             label_encoder = data_pkl["label_encoder"]
    except Exception as e: return jsonify({"erro": str(e)}), 500

    dados = request.get_json()
    if not dados: return jsonify({"erro": "Sem dados"}), 400
    try:
        df = pd.DataFrame([dados])
        if 'idade' not in df.columns: df['idade'] = 30 
        if 'genero' not in df.columns: df['genero'] = 'Masculino' 
        
        y_prob = modelo.predict_proba(df)[0]
        y_pred_subtipo = label_encoder.inverse_transform([modelo.predict(df)[0]])[0]
        
        # Confiança
        maior_prob = max(y_prob)

        # Formatação Tipo: Subtipo
        sub_obj = db.session.query(OccurrenceSubType).options(joinedload(OccurrenceSubType.type)).filter_by(name=y_pred_subtipo).first()
        nome_final = f"{sub_obj.type.name}: {y_pred_subtipo}" if (sub_obj and sub_obj.type) else y_pred_subtipo

        return jsonify({ "classe_predita": nome_final, "confianca": float(maior_prob), "aviso": "Simulação feita por IA" }), 200
    except Exception as e: return jsonify({"erro": str(e)}), 500

@app.route('/api/dashboard/stats', methods=['GET'])
def dashboard_stats():
    session = db.session
    dist_natureza = (session.query(OccurrenceNature.name, func.count(Occurrence.id))
        .join(OccurrenceType, OccurrenceNature.id == OccurrenceType.nature_id)
        .join(OccurrenceSubType, OccurrenceType.id == OccurrenceSubType.occurrence_type_id)
        .join(Occurrence, OccurrenceSubType.id == Occurrence.occurrence_sub_type_id)
        .group_by(OccurrenceNature.name).all())
    
    top_bairros = (session.query(Address.district, func.count(Occurrence.id))
        .join(Occurrence, Address.id == Occurrence.address_id)
        .group_by(Address.district).order_by(func.count(Occurrence.id).desc()).limit(5).all())

    com_vitima = session.query(Occurrence).filter_by(occurrence_has_victims=True).count()
    sem_vitima = session.query(Occurrence).filter_by(occurrence_has_victims=False).count()
    total = session.query(Occurrence).count()

    return jsonify({
        "natureza_ocorrencias": {"labels": [r[0] for r in dist_natureza], "series": [r[1] for r in dist_natureza]},
        "top_bairros": {"labels": [r[0] for r in top_bairros], "series": [r[1] for r in top_bairros]},
        "situacao_vitimas": {"labels": ["Com Vítimas", "Sem Vítimas"], "series": [com_vitima, sem_vitima]},
        "kpi_total": total
    }), 200

if __name__ == "__main__":
    app.run(debug=True, port=5000)