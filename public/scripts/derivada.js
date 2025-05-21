// Função principal chamada ao clicar no botão
function calcularDerivada() {
  const input = document.getElementById("funcao").value; // Pega o valor digitado
  const funcaoSeparada = separaFuncao(input); // Separa nome e corpo da função
  const termos = separarTermos(funcaoSeparada.valor); // Separa os termos
  const termosDerivados = termos.map(derivarTermo); // Aplica derivação termo a termo
  const resposta = termosDerivados.join(' + ').replace(/\+\s\-/g, '- '); // Junta resultado e corrige sinais

  document.getElementById("resultado").innerText = `${funcaoSeparada.nome}' = ${resposta}`;
}

// Separa o nome da função e o conteúdo (ex: "f(x) = x^2 + 2x - 4")
function separaFuncao(input) {
  const partes = input.split('=');
  const nome = partes[0].trim();      // "f(x)"
  const valor = partes[1].trim();     // "x^2 + 2x - 4"
  return { nome, valor };
}

// Separa os termos com base nos sinais + e - (sem regex)
function separarTermos(funcao) {
  let termos = [];
  let termoAtual = '';

  for (let i = 0; i < funcao.length; i++) {
    const c = funcao[i];

    // Se for um operador, salva o termo anterior e começa um novo
    if ((c === '+' || c === '-') && i !== 0) {
      termos.push(termoAtual.trim());
      termoAtual = c; // começa novo termo com o sinal
    } else {
      termoAtual += c;
    }
  }

  termos.push(termoAtual.trim()); // adiciona o último termo
  return termos;
}

// Deriva um único termo como: "x^2", "2x", "-4", "cos(x)"
function derivarTermo(termo) {
  termo = termo.trim();

  // Casos básicos de funções trigonométricas
  if (termo.includes('cos(x)')) return termo.replace('cos(x)', '-sin(x)');
  if (termo.includes('sin(x)')) return termo.replace('sin(x)', 'cos(x)');
  if (termo.includes('tan(x)')) return termo.replace('tan(x)', 'sec^2(x)');

  // Derivada de constante (número isolado) é zero
  if (!termo.includes('x')) return '0';

  // Derivada de x^n: exemplo x^2 => 2x
  if (termo.includes('x^')) {
    const partes = termo.split('x^');
    let coef = partes[0] === '' || partes[0] === '+' ? 1 : (partes[0] === '-' ? -1 : Number(partes[0]));
    const expoente = Number(partes[1]);
    const novoCoef = coef * expoente;
    const novoExpoente = expoente - 1;

    if (novoExpoente === 1) return `${novoCoef}x`;
    if (novoExpoente === 0) return `${novoCoef}`;
    return `${novoCoef}x^${novoExpoente}`;
  }

  // Derivada de ax (ex: 2x -> 2)
  if (termo.includes('x')) {
    let coef = termo.replace('x', '');
    coef = coef === '' || coef === '+' ? 1 : (coef === '-' ? -1 : Number(coef));
    return `${coef}`;
  }

  // Caso não reconhecido
  return '?';
}
