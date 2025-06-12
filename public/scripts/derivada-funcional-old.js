// Elementos da interface
const btnDerivada = document.getElementById("btn-derivada")
const btnIntegralIndefinida = document.getElementById("btn-integral-indefinida")
const btnIntegralDefinida = document.getElementById("btn-integral-definida")
const limitesContainer = document.getElementById("limites-container")

// Oculta os limites ao carregar
document.addEventListener("DOMContentLoaded", () => {
  limitesContainer.classList.add("limites-hidden")
})

// Clique: derivada
btnDerivada.addEventListener("click", () => {
  limitesContainer.classList.add("limites-hidden")
  const inputFuncao = document.getElementById("funcao").value
  if (validaFuncao(inputFuncao)) {
    const { valor } = separaFuncao(inputFuncao)
    derivada(valor)
  }
})

// Clique: integral indefinida
btnIntegralIndefinida.addEventListener("click", () => {
  limitesContainer.classList.add("limites-hidden")
  const inputFuncao = document.getElementById("funcao").value
  if (validaFuncao(inputFuncao)) {
    const { valor } = separaFuncao(inputFuncao)
    integralIndefinida(valor)
  }
})

// Clique: integral definida
btnIntegralDefinida.addEventListener("click", () => {
  limitesContainer.classList.remove("limites-hidden")
  const inputFuncao = document.getElementById("funcao").value
  const valor = separaFuncao(inputFuncao).valor
  const a_val = parseFloat(document.getElementById("limite-a").value)
  const b_val = parseFloat(document.getElementById("limite-b").value)
  if (
    validaFuncao(inputFuncao) &&
    !isNaN(a_val) &&
    !isNaN(b_val)
  ) {
    integralDefinida(valor, a_val, b_val)
  }
})

// Funções auxiliares
function limpaFuncao() {
  const inputElemento = document.getElementById("funcao")
  const areaResposta = document.getElementById("resultado")
  inputElemento.value = ""
  areaResposta.innerHTML = "Função inválida. Tente novamente!"
}

function separaFuncao(funcaoCompleta) {
  if (funcaoCompleta.includes("=")) {
    const [nome, valor] = funcaoCompleta.split("=")
    return {
      nome: nome.trim(),
      valor: valor.trim()
    }
  } else {
    return {
      nome: "",
      valor: funcaoCompleta.trim()
    }
  }
}

function normalizaFuncao(funcao) {
  return funcao
    .replace(/x⁰/g, "x^0")
    .replace(/x¹/g, "x^1")
    .replace(/x²/g, "x^2")
    .replace(/x³/g, "x^3")
    .replace(/x⁴/g, "x^4")
    .replace(/x⁵/g, "x^5")
    .replace(/x⁶/g, "x^6")
    .replace(/x⁷/g, "x^7")
    .replace(/x⁸/g, "x^8")
    .replace(/x⁹/g, "x^9")
    .replace(/ln\(/g, "log(")
    .replace(/tg\(/g, "tan(")
    .replace(/e\^/g, "exp(")
}

function validaFuncao(inputFuncao) {
  const { valor } = separaFuncao(inputFuncao)
  const areaResposta = document.getElementById("resultado")
  if (!valor) {
    limpaFuncao()
    esconderGrafico();
    return false
  }
  try {
    const valorNormalizado = normalizaFuncao(valor)
    math.parse(valorNormalizado)
    areaResposta.innerHTML = ""
    return true
  } catch (e) {
    limpaFuncao()
    console.error("Erro de validação da função", e)
    return false
  }
}

function mostrarGrafico() {
  const graficoContainer = document.querySelector('.grafico-container');
  graficoContainer.style.display = 'block';
}

function esconderGrafico() {
  const graficoContainer = document.querySelector('.grafico-container');
  graficoContainer.style.display = 'none';
}

function derivada(expr) {
  const areaResposta = document.getElementById("resultado")
  try {
    const exprNormalizada = normalizaFuncao(expr)
    const node1 = math.parse(exprNormalizada)
    const derivada1 = math.derivative(node1, "x")
    const derivada1simp = math.simplify(derivada1)
    const derivada2 = math.derivative(derivada1, "x")
    const derivada2simp = math.simplify(derivada2)
    const strDeriv1 = derivada1simp.toString().trim()
    const strDeriv2 = derivada2simp.toString().trim()
    let html = `
      <strong>f(x) = ${exprNormalizada}</strong><br>
      f′(x) = ${strDeriv1}<br>
      f″(x) = ${strDeriv2}<br>
    `
    if (strDeriv1 === "0") {
      html += `<em>f′(x) ≡ 0 para todo x → sem pontos extremos distintos.</em>`
      areaResposta.innerHTML = html
      desenhaGrafico({
        exprs: [x => math.evaluate(exprNormalizada, { x })],
        cores: ["blue"],
        labels: ["f(x)"],
        titulo: "Função (derivada constante)"
      })
      return mostrarGrafico()
    }
    const f1 = x => { try { return math.evaluate(strDeriv1, { x }) } catch { return NaN } }
    const f2 = x => { try { return math.evaluate(strDeriv2, { x }) } catch { return NaN } }
    const pontosCriticos = []
    const passo = 0.1
    let anterior = f1(-10)
    for (let x = -10 + passo; x <= 10; x += passo) {
      const atual = f1(x)
      if (!isNaN(anterior) && !isNaN(atual)) {
        if (anterior * atual < 0) pontosCriticos.push(+(x - passo / 2).toFixed(3))
        if (Math.abs(atual) < 1e-6) pontosCriticos.push(+x.toFixed(3))
      }
      anterior = atual
    }
    if (pontosCriticos.length === 0) {
      html += `<em>Nenhum ponto crítico encontrado em [−10,10].</em>`
    } else {
      html += `<strong>Pontos críticos encontrados (aprox.):</strong><br>`
      pontosCriticos.forEach(xc => {
        const valSegunda = f2(xc)
        let tipo = ""
        if (isNaN(valSegunda)) tipo = "Não foi possível avaliar f″ neste ponto"
        else if (valSegunda > 0) tipo = "Mínimo local"
        else if (valSegunda < 0) tipo = "Máximo local"
        else tipo = "Ponto de inflexão (f″=0)"
        let valFx = "N/D"
        try {
          valFx = math.evaluate(exprNormalizada, { x: xc })
          valFx = +valFx.toFixed(3)
        } catch {}
        html += `x = ${xc}, f(x) ≈ ${valFx}, <em>${tipo}</em><br>`
      })
    }
    areaResposta.innerHTML = html
    desenhaGrafico({
      exprs: [
        x => math.evaluate(exprNormalizada, { x }),
        x => math.evaluate(strDeriv1, { x }),
        x => math.evaluate(strDeriv2, { x })
      ],
      cores: ["blue", "green", "red"],
      labels: ["f(x)", "f′(x)", "f″(x)"],
      titulo: "Função e Derivadas"
    })
    mostrarGrafico()
  } catch (e) {
    areaResposta.innerHTML = "Erro ao calcular a derivada. Verifique a sintaxe da função"
    console.error("Erro ao calcular a derivada", e)
  }
}

function integralIndefinida(expr) {
  const areaResposta = document.getElementById("resultado")
  try {
    const exprNormalizada = normalizaFuncao(expr)
    const resultadoAlgeb = Algebrite.run(`integral(${exprNormalizada}, x)`)
    areaResposta.innerHTML = `
      <strong>f(x) = ${exprNormalizada}</strong><br>
      ∫f(x)dx = ${resultadoAlgeb} + C
    `
    const primitiva = x => { try { return math.evaluate(resultadoAlgeb, { x }) } catch { return NaN } }
    const fGraf = x => math.evaluate(exprNormalizada, { x })
    desenhaGrafico({
      exprs: [fGraf, primitiva],
      cores: ["blue", "orange"],
      labels: ["f(x)", "∫f(x)dx"],
      titulo: "Função e Integral Indefinida"
    })
    mostrarGrafico()
  } catch (e) {
    areaResposta.innerHTML = "Erro ao calcular a integral indefinida. Verifique a sintaxe da função"
    console.error("Erro ao calcular a integral indefinida via Algebrite", e)
  }
}

function integralDefinida(expr, a, b, n = 1000) {
  const areaResposta = document.getElementById("resultado")
  try {
    const exprNormalizada = normalizaFuncao(expr)
    const fCalc = x => math.evaluate(exprNormalizada, { x })
    const h = (b - a) / n
    let soma = 0.5 * (fCalc(a) + fCalc(b))
    for (let i = 1; i < n; i++) soma += fCalc(a + i * h)
    const resultado = soma * h
    areaResposta.innerHTML = `
      <strong>f(x) = ${exprNormalizada}</strong><br>
      <strong>Integral definida (Trapézios):</strong><br>
      Intervalo [${a}, ${b}]<br>
      ∫f(x)dx ≈ ${resultado.toFixed(6)}
    `
    const fGraf = x => math.evaluate(exprNormalizada, { x })
    desenhaGrafico({
      exprs: [fGraf],
      cores: ["purple"],
      labels: ["f(x)"],
      titulo: `Função no intervalo [${a}, ${b}]`
    })
    mostrarGrafico()
  } catch (e) {
    areaResposta.innerHTML = "Erro ao calcular a integral definida numérica. Verifique a função e os limites"
    console.error("Erro na integral definida", e)
  }
}

const ctxGrafico = document.getElementById("grafico").getContext("2d")
let graficoAtual = null

function desenhaGrafico({ exprs, cores, labels, titulo }) {
  const xVals = []
  const ySeries = exprs.map(() => [])
  for (let x = -10; x <= 10; x += 0.1) {
    xVals.push(x)
    exprs.forEach((f, i) => {
      try {
        ySeries[i].push(f(x))
      } catch {
        ySeries[i].push(NaN)
      }
    })
  }
  if (graficoAtual) graficoAtual.destroy()
  graficoAtual = new Chart(ctxGrafico, {
    type: "line",
    data: {
      labels: xVals,
      datasets: ySeries.map((ys, i) => ({
        label: labels[i],
        data: ys,
        borderColor: cores[i],
        borderWidth: 2,
        fill: false
      }))
    },
    options: {
      responsive: true,
      plugins: { title: { display: true, text: titulo } },
      scales: {
        x: { title: { display: true, text: "x" } },
        y: { title: { display: true, text: "y" } }
      }
    }
  })
}
