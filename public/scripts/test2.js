// Elementos da interface
const btnDerivada = document.getElementById("btn-derivada");
const btnIntegralIndefinida = document.getElementById("btn-integral-indefinida");
const btnIntegralDefinida = document.getElementById("btn-integral-definida");
const limitesContainer = document.getElementById("limites-container");

// Oculta os limites ao carregar
document.addEventListener("DOMContentLoaded", () => {
  limitesContainer.classList.add("limites-hidden");
});

// ========== Parsing de notação de integral ==========
// Suporta:
//   integral(expr)                 → indefinida
//   integral(expr, a, b)          → definida
//   ainda detecta “∫(...)dx”
//   nova: suporta “f(expr)dx” como indefinida e “f(expr, a, b)dx” como definida
function parseIntegralNotation(input) {
  let s = input.replace(/\u00A0/g, ' ').trim();

  // 0) Notação f(expr)dx ou f(expr,a,b)dx
  // Indefinida: f(expr)dx
  {
    const reFIndef = /^\s*f\s*\(\s*([^,]+?)\s*\)\s*dx\s*$/i;
    const m = s.match(reFIndef);
    if (m) {
      const expr = m[1].trim();
      return { tipo: 'indefinida', expr };
    }
  }
  // Definida: f(expr, a, b)dx
  {
    const reFDef = /^\s*f\s*\(\s*([^,]+?)\s*,\s*([^,]+?)\s*,\s*([^,]+?)\s*\)\s*dx\s*$/i;
    const m = s.match(reFDef);
    if (m) {
      const expr = m[1].trim();
      const a = m[2].trim();
      const b = m[3].trim();
      return { tipo: 'definida', expr, a, b };
    }
  }

  // 1) Verificar forma “integral(...)”
  const reIntegral = /^\s*integral\s*\(\s*([^,]+?)(?:\s*,\s*([^,]+?)\s*,\s*([^,]+?)\s*)?\)\s*$/i;
  const mInt = s.match(reIntegral);
  if (mInt) {
    const expr = mInt[1].trim();
    const a = mInt[2] ? mInt[2].trim() : null;
    const b = mInt[3] ? mInt[3].trim() : null;
    if (a !== null && b !== null) {
      return { tipo: 'definida', expr, a, b };
    } else {
      return { tipo: 'indefinida', expr };
    }
  }

  // 2) Se não for “integral(...)” nem “f(...)dx”, verificar símbolo “∫”
  if (!s.includes('∫')) return null;
  s = s.replace(/_/g, '').trim(); // remove subscrito underscore
  let rest = s.slice(s.indexOf('∫') + 1).trim();
  // Remover “dx” ou “d x” final
  rest = rest.replace(/d\s*[xX]\s*$/i, '').trim();
  // Converter “π” para “pi”
  rest = rest.replace(/π/g, "pi");
  // Tentar extrair limites na forma a^b
  const re1 = /^([^\s\^]+)\s*\^\s*([^\s\^]+)\s*(.*)$/;
  const m1 = rest.match(re1);
  if (m1) {
    const a = m1[1].trim();
    const b = m1[2].trim();
    const expr = m1[3].trim();
    if (expr) {
      return { tipo: 'definida', expr, a, b };
    }
  }
  // Tentar extrair limites na forma “a b expr”
  const re2 = /^([^\s]+)\s+([^\s]+)\s+(.*)$/;
  const m2 = rest.match(re2);
  if (m2) {
    const a = m2[1].trim();
    const b = m2[2].trim();
    const expr = m2[3].trim();
    if (expr) {
      return { tipo: 'definida', expr, a, b };
    }
  }
  // Senão, indefinida: rest é expr
  const expr = rest.trim();
  if (expr) {
    return { tipo: 'indefinida', expr };
  }
  return null;
}

// handleInput: tenta parse de integral e chama integralDefinida/indefinida
function handleInput() {
  const inputFuncao = document.getElementById("funcao").value.trim();
  const parsed = parseIntegralNotation(inputFuncao);
  if (parsed) {
    if (parsed.tipo === 'definida') {
      const expr = parsed.expr;
      const exprNorm = normalizaFuncao(expr);
      const aNorm = normalizaFuncao(parsed.a);
      const bNorm = normalizaFuncao(parsed.b);
      console.log("parseIntegralNotation: integral definida:", exprNorm, "limites:", aNorm, bNorm);
      try {
        const a_val = math.evaluate(aNorm);
        const b_val = math.evaluate(bNorm);
        if (!isNaN(a_val) && !isNaN(b_val)) {
          integralDefinida(expr, a_val, b_val);
        } else {
          throw new Error("Limites não numéricos");
        }
      } catch (e) {
        console.error("Erro ao avaliar limites da integral:", parsed.a, parsed.b, e);
        document.getElementById("resultado").innerHTML = "Limites inválidos para integral definida.";
      }
    } else {
      const expr = parsed.expr;
      console.log("parseIntegralNotation: integral indefinida:", expr);
      if (validaFuncao(expr)) {
        integralIndefinida(expr);
      }
    }
    return true;
  }
  return false;
}

// Clique: derivada
btnDerivada.addEventListener("click", () => {
  limitesContainer.classList.add("limites-hidden");
  if (handleInput()) return;
  const inputFuncao = document.getElementById("funcao").value;
  if (validaFuncao(inputFuncao)) {
    const { valor } = separaFuncao(inputFuncao);
    derivada(valor);
  }
});

// Clique: integral indefinida (botão)
btnIntegralIndefinida.addEventListener("click", () => {
  limitesContainer.classList.add("limites-hidden");
  if (handleInput()) return;
  const inputFuncao = document.getElementById("funcao").value;
  if (validaFuncao(inputFuncao)) {
    const { valor } = separaFuncao(inputFuncao);
    integralIndefinida(valor);
  }
});

// Clique: integral definida (botão)
btnIntegralDefinida.addEventListener("click", () => {
  if (handleInput()) return;
  limitesContainer.classList.remove("limites-hidden");
  const inputFuncao = document.getElementById("funcao").value;
  if (validaFuncao(inputFuncao)) {
    const { valor } = separaFuncao(inputFuncao);
    const a_val = parseFloat(document.getElementById("limite-a").value);
    const b_val = parseFloat(document.getElementById("limite-b").value);
    if (!isNaN(a_val) && !isNaN(b_val)) {
      integralDefinida(valor, a_val, b_val);
    } else {
      document.getElementById("resultado").innerHTML = "Limites inválidos para integral definida.";
    }
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

  // converter π para pi
  f = f.replace(/π/g, "pi");

  // Normalizar espaços
  f = f.replace(/\u00A0/g, ' ')
       .replace(/\s+/g, ' ')
       .trim();

  // Vírgula decimal: "0,71" → "0.71"
  f = f.replace(/(\d),(\d)/g, "$1.$2");

  // Inserir * entre número e variável: "2x" → "2*x"
  f = f.replace(/(\d)(?=[*]*x)/g, "$1*");

  // Interpretar x seguido de dígito como expoente: x2 → x^2
  // Faz antes de lidar com expoentes Unicode
  f = f.replace(/x(\d+)/g, (match, digits) => `x^${digits}`);

  // Expoentes Unicode em variáveis: x², x³, etc.
  f = f.replace(/x([⁰¹²³⁴⁵⁶⁷⁸⁹]+)/g, (match, supers) => {
    const digits = supers.split('').map(ch => supMap[ch] || '').join('');
    return `x^${digits}`;
  });

  // Expoentes Unicode em constantes ou subexpressões:
  f = f.replace(/\(([^)]+)\)([⁰¹²³⁴⁵⁶⁷⁸⁹]+)/g, (match, base, supers) => {
    const digits = supers.split('').map(ch => supMap[ch] || '').join('');
    return `(${base})^${digits}`;
  });
  f = f.replace(/(\d+(\.\d+)?)([⁰¹²³⁴⁵⁶⁷⁸⁹]+)/g, (match, base, _, supers) => {
    const digits = supers.split('').map(ch => supMap[ch] || '').join('');
    return `(${base})^${digits}`;
  });

  // Funções em notação portuguesa
  f = f.replace(/sen\(/gi, "sin(")
       .replace(/tg\(/gi, "tan(")
       .replace(/ln\(/gi, "log(");

  // Converter e^expr para exp(expr)
  f = f.replace(/(^|[^A-Za-z0-9_])e\^(\(?[^\s+\-*/^()]+\)?)/g, (match, pfx, expr) => {
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

// Fallback linear
function encontraRaizesLineares(strDeriv1) {
  try {
    const b = math.evaluate(strDeriv1, { x: 0 });
    const aPlusb = math.evaluate(strDeriv1, { x: 1 });
    const a = aPlusb - b;
    if (a !== 0) {
      const raiz = -b / a;
      return [raiz];
    }
  } catch (_) {}
  return [];
}

function derivada(expr) {
  const areaResposta = document.getElementById("resultado");
  try {
    const exprNormalizada = normalizaFuncao(expr);
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
    // pontos críticos
    let pontosCriticos = [];
    try {
      let solRaw = Algebrite.run(`roots(${strDeriv1})`);
      if (solRaw && solRaw.startsWith("[")) {
        solRaw.slice(1, -1).split(",").forEach(s => {
          const num = parseFloat(s);
          if (!isNaN(num)) pontosCriticos.push(num);
        });
      } else {
        solRaw = Algebrite.run(`solve(${strDeriv1}, x)`);
        if (solRaw && solRaw.startsWith("[")) {
          solRaw.slice(1, -1).split(",").forEach(s => {
            const num = parseFloat(s);
            if (!isNaN(num)) pontosCriticos.push(num);
          });
        }
      }
    } catch (eSol) {
      console.warn("Falha solução simbólica de pontos críticos:", eSol);
    }
    if (pontosCriticos.length === 0) {
      const lin = encontraRaizesLineares(strDeriv1);
      if (lin.length > 0) pontosCriticos = lin;
    }
    pontosCriticos = pontosCriticos
      .map(x => +x.toFixed(6))
      .filter((v, i, arr) => arr.indexOf(v) === i);
    if (pontosCriticos.length === 0) {
      html += `<em>Nenhum ponto crítico simbólico encontrado.</em><br>`;
    } else {
      html += `<strong>Pontos críticos encontrados:</strong><br>`;
      pontosCriticos.forEach(xc => {
        let tipo = "";
        let valSegunda;
        try { valSegunda = math.evaluate(strDeriv2, { x: xc }); }
        catch { valSegunda = NaN; }
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
    // plot
    desenhaGrafico({
      exprs: [
        x => math.evaluate(exprNormalizada, { x }),
        x => { try { return math.evaluate(strDeriv1, { x }); } catch { return NaN; } },
        x => { try { return math.evaluate(strDeriv2, { x }); } catch { return NaN; } }
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
    // Caso especial 1/x
    if (/^1\/x$/.test(exprNormalizada)) {
      areaResposta.innerHTML = `<strong>f(x) = ${exprNormalizada}</strong><br>∫f(x)dx = ln|x| + C`;
      desenhaGrafico({
        exprs: [x => math.evaluate(exprNormalizada, { x })],
        cores: ["blue"],
        labels: ["f(x)=1/x"],
        titulo: "Função 1/x"
      });
      mostrarGrafico();
      return;
    }
    const resultadoAlgeb = Algebrite.run(`integral(${exprNormalizada}, x)`);
    areaResposta.innerHTML = `
      <strong>f(x) = ${exprNormalizada}</strong><br>
      ∫f(x)dx = ${resultadoAlgeb} + C
    `;
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
      ∫f(x)dx ≈ ${isNaN(resultado) ? 'NaN (problema de domínio)' : resultado.toFixed(6)}
    `;
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
    document.getElementById("resultado").innerHTML = "Erro ao calcular a integral definida numérica. Verifique a função e os limites";
  }
}

const ctxGrafico = document.getElementById("grafico").getContext("2d");
let graficoAtual = null;

function desenhaGrafico({ exprs, cores, labels, titulo }) {
  const xVals = [];
  const ySeries = exprs.map(() => []);
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
