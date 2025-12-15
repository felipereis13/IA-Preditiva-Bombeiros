// ================================
// Variáveis globais dos gráficos
// ================================
let chartNatureza = null
let chartBairros = null
let chartVitimas = null

// ================================
// Configuração base da API
// (mesma origem: localOTA local e Render)
// ================================
const API_BASE = ""

// ================================
// Paleta de cores (Bombeiros)
// ================================
const paletaCores = [
  "#40516c",
  "#e67e22",
  "#2ecc71",
  "#e74c3c",
  "#95a5a6",
  "#34495e",
]

// ================================
// 1. Dashboard Operacional
// ================================
async function carregarDashboard() {
  try {
    const response = await fetch(`${API_BASE}/api/dashboard/stats`)
    if (!response.ok) throw new Error("Erro ao buscar dados do dashboard")

    const stats = await response.json()

    // KPI
    document.getElementById("kpiTotal").innerText = stats.kpi_total

    // Gráficos
    renderizarGraficoNatureza(stats.natureza_ocorrencias)
    renderizarGraficoBairros(stats.top_bairros)
    renderizarGraficoVitimas(stats.situacao_vitimas)
  } catch (error) {
    console.error("Erro ao carregar dashboard:", error)
    alert("Erro ao carregar dados do dashboard.")
  }
}

// ================================
// Gráfico 1: Natureza (Rosca)
// ================================
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
      plugins: {
        legend: { position: "right" },
        tooltip: {
          callbacks: {
            label: function (context) {
              const label = context.label || ""
              const value = context.raw
              const total = context.chart._metasets[context.datasetIndex].total
              const percentage = ((value / total) * 100).toFixed(1) + "%"
              return `${label}: ${value} (${percentage})`
            },
          },
        },
      },
    },
  })
}

// ================================
// Gráfico 2: Bairros (Barras)
// ================================
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
          backgroundColor: "#40516c",
          borderRadius: 4,
        },
      ],
    },
    options: {
      responsive: true,
      plugins: { legend: { display: false } },
      scales: { x: { beginAtZero: true } },
    },
  })
}

// ================================
// Gráfico 3: Vítimas
// ================================
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
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: { y: { beginAtZero: true } },
    },
  })
}

// ================================
// 2. Formulário de Predição (IA)
// ================================
async function carregarOpcoes() {
  try {
    const res = await fetch(`${API_BASE}/api/opcoes`)
    if (!res.ok) throw new Error("Erro ao buscar opções")

    const data = await res.json()
    console.log("Opções recebidas:", data)

    // Gênero
    const generoDiv = document.getElementById("generoRadios")
    if (generoDiv && data.generos) {
      generoDiv.innerHTML = ""
      data.generos.forEach((opt, i) => {
        generoDiv.innerHTML += `
          <label class="radio-item" style="margin-right:10px;">
            <input type="radio" name="genero" value="${opt}" ${
          i === 0 ? "checked" : ""
        }>
            ${opt}
          </label>
        `
      })
    }

    // Localização
    const localDiv = document.getElementById("localizacaoRadios")
    if (localDiv && data.locais) {
      localDiv.innerHTML = ""
      data.locais.forEach((opt, i) => {
        localDiv.innerHTML += `
          <label class="radio-item" style="margin-right:10px;">
            <input type="radio" name="localizacao" value="${opt}" ${
          i === 0 ? "checked" : ""
        }>
            ${opt}
          </label>
        `
      })
    }
  } catch (error) {
    console.error("Erro ao carregar opções:", error)
  }
}

// ================================
// Inicialização automática
// ================================
document.addEventListener("DOMContentLoaded", () => {
  carregarDashboard()
  carregarOpcoes()
})
