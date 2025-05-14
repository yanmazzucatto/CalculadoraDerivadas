

function validaFuncao(inputFuncao) {
  const regex = /^\s*(?:[a-zA-Z]\([a-zA-Z]\)|[a-zA-Z])\s*=\s*[-+]?[\d\w\s^xX+\-*/.]+$/;

  if (regex.test(inputFuncao)) {
    derivada(inputFuncao);
  } else {
    limpaFuncao();
  }
}

function limpaFuncao() {
  const inputElemento = document.getElementById("funcao");
  const areaResposta = document.getElementById("resultado");

  inputElemento.value = "";
  areaResposta.innerHTML = "Isso aí não é uma funçaõ pô, digite novamente!";
}

//desenvolver função, talvez seja interessante criar uma função para separar os termos. Sugestão matheus
function derivada(inputFuncao) {
  const areaResposta = document.getElementById("resultado");
  areaResposta.innerHTML = `Deu certo pô: ${inputFuncao}`;
}



btnDerivada.addEventListener("click", () => {
  const inputFuncao = document.getElementById("funcao").value;
  validaFuncao(inputFuncao);
});
