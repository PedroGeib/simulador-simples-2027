// Dimensionamento de circuito (NBR 5410, cobre, PVC 70 °C). Mesma lógica da Planilha Eletricista PRO.
// Tabela 36 transcrita de reprodução do Guia Prysmian; fatores das Tabelas 40 e 42 são valores usuais. Confirme na norma.
(function (root) {
  var SEC = [1.5, 2.5, 4, 6, 10, 16, 25, 35, 50, 70, 95, 120, 150, 185, 240];
  var AMP = { // [B1 2c, B1 3c, B2 2c, B2 3c, C 2c, C 3c]
    1.5: [17.5, 15.5, 16.5, 15, 19.5, 17.5], 2.5: [24, 21, 23, 20, 27, 24], 4: [32, 28, 30, 27, 36, 32],
    6: [41, 36, 38, 34, 46, 41], 10: [57, 50, 52, 46, 63, 57], 16: [76, 68, 69, 62, 85, 76],
    25: [101, 89, 90, 80, 112, 96], 35: [125, 110, 111, 99, 138, 119], 50: [151, 134, 133, 118, 168, 144],
    70: [192, 171, 168, 149, 213, 184], 95: [232, 207, 201, 179, 258, 223], 120: [269, 239, 232, 206, 299, 259],
    150: [309, 275, 265, 236, 344, 299], 185: [353, 312, 300, 268, 392, 341], 240: [415, 370, 351, 313, 461, 403] };
  var COL = { "B1": 0, "B2": 2, "C": 4 };
  var TEMP = { 10: 1.22, 15: 1.17, 20: 1.12, 25: 1.06, 30: 1.00, 35: 0.94, 40: 0.87, 45: 0.79, 50: 0.71, 55: 0.61, 60: 0.50 };
  var GRUPO = { 1: 1.00, 2: 0.80, 3: 0.70, 4: 0.65, 5: 0.60, 6: 0.57, 7: 0.54, 8: 0.52, 9: 0.50, 12: 0.45, 16: 0.41, 20: 0.38 };
  var DISJ = [10, 16, 20, 25, 32, 40, 50, 63, 70, 80, 90, 100, 125, 150, 175, 200, 225, 250];
  var RHO = 0.0225;

  function calcCircuito(o) {
    var tri = o.sistema === "Trifásico";
    if (!(o.tensao > 0) || !(o.potencia > 0) || !(o.fp > 0 && o.fp <= 1) || !(o.comprimento > 0) || !(o.quedaMax > 0))
      return { erro: "Preencha todos os campos com valores válidos (fator de potência entre 0 e 1)." };
    var ib = tri ? o.potencia / (Math.sqrt(3) * o.tensao * o.fp) : o.potencia / (o.tensao * o.fp);
    var inn = null;
    for (var i = 0; i < DISJ.length; i++) if (DISJ[i] >= ib) { inn = DISJ[i]; break; }
    if (inn === null) return { erro: "Corrente de " + ib.toFixed(0) + " A acima de 250 A: fora do alcance desta calculadora." };
    var fT = TEMP[o.temp], fG = GRUPO[o.grupo];
    var izMin = inn / (fT * fG);
    var c = COL[o.metodo] + (tri ? 1 : 0);
    var k = tri ? Math.sqrt(3) : 2;
    var sQueda = k * RHO * o.comprimento * ib / (o.quedaMax / 100 * o.tensao);
    var iCap = -1, iQ = -1, s;
    for (s = 0; s < SEC.length; s++) { if (iCap < 0 && AMP[SEC[s]][c] >= izMin) iCap = s; if (iQ < 0 && SEC[s] >= sQueda) iQ = s; }
    if (iCap < 0 || iQ < 0) return { erro: "Nenhuma seção até 240 mm² atende. Reveja potência, distância ou método." };
    var iMin = o.tipo === "Iluminação" ? 0 : 1;
    var iF = Math.max(iCap, iQ, iMin);
    var secF = SEC[iF];
    var queda = k * RHO * o.comprimento * ib / (secF * o.tensao) * 100;
    var motivo = iF === iCap && iCap >= iQ && iCap >= iMin ? "capacidade de corrente" : (iF === iQ && iQ >= iMin ? "queda de tensão" : "seção mínima da norma");
    return { ib: ib, disjuntor: inn, fT: fT, fG: fG, izMin: izMin, secCap: SEC[iCap], secQueda: SEC[iQ], secMin: SEC[iMin],
             secao: secF, queda: queda, ok: queda <= o.quedaMax, motivo: motivo, capCorrigida: AMP[secF][c] * fT * fG };
  }
  root.calcCircuito = calcCircuito;
  if (typeof module !== "undefined") module.exports = calcCircuito;
})(typeof window !== "undefined" ? window : globalThis);
