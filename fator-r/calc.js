// Lógica do Fator R (LC 123/2006, Anexos III e V). Mesma lógica da planilha Simulador Simples Nacional 2027.
(function (root) {
  var FAIXAS = [180000, 360000, 720000, 1800000, 3600000, 4800000];
  var III = [[0.06, 0], [0.112, 9360], [0.135, 17640], [0.16, 35640], [0.21, 125640], [0.33, 648000]];
  var V = [[0.155, 0], [0.18, 4500], [0.195, 9900], [0.205, 17100], [0.23, 62100], [0.305, 540000]];
  var LIMITE = 0.28, INSS_SOCIO = 0.11;

  function faixa(rbt12) {
    for (var i = 0; i < FAIXAS.length; i++) if (rbt12 <= FAIXAS[i]) return i;
    return -1;
  }
  function efetiva(rbt12, tab) {
    var i = faixa(rbt12);
    if (i < 0) return null;
    return (rbt12 * tab[i][0] - tab[i][1]) / rbt12;
  }
  function calcFatorR(rbt12, folha, fatMes) {
    if (!(rbt12 > 0) || folha < 0 || fatMes < 0) return { erro: "Preencha receita e folha com valores válidos." };
    if (rbt12 > 4800000) return { erro: "Receita acima do limite do Simples Nacional (R$ 4,8 milhões)." };
    var fr = folha / rbt12;
    var anexo = fr >= LIMITE ? "III" : "V";
    var eIII = efetiva(rbt12, III), eV = efetiva(rbt12, V);
    var eAtual = anexo === "III" ? eIII : eV;
    var falta = Math.max(0, LIMITE * rbt12 - folha);
    var economiaAno = (eV - eIII) * rbt12;
    var custoInss = falta * INSS_SOCIO;
    return {
      fatorR: fr, anexo: anexo, faixa: faixa(rbt12) + 1,
      efetivaIII: eIII, efetivaV: eV, efetivaAtual: eAtual,
      dasMes: eAtual * fatMes, dasMesIII: eIII * fatMes, dasMesV: eV * fatMes,
      folhaMinima: LIMITE * rbt12, faltaFolha12: falta, faltaPorMes: falta / 12,
      economiaAno: economiaAno, custoInss: custoInss,
      ganhoLiquido: anexo === "V" ? economiaAno - custoInss : 0
    };
  }
  root.calcFatorR = calcFatorR;
  if (typeof module !== "undefined") module.exports = calcFatorR;
})(typeof window !== "undefined" ? window : globalThis);
