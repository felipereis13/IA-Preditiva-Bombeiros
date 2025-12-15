const isLocalhost =
  window.location.hostname === "localhost" ||
  window.location.hostname === "127.0.0.1"

// SEU LINK DO RENDER AQUI 👇 (Copie o link que o Render gerou para o seu Backend)
const RENDER_API_URL = "https://ia-preditiva-bombeirosccf.onrender.com"

const API_BASE_URL = isLocalhost ? "http://127.0.0.1:5000" : RENDER_API_URL

console.log(`Modo: ${isLocalhost ? "LOCAL 🏠" : "NUVEM ☁️"}`)
console.log(`Conectando na API: ${API_BASE_URL}`)

// --- VARIÁVEIS GLOBAIS ---
let chartNatureza = null
let chartBairros = null
let chartVitimas = null

// Paleta de cores oficial
const paletaCores = [
  "#40516c",
  "#e67e22",
  "#2ecc71",
  "#e74c3c",
  "#95a5a6",
  "#34495e",
]
const cores = { vermelho: "#b13433", laranja: "#e67e22" } // Auxiliar para mensagens

// --- 1. CARREGAR DASHBOARD OPERACIONAL ---
async function carregarDashboard() {
  try {
    // Agora usa a variável dinâmica API_BASE_URL
    const response = await fetch(`${API_BASE_URL}/api/dashboard/stats`)

    if (!response.ok) throw new Error("Falha na resposta da API")

    const stats = await response.json()

    // Atualiza o KPI
    document.getElementById("kpiTotal").innerText = stats.kpi_total

    // Renderiza os gráficos
    renderizarGraficoNatureza(stats.natureza_ocorrencias)
    renderizarGraficoBairros(stats.top_bairros)
    renderizarGraficoVitimas(stats.situacao_vitimas)
  } catch (error) {
    console.error("Erro ao carregar dashboard:", error)
    document.getElementById("kpiTotal").innerText = "-"
    // Não usamos alert para não travar a tela do usuário na primeira carga
  }
}

// --- GRÁFICOS (Chart.js) ---

function renderizarGraficoNatureza(dados) {
  const ctx = document.getElementById("graficoNatureza").getContext("2d")
  if (chartNatureza) chartNatureza.destroy()

  chartNatureza = new Chart(ctx, {
    type: "doughnut",
    data: {
      labels: dados.labels,
      datasets: [
        {
          data: dados.series,
          backgroundColor: paletaCores,
          borderWidth: 1,
        },
      ],
    },
    options: {
      responsive: true,
      plugins: { legend: { position: "bottom" } }, // Legenda embaixo fica melhor no mobile
    },
  })
}

function renderizarGraficoBairros(dados) {
  const ctx = document.getElementById("graficoBairros").getContext("2d")
  if (chartBairros) chartBairros.destroy()

  chartBairros = new Chart(ctx, {
    type: "bar",
    indexAxis: "y",
    data: {
      labels: dados.labels,
      datasets: [
        {
          label: "Chamados",
          data: dados.series,
          backgroundColor: "#b13433", // Vermelho Bombeiro
          borderRadius: 4,
        },
      ],
    },
    options: {
      responsive: true,
      plugins: { legend: { display: false } },
    },
  })
}

function renderizarGraficoVitimas(dados) {
  const ctx = document.getElementById("graficoVitimas").getContext("2d")
  if (chartVitimas) chartVitimas.destroy()

  chartVitimas = new Chart(ctx, {
    type: "bar",
    data: {
      labels: dados.labels,
      datasets: [
        {
          label: "Ocorrências",
          data: dados.series,
          backgroundColor: ["#e74c3c", "#2ecc71"],
          barThickness: 50,
        },
      ],
    },
    options: {
      responsive: true,
      plugins: { legend: { display: false } },
    },
  })
}

// --- 2. LÓGICA DA IA PREDITIVA ---

async function carregarOpcoes() {
  try {
    const res = await fetch(`${API_BASE_URL}/api/opcoes`)
    const data = await res.json()

    // GÊNERO
    const generoDiv = document.getElementById("generoRadios")
    if (generoDiv && data.generos) {
      generoDiv.innerHTML = ""
      data.generos.forEach((opt, i) => {
        generoDiv.innerHTML += `
          <label class="radio-item" style="margin-right:10px;">
            <input type="radio" name="genero" value="${opt}" ${
          i === 0 ? "checked" : ""
        }> ${opt}
          </label>`
      })
    }

    // LOCALIZAÇÃO
    const localDiv = document.getElementById("localizacaoRadios")
    if (localDiv && data.locais) {
      localDiv.innerHTML = ""
      data.locais.forEach((opt, i) => {
        localDiv.innerHTML += `
          <label class="radio-item" style="margin-right:10px;">
            <input type="radio" name="localizacao" value="${opt}" ${
          i === 0 ? "checked" : ""
        }> ${opt}
          </label>`
      })
    }
  } catch (error) {
    console.error("Erro ao carregar opções:", error)
    document.getElementById("generoRadios").innerHTML = "Erro ao carregar."
  }
}

// Evento de Envio do Formulário (Botão Prever)
const formPredizer = document.getElementById("form-predizer")
if (formPredizer) {
  formPredizer.onsubmit = async function (e) {
    e.preventDefault()
    const resDiv = document.getElementById("resultado")
    resDiv.innerHTML = "Calculando probabilidade... 🧠"

    const generoInput = document.querySelector('input[name="genero"]:checked')
    const localInput = document.querySelector(
      'input[name="localizacao"]:checked'
    )
    const idadeInput = document.getElementById("idade")

    if (!generoInput || !localInput) {
      resDiv.innerHTML = "Aguarde o carregamento das opções."
      return
    }

    const dados = {
      genero: generoInput.value,
      localizacao: localInput.value,
      idade: parseInt(idadeInput.value),
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/predizer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dados),
      })
      const result = await response.json()

      if (result.classe_predita) {
        const prob = (result.confianca * 100).toFixed(1)
        resDiv.innerHTML = `
          <h3 style="color: ${cores.vermelho}; margin:0;">${
          result.classe_predita
        }</h3>
          <p>Probabilidade: <strong>${prob}%</strong></p>
          <small style="color: ${cores.laranja};">${result.aviso || ""}</small>
        `
      } else {
        resDiv.innerHTML = `<span style="color:red">Erro: ${result.erro}</span>`
      }
    } catch (error) {
      resDiv.innerHTML = "Erro de conexão com o servidor."
    }
  }
}

// --- INICIALIZAÇÃO ---
window.onload = function () {
  carregarDashboard()
  carregarOpcoes()
}
