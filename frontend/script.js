// Variáveis globais para as instâncias dos gráficos
let chartNatureza = null
let chartBairros = null
let chartVitimas = null

// Paleta de cores oficial (Tons de Azul/Cinza + Destaque Laranja para Bombeiros)
const paletaCores = [
  "#40516c",
  "#e67e22",
  "#2ecc71",
  "#e74c3c",
  "#95a5a6",
  "#34495e",
]

// --- 1. Carregar Dashboard Operacional ---
async function carregarDashboard() {
  try {
    // Chama o endpoint novo que criamos (processamento no backend)
    const response = await fetch("http://127.0.0.1:5000/api/dashboard/stats")
    const stats = await response.json()

    // Atualiza o KPI (Número grande)
    document.getElementById("kpiTotal").innerText = stats.kpi_total

    // Renderiza os gráficos
    renderizarGraficoNatureza(stats.natureza_ocorrencias)
    renderizarGraficoBairros(stats.top_bairros)
    renderizarGraficoVitimas(stats.situacao_vitimas)
  } catch (error) {
    console.error("Erro ao carregar dashboard:", error)
    alert(
      "Erro ao conectar com o servidor. Verifique se o app.py está rodando."
    )
  }
}

// Gráfico 1: Natureza (Rosca) - Mostra o tipo de demanda (Incêndio vs Resgate)
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
              let label = context.label || ""
              let value = context.raw
              let total = context.chart._metasets[context.datasetIndex].total
              let percentage = ((value / total) * 100).toFixed(1) + "%"
              return `${label}: ${value} (${percentage})`
            },
          },
        },
      },
    },
  })
}

// Gráfico 2: Bairros (Barras Horizontais) - Mostra onde posicionar viaturas
function renderizarGraficoBairros(dados) {
  const ctx = document.getElementById("graficoBairros").getContext("2d")

  if (chartBairros) chartBairros.destroy()

  chartBairros = new Chart(ctx, {
    type: "bar",
    indexAxis: "y", // Faz as barras ficarem horizontais
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
      plugins: {
        legend: { display: false },
      },
      scales: {
        x: { beginAtZero: true },
      },
    },
  })
}

// Gráfico 3: Vítimas (Barra Vertical) - Mostra gravidade
function renderizarGraficoVitimas(dados) {
  const ctx = document.getElementById("graficoVitimas").getContext("2d")

  if (chartVitimas) chartVitimas.destroy()

  chartVitimas = new Chart(ctx, {
    type: "bar",
    data: {
      labels: dados.labels, // "Com Vítimas", "Sem Vítimas"
      datasets: [
        {
          label: "Ocorrências",
          data: dados.series,
          backgroundColor: ["#e74c3c", "#2ecc71"], // Vermelho para vítimas, Verde para sem
          barThickness: 50,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
      },
      scales: {
        y: { beginAtZero: true },
      },
    },
  })
}

// --- 2. Lógica do Formulário de Predição (IA) ---
// Mantemos isso separado do dashboard, pois é interativo
async function carregarOpcoes() {
            try {
                const res = await fetch('http://127.0.0.1:5000/api/opcoes');
                const data = await res.json();
                
                // --- DEBUG: Vamos ver o que o Python mandou ---
                console.log("Dados recebidos do Python:", data); 

                // GÊNERO (Verifique se aqui está 'generoRadios')
                const generoDiv = document.getElementById('generoRadios');
                if (generoDiv) {
                    generoDiv.innerHTML = '';
                    
                    // SE O PYTHON MANDAR 'generos'
                    if (data.generos) {
                        data.generos.forEach((opt, i) => {
                            generoDiv.innerHTML += `
                                <label class="radio-item" style="margin-right:10px;">
                                    <input type="radio" name="genero" value="${opt}" ${i===0?'checked':''}> ${opt}
                                </label>`;
                        });
                    } 
                    // SE O PYTHON AINDA ESTIVER MANDANDO 'etnias' (Fallback para não quebrar)
                    else if (data.etnias) {
                         generoDiv.innerHTML = "<small style='color:red'>Backend desatualizado (recebendo etnias)</small>";
                    }
                }

                // LOCALIZAÇÃO
                const localDiv = document.getElementById('localizacaoRadios');
                if (localDiv && data.locais) {
                    localDiv.innerHTML = '';
                    data.locais.forEach((opt, i) => {
                        localDiv.innerHTML += `
                            <label class="radio-item" style="margin-right:10px;">
                                <input type="radio" name="localizacao" value="${opt}" ${i===0?'checked':''}> ${opt}
                            </label>`;
                    });
                }

            } catch (error) {
                console.error("Erro ao carregar opções:", error);
            }
        }