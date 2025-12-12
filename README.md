# Dashboard SPA com Flask, MongoDB e XGBoost

Este projeto é uma aplicação web do tipo **SPA (Single Page Application)** desenvolvida com **Flask**, **MongoDB** e **XGBoost** para análise e visualização de dados de ocorrências (como assaltos, agressões, etc.).

A aplicação permite inserir e consultar dados via API, além de treinar e visualizar os resultados de um modelo de machine learning XGBoost. Os dados são apresentados de forma interativa em uma página web única, com gráficos dinâmicos que ajudam na interpretação dos padrões registrados.

---

## 🔍 O que o projeto faz

- Permite **cadastrar e consultar ocorrências**, com informações da vítima (etnia e idade) e do tipo de caso.
- Treina um modelo **XGBoost** para avaliar a importância das variáveis na previsão do tipo de caso.
- Exibe gráficos interativos:
  - Gráfico de rosca com os tipos de caso.
  - Gráfico de barras com a distribuição de idades das vítimas.
  - Gráfico horizontal com a **importância das variáveis no modelo XGBoost**.
- Permite aplicar filtros por intervalo de datas diretamente na interface.
- **Inclui uma caixa de previsão de tipo de caso:**  
  Preencha etnia, localização e idade para prever automaticamente o tipo de caso mais provável, usando o modelo treinado.
- Interface totalmente SPA, sem recarregamento de página.

---

## 🛠 Tecnologias utilizadas

- **Python + Flask** (API backend)
- **MongoDB** (banco de dados)
- **XGBoost** (modelo de aprendizado de máquina)
- **Chart.js + HTML/CSS/JavaScript** (frontend SPA)
- **Pandas e scikit-learn** (tratamento de dados e modelagem)

---

## ▶️ Como rodar

1. Clone o repositório:

```bash
git clone https://github.com/seu-usuario/seu-repo.git](https://github.com/weltondionisio/SPA_dashboard_com_modelo_preditivo
cd seu-repo
```

2. Instale os pacotes:

```bash
python -m venv venv
source venv/bin/activate  # No Windows: venv\Scripts\activate
pip install -r requirements.txt
```

3. Inicie o MongoDB (localmente ou em nuvem), depois rode a API Flask:

```bash
python app.py
```

4. Abra o arquivo `index.html` no navegador (a SPA se conecta à API Flask automaticamente).

---

## 📦 Caixa de Previsão de Tipo de Caso

Na lateral da interface, há uma caixa onde você pode selecionar a **etnia**, **localização** e informar a **idade** da vítima.  
Ao clicar em "Prever", o sistema utiliza o modelo XGBoost treinado para indicar o tipo de caso mais provável para aquele perfil.

---

## 📁 Exemplo de dado no MongoDB

```json
{
  "data_do_caso": "2025-01-30",
  "tipo_do_caso": "Assalto",
  "localizacao": "Bairro A",
  "vitima": {
    "etnia": "Parda",
    "idade": 13
  }
}
```

---

## 🔎 Endpoints da API

- `GET /api/casos` → retorna todos os registros de casos.
- `POST /api/casos` → insere um novo caso no banco.
- `GET /api/modelo/coeficientes` → retorna a importância das variáveis no modelo XGBoost.
- `POST /api/predizer` → retorna a previsão do tipo de caso para os dados informados (usado pela caixa de previsão).

---

## 📊 Sobre o modelo XGBoost

O modelo é treinado com os dados disponíveis, utilizando variáveis como **etnia**, **idade da vítima**, **localização** e **data do caso**. O XGBoost gera uma métrica de importância para cada variável, e essas informações são exibidas graficamente na interface.

As importâncias são normalizadas de 0 a 1, e o modelo é salvo em disco com `joblib` para ser carregado automaticamente pela API.

---

## ⚠️ Observações

- A SPA (`index.html`) deve ser aberta diretamente no navegador.
- O backend Flask precisa estar rodando em `http://localhost:5000`.
- O MongoDB deve estar acessível em `localhost:27017`, ou o URI pode ser ajustado em `app.py`.

---

## ▶️ Demonstração em vídeo

Veja em: https://youtu.be/FC-pZBshDtM

## 🧑‍💻 Autor

Desenvolvido por [Welton Dionisio](https://github.com/weltondionisio).  
Este projeto é livre para fins estritamente educacionais, mas não experimentais.
