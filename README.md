# Dashboard SPA com Flask, PostgreSQL e Random Forest

Este projeto é uma aplicação web desenvolvida para o Centro de Controle do Corpo de Bombeiros (CBMPE). Ele consiste em um dashboard operacional para monitoramento de ocorrências em tempo real e um módulo de Inteligência Artificial para predição da natureza de incidentes.

A aplicação utiliza Python (Flask) no backend, integrando-se a um banco de dados PostgreSQL já existente (populado via Java/Spring Boot). O frontend é uma SPA (Single Page Application) que consome dados via API e exibe indicadores estratégicos.

---

## 🔍 Funcionalidades

-Dashboard Operacional:
  -KPI em Tempo Real: Exibe o total de ocorrências registradas no banco.
  -Gráfico de Natureza: Distribuição percentual dos chamados (ex: Incêndio, Salvamento, APH).
  -Top 5 Bairros: Gráfico de barras indicando as áreas com maior demanda (para alocação estratégica de viaturas).
  -Situação de Vítimas: Comparativo entre ocorrências com e sem vítimas.

-Módulo de Inteligência Artificial:
  -Utiliza um modelo Random Forest Classifier (Scikit-learn).
  -Simulação Preditiva: O usuário insere o Gênero, Idade e Localização (Bairro).
  -Resultado: O sistema retorna a Classificação provável (Tipo: Subtipo) e o nível de confiança (probabilidade) da previsão.

-Integração de Dados:
  -O sistema lê automaticamente os bairros e tipos de ocorrência cadastrados no banco PostgreSQL para manter os formulários sempre atualizados.

---

## 🛠 Tecnologias utilizadas

- **Python + Flask** (API backend)
- **PostgreSQL** (banco de dados)
- **Random Forest** (modelo de aprendizado de máquina)
- **Chart.js + HTML/CSS/JavaScript** (frontend SPA)
- **Pandas e scikit-learn** (tratamento de dados e modelagem)

---

## ▶️ Como rodar

1. Clone o repositório:

```bash
git clone https://github.com/seu-usuario/seu-repo.git](https://github.com/felipereis13/IA-Preditiva-Bombeiros.git
cd seu-repo
```

2. Instale os pacotes:

```bash
python -m venv venv
source venv/Scripts/activate  # No Windows: venv\Scripts\activate
pip install -r requirements.txt
```

3. Inicie o PostgreSQL (localmente ou em nuvem), depois rode a API Flask:

```bash
python train_model.py
```

```bash
python app.py
```
4. Abra o arquivo `index.html` no navegador (a SPA se conecta à API Flask automaticamente).

---

## 📦 Sobre o Modelo de IA

Na parte inferior da interface, há uma caixa onde você pode selecionar o **Gênero**, **localização** e informar a **idade** da vítima.  
Ao clicar em "Prever", o sistema utiliza o modelo Random Forest treinado para indicar o tipo de caso mais provável para aquele perfil.

---

## 📁 Exemplo de dado no PostgreSQL

```json
{
  "kpi_total": 50,
  "natureza_ocorrencias": {
    "labels": ["INCÊNDIO", "SALVAMENTO", "ATENDIMENTO PRÉ-HOSPITALAR"],
    "series": [12, 15, 23]
  },
  "top_bairros": {
    "labels": ["Centro", "Boa Viagem", "Madalena", "Casa Amarela", "Pina"],
    "series": [10, 8, 5, 4, 3]
  },
  "situacao_vitimas": {
    "labels": ["Com Vítimas", "Sem Vítimas"],
    "series": [20, 30]
  }
}
```

---

## 🔎 Endpoints da API

- `GET /api/dashboard/stats` → Retorna todos os dados para os gráficos (KPIs, Top Bairros, Natureza).
- `GET /api/opcoes` → Retorna a lista de Bairros (em ordem alfabética) e Gêneros para o formulário.
- `GET /api/casos` → Retorna a lista bruta de ocorrências.
- `POST /api/predizer` → Recebe JSON com {idade, genero, localizacao} e retorna a previsão.

---

## 📊 Sobre o Modelo de IA (Random Forest)

O sistema utiliza o algoritmo **Random Forest Classifier** (da biblioteca Scikit-learn) para realizar a classificação supervisionada das ocorrências.
O Random Forest foi escolhido porque ele é mais seguro, estável e fácil de implementar para o estágio atual do seu projeto, garantindo que o dashboard funcione sem erros de predição muito discrepante.

### Como funciona o treinamento (`train_model.py`):
1.  **Conexão Real:** O script conecta ao PostgreSQL para extrair os **Bairros** e **Tipos de Ocorrência** reais existentes no sistema legado.
2.  **Enriquecimento de Dados:** Como o banco de dados original (Java) não armazena dados demográficos detalhados das vítimas, o script gera um dataset sintético combinando os bairros reais com **Gêneros** e **Idades** simulados.
3.  **Serialização:** O modelo treinado é salvo no arquivo `model.pkl` usando `pickle`, pronto para ser consumido pela API.

### Variáveis utilizadas na previsão:
- **Localização (Bairro):** Variável categórica (One-Hot Encoded).
- **Gênero:** Variável categórica (Masculino/Feminino).
- **Idade:** Variável numérica.

---

## ⚠️ Observações e Configuração

- **Frontend:** A SPA (`index.html`) não requer servidor web (Apache/Nginx) para desenvolvimento; basta abri-la diretamente no navegador, pois ela consome a API via CORS.
- **Backend:** A API Flask deve estar rodando localmente em `http://localhost:5000`.
- **Banco de Dados:** O projeto depende de uma instância **PostgreSQL** rodando na porta `5432`.
  - A string de conexão no `app.py` deve apontar para o banco `central_controle_fogo`.
  - É necessário que o banco já tenha sido populado pela aplicação Spring Boot (Java) para que os bairros e tipos de ocorrência estejam disponíveis.
---
## 🧑‍💻 Autor

Desenvolvido por [Felipe Reis](https://github.com/felipereis13).  
Este projeto é livre para fins estritamente educacionais, mas não experimentais.
