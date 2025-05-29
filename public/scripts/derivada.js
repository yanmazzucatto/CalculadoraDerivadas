const btnDerivada = document.getElementById("btn-derivada");
const btnExtremos = document.getElementById("btn-extremos");

btnExtremos.addEventListener("click", () => {
    const inputFuncao = document.getElementById("funcao").value;
    if (validaFuncao(inputFuncao)) {
        const { valor } = separaFuncao(inputFuncao);
        calculaExtremos(valor);
    }
});

function limpaFuncao() {
    const inputElemento = document.getElementById("funcao");
    const areaResposta = document.getElementById("resultado");
    inputElemento.value = "";
    areaResposta.innerHTML = "Função inválida. Tente novamente!";
}

function separaFuncao(funcaoCompleta) {
    // Verifica se a função contém '=' antes de fazer o split
    if (funcaoCompleta.includes('=')) {
        const [nome, valor] = funcaoCompleta.split('=');
        return {
            nome: nome.trim(),
            valor: valor.trim()
        };
    } else {
        // Se não houver '=', assume que toda a string é o valor da função
        return {
            nome: '', // Ou defina um nome padrão, se preferir
            valor: funcaoCompleta.trim()
        };
    }
}

function validaFuncao(inputFuncao) {
    const { valor } = separaFuncao(inputFuncao);
    const areaResposta = document.getElementById("resultado");

    if (!valor) { // Verifica se o valor da função está vazio
        limpaFuncao();
        return false;
    }

    try {
        // Tenta fazer o parse da expressão para verificar a sintaxe
        math.parse(valor);
        // Se o parse for bem-sucedido, a função é válida
        areaResposta.innerHTML = ""; // Limpa a mensagem de erro se a função for válida
        return true;
    } catch (e) {
        limpaFuncao();
        console.error("Erro de validação da função:", e); // Para depuração
        return false;
    }
}

function derivada(expr) {
    const areaResposta = document.getElementById("resultado");

    try {
        // Cria um nó da expressão para poder derivar e simplificar
        const node = math.parse(expr);
        const derivadaExpr = math.derivative(node, 'x');
        // Simplifica a expressão derivada, se desejar
        const simplificada = math.simplify(derivadaExpr);

        areaResposta.innerHTML = `Derivada: ${simplificada.toString()}`;
        console.log(`Derivada: ${simplificada.toString()}`);
    } catch (e) {
        areaResposta.innerHTML = "Erro ao calcular a derivada. Verifique a sintaxe da função.";
        console.error("Erro ao calcular a derivada:", e); // Para depuração
    }
}

btnDerivada.addEventListener("click", () => {
    const inputFuncao = document.getElementById("funcao").value;
    if (validaFuncao(inputFuncao)) {
        const { valor } = separaFuncao(inputFuncao);
        derivada(valor);
    }
});

function calculaExtremos(expr) {
    const areaResposta = document.getElementById("resultado");

    try {
        // Derivada da função
        const primeiraDerivada = math.derivative(expr, 'x');
        const segundaDerivada = math.derivative(primeiraDerivada, 'x');
        
        // Tentamos encontrar raízes da primeira derivada (onde f'(x) = 0)
        // math.js não resolve analiticamente, então testamos valores próximos
        let pontosCriticos = [];
        for (let x = -10; x <= 10; x += 0.5) {
            let f1 = primeiraDerivada.evaluate({ x: x });
            let f2 = primeiraDerivada.evaluate({ x: x + 0.1 });

            // Se a derivada muda de sinal, há um ponto crítico
            if (f1 * f2 < 0) {
                let ponto = +(x + 0.05).toFixed(2); // Aproximação
                pontosCriticos.push(ponto);
            }
        }

        if (pontosCriticos.length === 0) {
            areaResposta.innerHTML = "Nenhum ponto de máximo ou mínimo encontrado no intervalo -10 a 10.";
            return;
        }

        // Classifica cada ponto crítico com base na segunda derivada
        let resultadoHTML = "<strong>Extremos encontrados:</strong><br>";
        pontosCriticos.forEach(ponto => {
            const segunda = segundaDerivada.evaluate({ x: ponto });
            const valorFuncao = math.evaluate(expr, { x: ponto });

            if (segunda > 0) {
                resultadoHTML += `Mínimo local em x = ${ponto}, f(x) = ${valorFuncao.toFixed(2)}<br>`;
            } else if (segunda < 0) {
                resultadoHTML += `Máximo local em x = ${ponto}, f(x) = ${valorFuncao.toFixed(2)}<br>`;
            } else {
                resultadoHTML += `Ponto de inflexão em x = ${ponto}<br>`;
            }
        });

        areaResposta.innerHTML = resultadoHTML;

    } catch (e) {
        areaResposta.innerHTML = "Erro ao calcular máximos e mínimos. Verifique a função.";
        console.error("Erro nos extremos:", e);
    }
}
