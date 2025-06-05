const btnDerivada = document.getElementById("btn-derivada")
const btnIntegralIndefinida = document.getElementById("btn-integral-indefinida")
const btnIntegralDefinida = document.getElementById("btn-integral-definida")
const limitesContainer = document.getElementById("limites-container")

document.addEventListener("DOMContentLoaded", () => {
  limitesContainer.classList.add("limites-hidden")
})

btnDerivada.addEventListener("click", () => {
  limitesContainer.classList.add("limites-hidden")
  const inputFuncao = document.getElementById("funcao").value
  if (validaFuncao(inputFuncao)) {
    const { valor } = separaFuncao(inputFuncao)
    derivada(valor)
  }
})

btnIntegralIndefinida.addEventListener("click", () => {
  limitesContainer.classList.add("limites-hidden")
  const inputFuncao = document.getElementById("funcao").value
  if (validaFuncao(inputFuncao)) {
    const { valor } = separaFuncao(inputFuncao)
    integralIndefinida(valor)
  }
})

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
      return
    }
    const f1 = x => {
      try { return math.evaluate(strDeriv1, { x }) }
      catch { return NaN }
    }
    const f2 = x => {
      try { return math.evaluate(strDeriv2, { x }) }
      catch { return NaN }
    }
    const pontosCriticos = []
    const passo = 0.1
    let anterior = f1(-10)
    for (let x = -10 + passo; x <= 10; x += passo) {
      const atual = f1(x)
      if (!isNaN(anterior) && !isNaN(atual)) {
        if (anterior * atual < 0) {
          pontosCriticos.push(+(x - passo / 2).toFixed(3))
        }
        if (Math.abs(atual) < 1e-6) {
          pontosCriticos.push(+x.toFixed(3))
        }
      }
      anterior = atual
    }
    if (pontosCriticos.length === 0) {
      html += `<em>Nenhum ponto crítico encontrado em [−10,10].</em>`
    } else {
      html += `<strong>Pontos críticos encontrados (aprox.):</strong><br>`
      pontosCriticos.forEach(xc => {
        const valSegunda = f2(xc)
        let tipo
        if (isNaN(valSegunda)) {
          tipo = "Não foi possível avaliar f″ neste ponto"
        } else if (valSegunda > 0) {
          tipo = "Mínimo local"
        } else if (valSegunda < 0) {
          tipo = "Máximo local"
        } else {
          tipo = "Ponto de inflexão (f″=0)"
        }
        let valFx
        try {
          valFx = math.evaluate(exprNormalizada, { x: xc })
          valFx = +valFx.toFixed(3)
        } catch {
          valFx = "N/D"
        }
        html += `x = ${xc}, f(x) ≈ ${valFx}, <em>${tipo}</em><br>`
      })
    }
    areaResposta.innerHTML = html
  } catch (e) {
    const areaResposta = document.getElementById("resultado")
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
  } catch (e) {
    areaResposta.innerHTML = "Erro ao calcular a integral indefinida. Verifique a sintaxe da função"
    console.error("Erro ao calcular a integral indefinida via Algebrite", e)
  }
}

function integralDefinida(expr, a, b, n = 1000) {
  const areaResposta = document.getElementById("resultado")
  try {
    const exprNormalizada = normalizaFuncao(expr)
    const f = x => math.evaluate(exprNormalizada, { x })
    const h = (b - a) / n
    let soma = 0.5 * (f(a) + f(b))
    for (let i = 1; i < n; i++) {
      soma += f(a + i * h)
    }
    const resultado = soma * h
    areaResposta.innerHTML = `
      <strong>f(x) = ${exprNormalizada}</strong><br>
      <strong>Integral definida (Trapézios):</strong><br>
      Intervalo [${a}, ${b}]<br>
      ∫f(x)dx ≈ ${resultado.toFixed(6)}
    `
  } catch (e) {
    areaResposta.innerHTML = "Erro ao calcular a integral definida numérica. Verifique a função e os limites"
    console.error("Erro na integral definida", e)
  }
}
