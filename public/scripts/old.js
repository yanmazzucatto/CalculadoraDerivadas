const btnDerivada = document.getElementById("btn-derivada")
const btnIntegral = document.getElementById("btn-integral")

//EventListeners
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
        console.log('Foi')
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
        //const segunda_derivada = math.simplify(math.derivative())
        areaResposta.innerHTML = `f': ${simplificada.toString()} <br>`
    } catch (e) {
        areaResposta.innerHTML = "Erro ao calcular a derivada. Verifique a sintaxe da função."
        console.error("Erro ao calcular a derivada:", e)
    }
}

function integral(expr) {
 const areaResposta = document.getElementById("resultado")

    function integrar(f, a, b, n = 1000) {
        const h = (b - a) / n;
        let soma = 0.5 * (f(a) + f(b));
        for (let i = 1; i < n; i++) {
            soma += f(a + i * h);
        }
        return soma * h;
    }

    try {
        const exprNormalizada = normalizaFuncao(expr)
        const node = math.parse(exprNormalizada)
        const derivadaExpr = math.integral(node, 'x')
        console.log(derivadaExpr);
        // const simplificada = math.simplify(derivadaExpr)
        //const segunda_derivada = math.simplify(math.derivative())
        // areaResposta.innerHTML = `Derivada: ${simplificada.toString()}`
    } catch (e) {
        areaResposta.innerHTML = "Erro ao calcular a derivada. Verifique a sintaxe da função."
        console.error("Erro ao calcular a derivada:", e)
    }   
}