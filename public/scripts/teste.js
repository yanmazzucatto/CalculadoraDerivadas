// Elementos da interface
const btnDerivada = document.getElementById("btn-derivada");
const btnIntegralIndefinida = document.getElementById("btn-integral-indefinida");
const btnIntegralDefinida = document.getElementById("btn-integral-definida");
const limitesContainer = document.getElementById("limites-container");

// Oculta os limites ao carregar
document.addEventListener("DOMContentLoaded", () => {
  limitesContainer.classList.add("limites-hidden");
});

// Clique: derivada
btnDerivada.addEventListener("click", () => {
  limitesContainer.classList.add("limites-hidden");
  const inputFuncao = document.getElementById("funcao").value;
  if (validaFuncao(inputFuncao)) {
    const { valor } = separaFuncao(inputFuncao);
    derivada(valor);
  }
});

// Clique: integral indefinida
btnIntegralIndefinida.addEventListener("click", () => {
  limitesContainer.classList.add("limites-hidden");
  const inputFuncao = document.getElementById("funcao").value;
  if (validaFuncao(inputFuncao)) {
    const { valor } = separaFuncao(inputFuncao);
    integralIndefinida(valor);
  }
});

// Clique: integral definida
btnIntegralDefinida.addEventListener("click", () => {
  limitesContainer.classList.remove("limites-hidden");
  const inputFuncao = document.getElementById("funcao").value;
  const valor = separaFuncao(inputFuncao).valor;
  const a_val = parseFloat(document.getElementById("limite-a").value);
  const b_val = parseFloat(document.getElementById("limite-b").value);
  if (
    validaFuncao(inputFuncao) &&
    !isNaN(a_val) &&
    !isNaN(b_val)
  ) {
    integralDefinida(valor, a_val, b_val);
  }
});

// Funções auxiliares
function limpaFuncao() {
  const inputElemento = document.getElementById("funcao");
  const areaResposta = document.getElementById("resultado");
  inputElemento.value = "";
  areaResposta.innerHTML = "Função inválida. Tente novamente!";
}

function separaFuncao(funcaoCompleta) {
  if (funcaoCompleta.includes("=")) {
    const [nome, valor] = funcaoCompleta.split("=");
    return {
      nome: nome.trim(),
      valor: valor.trim()
    };
  } else {
    return {
      nome: "",
      valor: funcaoCompleta.trim()
    };
  }
}

// Mapeamento de algarismos sobrescrito Unicode para dígitos
const supMap = {
  '⁰': '0', '¹': '1', '²': '2', '³': '3',
  '⁴': '4', '⁵': '5', '⁶': '6', '⁷': '7',
  '⁸': '8', '⁹': '9'
};

function normalizaFuncao(funcao) {
  let f = funcao;

  // 0) Remover espaços não-breaking ou outros espaços estranhos, normalizar espaços simples
  //    Substitui qualquer whitespace unicode por espaço normal, depois converte múltiplos em um:
  f = f.replace(/\u00A0/g, ' ')           // non-breaking space
       .replace(/\s+/g, ' ')               // vários espaços em um
       .trim();

  // 1) Vírgula decimal: "0,71" → "0.71"
  f = f.replace(/(\d),(\d)/g, "$1.$2");

  // 2) Inserir * entre número e variável: "2x" → "2*x", mas sem afetar caso já haja "*"
  //    Usamos lookahead para x, X ou outras variáveis? Focamos em x: 
  f = f.replace(/(\d)(?=[*]*x)/g, "$1*"); // se houver 2x ou 2*x, o "*x" já tem; esta regex apenas insere antes de x

  // 3) Converter expoentes Unicode em variáveis: x², x³, x¹⁰ etc.
  f = f.replace(/x([⁰¹²³⁴⁵⁶⁷⁸⁹]+)/g, (match, supers) => {
    const digits = supers.split('').map(ch => supMap[ch] || '').join('');
    return `x^${digits}`;
  });

  // 4) Converter expoentes Unicode sobre constantes ou subexpressões:
  //    - Primeiro parênteses seguidos de superscrito: (expr)² -> (expr)^2
  f = f.replace(/\(([^)]+)\)([⁰¹²³⁴⁵⁶⁷⁸⁹]+)/g, (match, base, supers) => {
    const digits = supers.split('').map(ch => supMap[ch] || '').join('');
    return `(${base})^${digits}`;
  });
  //    - Depois números seguidos de superscrito: 0.71² -> (0.71)^2
  f = f.replace(/(\d+(\.\d+)?)([⁰¹²³⁴⁵⁶⁷⁸⁹]+)/g, (match, base, _, supers) => {
    const digits = supers.split('').map(ch => supMap[ch] || '').join('');
    return `(${base})^${digits}`;
  });

  // 5) Funções em notação portuguesa: "sen(" → "sin(", "tg(" → "tan(", "ln(" → "log("
  f = f.replace(/sen\(/gi, "sin(")
       .replace(/tg\(/gi, "tan(")
       .replace(/ln\(/gi, "log(");

  // 6) Converter e^expr para exp(expr)
  //    Captura e^alfa onde alfa é dígito, variável, ou parentetizado simples
  f = f.replace(/(^|[^A-Za-z0-9_])e\^(\(?[^\s+\-*/^()]+\)?)/g, (match, pfx, expr) => {
    // remove parênteses extras em expr para evitar exp((...))
    const inner = expr.replace(/^\(|\)$/g, "");
    return `${pfx}exp(${inner})`;
  });

  return f;
}

function validaFuncao(inputFuncao) {
  const { valor } = separaFuncao(inputFuncao);
  const areaResposta = document.getElementById("resultado");
  if (!valor) {
    limpaFuncao();
    esconderGrafico();
    return false;
  }
  try {
    const valorNormalizado = normalizaFuncao(valor);
    console.log("Expr normalizada:", valorNormalizado);
    // Testa parse pelo Math.js
    math.parse(valorNormalizado);
    areaResposta.innerHTML = "";
    return true;
  } catch (e) {
    console.error("Erro de validação da função:", valor, "→ normalizada:", normalizaFuncao(valor), e);
    limpaFuncao();
    return false;
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
  const areaResposta = document.getElementById("resultado");
  try {
    const exprNormalizada = normalizaFuncao(expr);
    // opcional: log para debug
    console.log("derivada: expr normalizada:", exprNormalizada);

    const node1 = math.parse(exprNormalizada);
    const derivada1 = math.derivative(node1, "x");
    const derivada1simp = math.simplify(derivada1);
    const derivada2 = math.derivative(derivada1, "x");
    const derivada2simp = math.simplify(derivada2);

    const strDeriv1 = derivada1simp.toString().trim();
    const strDeriv2 = derivada2simp.toString().trim();

    let html = `
      <strong>f(x) = ${exprNormalizada}</strong><br>
      f′(x) = ${strDeriv1}<br>
      f″(x) = ${strDeriv2}<br>
    `;

    // Encontrar raízes de f'(x)=0 simbolicamente via Algebrite
    let pontosCriticos = [];
    try {
      // 1) Tenta polinômio: roots
      let solRaw = Algebrite.run(`roots(${strDeriv1})`);
      if (solRaw && solRaw.startsWith("[")) {
        const solList = solRaw.slice(1, -1).split(",");
        solList.forEach(s => {
          const num = parseFloat(s);
          if (!isNaN(num)) pontosCriticos.push(num);
        });
      } else {
        // 2) Tenta solve para casos gerais
        solRaw = Algebrite.run(`solve(${strDeriv1}, x)`);
        if (solRaw && solRaw.startsWith("[")) {
          const solList = solRaw.slice(1, -1).split(",");
          solList.forEach(s => {
            const num = parseFloat(s);
            if (!isNaN(num)) pontosCriticos.push(num);
          });
        }
      }
    } catch (eSol) {
      console.warn("Falha solução simbólica de pontos críticos:", eSol);
    }

    // Remove duplicatas aproximadas
    pontosCriticos = pontosCriticos
      .map(x => +x.toFixed(6))
      .filter((v, i, arr) => arr.indexOf(v) === i);

    if (pontosCriticos.length === 0) {
      html += `<em>Nenhum ponto crítico simbólico encontrado.</em><br>`;
    } else {
      html += `<strong>Pontos críticos encontrados:</strong><br>`;
      pontosCriticos.forEach(xc => {
        // Classificar com segunda derivada
        let tipo = "";
        let valSegunda;
        try {
          valSegunda = math.evaluate(strDeriv2, { x: xc });
        } catch {
          valSegunda = NaN;
        }
        if (isNaN(valSegunda)) {
          tipo = "Não foi possível avaliar f″ neste ponto";
        } else if (valSegunda > 0) {
          tipo = "Mínimo local";
        } else if (valSegunda < 0) {
          tipo = "Máximo local";
        } else {
          tipo = "Ponto de inflexão (f″=0)";
        }
        let valFx = "N/D";
        try {
          const v = math.evaluate(exprNormalizada, { x: xc });
          valFx = +v.toFixed(6);
        } catch {}
        html += `x = ${xc}, f(x) ≈ ${valFx}, <em>${tipo}</em><br>`;
      });
    }

    areaResposta.innerHTML = html;

    // Plotar função, derivada e segunda derivada em intervalo [-10,10]
    desenhaGrafico({
      exprs: [
        x => math.evaluate(exprNormalizada, { x }),
        x => {
          try { return math.evaluate(strDeriv1, { x }); }
          catch { return NaN; }
        },
        x => {
          try { return math.evaluate(strDeriv2, { x }); }
          catch { return NaN; }
        }
      ],
      cores: ["blue", "green", "red"],
      labels: ["f(x)", "f′(x)", "f″(x)"],
      titulo: "Função e Derivadas"
    });
    mostrarGrafico();

  } catch (e) {
    console.error("Erro ao calcular a derivada:", e);
    areaResposta.innerHTML = "Erro ao calcular a derivada. Verifique a sintaxe da função";
  }
}

function integralIndefinida(expr) {
  const areaResposta = document.getElementById("resultado");
  try {
    const exprNormalizada = normalizaFuncao(expr);
    console.log("integralIndefinida: expr normalizada:", exprNormalizada);

    const resultadoAlgeb = Algebrite.run(`integral(${exprNormalizada}, x)`);
    areaResposta.innerHTML = `
      <strong>f(x) = ${exprNormalizada}</strong><br>
      ∫f(x)dx = ${resultadoAlgeb} + C
    `;
    // Plot da função e primitiva
    const primitiva = x => { try { return math.evaluate(resultadoAlgeb, { x }); } catch { return NaN; } };
    const fGraf = x => math.evaluate(exprNormalizada, { x });
    desenhaGrafico({
      exprs: [fGraf, primitiva],
      cores: ["blue", "orange"],
      labels: ["f(x)", "∫f(x)dx"],
      titulo: "Função e Integral Indefinida"
    });
    mostrarGrafico();
  } catch (e) {
    console.error("Erro ao calcular a integral indefinida:", e);
    areaResposta.innerHTML = "Erro ao calcular a integral indefinida. Verifique a sintaxe da função";
  }
}

function integralDefinida(expr, a, b, n = 1000) {
  const areaResposta = document.getElementById("resultado");
  try {
    const exprNormalizada = normalizaFuncao(expr);
    console.log("integralDefinida: expr normalizada:", exprNormalizada, "intervalo:", a, b);

    const fCalc = x => math.evaluate(exprNormalizada, { x });
    const h = (b - a) / n;
    let soma = 0.5 * (fCalc(a) + fCalc(b));
    for (let i = 1; i < n; i++) soma += fCalc(a + i * h);
    const resultado = soma * h;
    areaResposta.innerHTML = `
      <strong>f(x) = ${exprNormalizada}</strong><br>
      <strong>Integral definida (Trapézios):</strong><br>
      Intervalo [${a}, ${b}]<br>
      ∫f(x)dx ≈ ${resultado.toFixed(6)}
    `;
    // Plot apenas da função no intervalo
    const fGraf = x => math.evaluate(exprNormalizada, { x });
    desenhaGrafico({
      exprs: [fGraf],
      cores: ["purple"],
      labels: ["f(x)"],
      titulo: `Função no intervalo [${a}, ${b}]`
    });
    mostrarGrafico();
  } catch (e) {
    console.error("Erro na integral definida:", e);
    areaResposta.innerHTML = "Erro ao calcular a integral definida numérica. Verifique a função e os limites";
  }
}

const ctxGrafico = document.getElementById("grafico").getContext("2d");
let graficoAtual = null;

function desenhaGrafico({ exprs, cores, labels, titulo }) {
  const xVals = [];
  const ySeries = exprs.map(() => []);
  // Plot padrão em [-10,10] com passo 0.1
  for (let x = -10; x <= 10; x += 0.1) {
    xVals.push(x);
    exprs.forEach((f, i) => {
      try {
        ySeries[i].push(f(x));
      } catch {
        ySeries[i].push(NaN);
      }
    });
  }
  if (graficoAtual) graficoAtual.destroy();
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
  });
}
