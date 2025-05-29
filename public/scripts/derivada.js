const btnDerivada = document.getElementById("btn-derivada")
const btnExtremos = document.getElementById("btn-extremos")

btnDerivada.addEventListener("click", () => {
    const inputFuncao = document.getElementById("funcao").value
    if (validaFuncao(inputFuncao)) {
        const { valor } = separaFuncao(inputFuncao)
        derivada(valor)
    }
})

btnExtremos.addEventListener("click", () => {
    const inputFuncao = document.getElementById("funcao").value
    if (validaFuncao(inputFuncao)) {
        const { valor } = separaFuncao(inputFuncao)
        calculaExtremos(valor)
    }
})

function limpaFuncao() {
    const inputElemento = document.getElementById("funcao")
    const areaResposta = document.getElementById("resultado")
    inputElemento.value = ""
    areaResposta.innerHTML = "Função inválida. Tente novamente!"
}

function separaFuncao(funcaoCompleta) {
    if (funcaoCompleta.includes('=')) {
        const [nome, valor] = funcaoCompleta.split('=')
        return {
            nome: nome.trim(),
            valor: valor.trim()
        }
    } else {
        return {
            nome: '',
            valor: funcaoCompleta.trim()
        }
    }
}

function normalizaFuncao(funcao) {
    return funcao
        .replace(/x⁰/g, 'x^0')
        .replace(/x¹/g, 'x^1')
        .replace(/x²/g, 'x^2')
        .replace(/x³/g, 'x^3')
        .replace(/x⁴/g, 'x^4')
        .replace(/x⁵/g, 'x^5')
        .replace(/x⁶/g, 'x^6')
        .replace(/x⁷/g, 'x^7')
        .replace(/x⁸/g, 'x^8')
        .replace(/x⁹/g, 'x^9')
        .replace(/ln\(/g, 'log(')
        .replace(/tg\(/g, 'tan(')
        .replace(/e\^/g, 'exp(')
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

function derivada(expr) {
    const areaResposta = document.getElementById("resultado")

    try {
        const exprNormalizada = normalizaFuncao(expr)
        const node = math.parse(exprNormalizada)
        const derivadaExpr = math.derivative(node, 'x')
        const simplificada = math.simplify(derivadaExpr)
        areaResposta.innerHTML = `Derivada: ${simplificada.toString()}`
    } catch (e) {
        areaResposta.innerHTML = "Erro ao calcular a derivada. Verifique a sintaxe da função."
        console.error("Erro ao calcular a derivada:", e)
    }
}

function calculaExtremos(expr) {
    const areaResposta = document.getElementById("resultado")

    try {
        const exprNormalizada = normalizaFuncao(expr)
        const primeiraDerivada = math.derivative(exprNormalizada, 'x')
        const segundaDerivada = math.derivative(primeiraDerivada, 'x')

        let pontosCriticos = []
        const passo = 0.1
        for (let x = -10; x <= 10; x += passo) {
            let f1 = primeiraDerivada.evaluate({ x })
            let f2 = primeiraDerivada.evaluate({ x: x + passo })

            if (f1 * f2 < 0) {
                let ponto = +(x + passo / 2).toFixed(3)
                pontosCriticos.push(ponto)
            }
        }

        if (pontosCriticos.length === 0) {
            areaResposta.innerHTML = "Nenhum ponto de máximo ou mínimo encontrado no intervalo -10 a 10."
            return
        }

        let resultadoHTML = "<strong>Extremos encontrados:</strong><br>"
        pontosCriticos.forEach(ponto => {
            const segunda = segundaDerivada.evaluate({ x: ponto })
            const valorFuncao = math.evaluate(exprNormalizada, { x: ponto })

            if (segunda > 0) {
                resultadoHTML += `Mínimo local em x = ${ponto}, f(x) = ${valorFuncao.toFixed(2)}<br>`
            } else if (segunda < 0) {
                resultadoHTML += `Máximo local em x = ${ponto}, f(x) = ${valorFuncao.toFixed(2)}<br>`
            } else {
                resultadoHTML += `Ponto de inflexão em x = ${ponto}<br>`
            }
        })

        areaResposta.innerHTML = resultadoHTML

    } catch (e) {
        areaResposta.innerHTML = "Erro ao calcular máximos e mínimos. Verifique a função."
        console.error("Erro nos extremos:", e)
    }
}
