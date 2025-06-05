const btnDerivada = document.getElementById("btn-derivada")
const btnIntegral = document.getElementById("btn-integral")

btnDerivada.addEventListener("click", () => {
  const inputFuncao = document.getElementById("funcao").value
  if (validaFuncao(inputFuncao)) {
    const { valor } = separaFuncao(inputFuncao)
    derivada(valor)
  }
})

btnIntegral.addEventListener("click", () => {
  const inputFuncao = document.getElementById("funcao").value
  if (validaFuncao(inputFuncao)) {
    const { valor } = separaFuncao(inputFuncao)
    integral(valor)
    console.log("Integral solicitada")
  }
}) 
function integral(expr) {
  const areaResposta = document.getElementById("resultado")
  try {
    const exprNormalizada = normalizaFuncao(expr)

    const resultadoAlgeb = Algebrite.run(`integral(${exprNormalizada}, x)`)

    areaResposta.innerHTML = `
      <strong>f(x) = ${exprNormalizada}</strong><br>
      ∫f(x)dx = ${resultadoAlgeb}
    `
  } catch (e) {
    areaResposta.innerHTML =
      "Erro ao calcular a integral. Verifique a sintaxe da função."
    console.error("Erro ao calcular a integral via Algebrite:", e)
  }
}


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
      valor: valor.trim(),
    }
  } else {
    return {
      nome: "",
      valor: funcaoCompleta.trim(),
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
    console.error("Erro de validação da função:", e)
    return false
  }
}

function validaPolinomio2Grau(str) {
  const s = str.replace(/\s+/g, "").replace(",", ".")
  const re = /^[+-]?(\d*\.?\d*)x\^2?([+-]\d*\.?\d*)x?([+-]\d*\.?\d*)?$/
  return re.test(s)
}

function parsePolinomio2Grau(str) {
  const s0 = str.replace(/\s+/g, "").replace(",", ".")
  let a = 0,
    b = 0,
    c = 0

  const regexA = /([+-]?\d*\.?\d*)x\^2/
  const matchA = s0.match(regexA)
  if (matchA) {
    const raw = matchA[1]
    if (raw === "" || raw === "+") a = 1
    else if (raw === "-") a = -1
    else a = parseFloat(raw)
  }

  const regexB = /([+-]?\d*\.?\d*)x(?!\^)/
  const matchB = s0.match(regexB)
  if (matchB) {
    const raw = matchB[1]
    if (raw === "" || raw === "+") b = 1
    else if (raw === "-") b = -1
    else b = parseFloat(raw)
  }

  let sSemAx2 = s0
  if (matchA) sSemAx2 = sSemAx2.replace(regexA, "")
  let sSemTudo = sSemAx2
  if (matchB) sSemTudo = sSemTudo.replace(regexB, "")

  const regexC = /([+-]?\d+\.?\d*)(?!x)/
  const matchC = sSemTudo.match(regexC)
  if (matchC) {
    c = parseFloat(matchC[1])
  }
  return { a, b, c }
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
    areaResposta.innerHTML =
      "Erro ao calcular a derivada. Verifique a sintaxe da função."
    console.error("Erro ao calcular a derivada:", e)
  }
}

