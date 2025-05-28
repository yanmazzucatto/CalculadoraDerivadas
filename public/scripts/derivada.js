const btnDerivada = document.getElementById("btn-derivada");
 
function limpaFuncao() {
  const inputElemento = document.getElementById("funcao");
  const areaResposta = document.getElementById("resultado");
  inputElemento.value = "";
  areaResposta.innerHTML = "Função inválida. Tente novamente!";
}
 
function separaFuncao(funcaoCompleta) {
  const [nome, valor] = funcaoCompleta.split('=');
  return {
    nome: nome.trim(),
    valor: valor.trim()
  };
}
 
function validaFuncao(inputFuncao) {
  try {
    const { valor } = separaFuncao(inputFuncao);
    math.parse(valor); // Valida se é expressão válida
    derivada(valor);
  } catch (e) {
    limpaFuncao();
  }
}
 
function derivada(expr) {
  const areaResposta = document.getElementById("resultado");
 
  try {
    const derivadaExpr = math.simplify(math.derivative(expr, 'x'));
    areaResposta.innerHTML = `Derivada: ${derivadaExpr}`;
    console.log(`Derivada: ${derivadaExpr}`)
  } catch (e) {
    areaResposta.innerHTML = "Erro ao calcular a derivada.";
  }
}
 
btnDerivada.addEventListener("click", () => {
  const inputFuncao = document.getElementById("funcao").value;
  validaFuncao(inputFuncao);
});