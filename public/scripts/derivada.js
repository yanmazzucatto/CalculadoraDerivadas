function calcularDerivada() {
  const input = document.getElementById("funcao").value.trim()
  const resultado = document.getElementById("resultado")

  try {
    if (!input.includes('=') || !input.match(/^[a-zA-Z]+\([a-zA-Z]+\)\s*=\s*.+$/)) { 
      throw new Error("Isso aí não é função. Tente algo como f(x) = x^2 + 2x - 4")
    }

    const funcaoSeparada = separaFuncao(input)
    const termos = separarTermos(funcaoSeparada.valor)
    const termosDerivados = termos.map(derivarTermo)

    const resposta = termosDerivados.join(' + ').replace(/\+\s\-/g, '- ')
    resultado.innerText = `${funcaoSeparada.nome}' = ${resposta}`
  } catch (erro) {
    alert(erro.message)
    resultado.innerText = ''
    document.getElementById("funcao").value = ''
  }
}

function separaFuncao(input) {
  const partes = input.split('=')
  const nome = partes[0].trim()
  const valor = partes[1].trim()
  return { nome, valor }
}

function separarTermos(funcao) {
  let termos = []
  let termoAtual = ''

  for (let i = 0; i < funcao.length; i++) {
    const c = funcao[i]

    if ((c === '+' || c === '-') && i !== 0) {
      termos.push(termoAtual.trim())
      termoAtual = c
      termoAtual += c
    }
  }

  termos.push(termoAtual.trim())
  return termos
}

// Deriva termos como x^n, ax, constantes, sin, cos, etc.
function derivarTermo(termo) {
  termo = termo.trim()

  // Derivadas trigonométricas
  if (termo.includes('cos(x)')) return termo.replace('cos(x)', '-sin(x)')
  if (termo.includes('sin(x)')) return termo.replace('sin(x)', 'cos(x)')
  if (termo.includes('tan(x)')) return termo.replace('tan(x)', 'sec^2(x)')

  // Constante
  if (!termo.includes('x')) return '0';

  // Potência: x^n
  if (termo.includes('x^')) {
    const partes = termo.split('x^')
    let coef = partes[0] === '' || partes[0] === '+' ? 1 : (partes[0] === '-' ? -1 : Number(partes[0]))
    const expoente = Number(partes[1])
    const novoCoef = coef * expoente
    const novoExpoente = expoente - 1

    if (novoExpoente === 1) return `${novoCoef}x`
    if (novoExpoente === 0) return `${novoCoef}`
    return `${novoCoef}x^${novoExpoente}`
  }

  // Termos do tipo ax
  if (termo.includes('x')) {
    let coef = termo.replace('x', '')
    coef = coef === '' || coef === '+' ? 1 : (coef === '-' ? -1 : Number(coef))
    return `${coef}`
  }

  return '?';
}
