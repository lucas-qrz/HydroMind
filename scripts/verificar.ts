/**
 * Verificação do motor: o simulador gera dados realistas e os detectores
 * encontram o vazamento injetado — sem acusar vazamento onde não há.
 *
 * Rode com:  npm run verificar
 */

import { simular, leiturasDoDia, volumeTotalM3, agregarPorHora } from "../lib/simulador";
import { analisar, horaLocal } from "../lib/detectores";
import {
  calcularConta,
  calcularImpactoVazamento,
  projetarConsumoMes,
  parcelasADeduzir,
  formatarReais,
  TARIFA_SANASA_RESIDENCIAL,
} from "../lib/tarifa";

const INICIO = new Date("2026-09-01T00:00:00-03:00");
const DIAS = 22;

function titulo(t: string) {
  console.log("\n" + "─".repeat(66));
  console.log(t);
  console.log("─".repeat(66));
}

/* 1 ─ Casa sem vazamento: o motor deve ficar em silêncio ------------- */

titulo("1. CASA NORMAL (sem vazamento) — o motor deve ficar quieto");

const limpo = simular({ inicio: INICIO, dias: DIAS, semente: 7 });
const ultimoDiaLimpo = leiturasDoDia(limpo, DIAS - 1);
const agora = new Date(+INICIO + DIAS * 24 * 60 * 60_000 - 60_000);

console.log(`Leituras geradas:       ${limpo.length} (uma a cada 5 min)`);
console.log(`Consumo em ${DIAS} dias:     ${volumeTotalM3(limpo)} m³`);

const madrugadaLimpa = ultimoDiaLimpo.filter((l) => {
  const h = horaLocal(l.ts);
  return h >= 2 && h < 5;
});
const zerosNaMadrugada = madrugadaLimpa.filter((l) => l.vazaoLpm === 0).length;
console.log(
  `Madrugada (2h–5h):      ${zerosNaMadrugada}/${madrugadaLimpa.length} leituras com vazão ZERO ` +
    `${zerosNaMadrugada > madrugadaLimpa.length * 0.7 ? "✓ realista" : "✗ suspeito"}`,
);

const anomaliasLimpo = analisar({
  leiturasRecentes: ultimoDiaLimpo,
  historico: limpo.slice(0, -288),
  agora,
});
console.log(
  `Anomalias detectadas:   ${anomaliasLimpo.length} ` +
    (anomaliasLimpo.length === 0 ? "✓ nenhum falso positivo" : "✗ FALSO POSITIVO"),
);
anomaliasLimpo.forEach((a) => console.log(`   ! ${a.tipo}: ${a.explicacao}`));

/* 2 ─ Mesma casa, com vazamento injetado ---------------------------- */

titulo("2. MESMA CASA + vazamento de 0,31 L/min a partir do dia 20");

const inicioVazamento = new Date(+INICIO + 19 * 24 * 60 * 60_000 + 22 * 60 * 60_000);
const comVazamento = simular({
  inicio: INICIO,
  dias: DIAS,
  semente: 7,
  vazamento: { vazaoLpm: 0.31, inicio: inicioVazamento, rotulo: "caixa acoplada" },
});

const ultimoDia = leiturasDoDia(comVazamento, DIAS - 1);
const madrugada = ultimoDia.filter((l) => {
  const h = horaLocal(l.ts);
  return h >= 2 && h < 5;
});
const zeros = madrugada.filter((l) => l.vazaoLpm === 0).length;
console.log(`Consumo em ${DIAS} dias:     ${volumeTotalM3(comVazamento)} m³ ` +
  `(+${(volumeTotalM3(comVazamento) - volumeTotalM3(limpo)).toFixed(3)} m³ pelo vazamento)`);
console.log(`Madrugada (2h–5h):      ${zeros}/${madrugada.length} leituras com vazão ZERO ` +
  `${zeros === 0 ? "✓ a vazão nunca zera" : "✗"}`);

const anomalias = analisar({
  leiturasRecentes: ultimoDia,
  historico: comVazamento.slice(0, -288),
  agora,
});
console.log(`Anomalias detectadas:   ${anomalias.length}\n`);

for (const a of anomalias) {
  console.log(`  [${a.severidade}] ${a.tipo}  (confiança ${(a.confianca * 100).toFixed(0)}%)`);
  console.log(`     ${a.explicacao}`);
  console.log(`     evidência: ${JSON.stringify(a.evidencia)}\n`);
}

/* 3 ─ Tarifa progressiva -------------------------------------------- */

titulo("3. TARIFA PROGRESSIVA — por que economizar vale mais que o litro");

console.log(`Tarifa: ${TARIFA_SANASA_RESIDENCIAL.nome} — vigente desde ${TARIFA_SANASA_RESIDENCIAL.vigenteDesde}`);
console.log("⚠  Faixa 1 e percentuais de esgoto são OFICIAIS; faixas 2 a 5 são estimativa.\n");

for (const m3 of [8, 15, 25, 35]) {
  const c = calcularConta(m3);
  console.log(
    `  ${String(m3).padStart(2)} m³ → ${formatarReais(c.total).padStart(10)}  ` +
      `(água ${formatarReais(c.agua)} + esgoto ${formatarReais(c.esgoto)})  ` +
      `faixa ${c.faixaAtingida + 1}`,
  );
}

// Confere contra o mínimo oficial divulgado pela Sanasa.
const minimo = calcularConta(10);
console.log(
  `\n  Conferência do mínimo oficial (10 m³):\n` +
    `    água        ${formatarReais(minimo.agua).padStart(9)}  (oficial R$ 53,65)\n` +
    `    coleta      ${formatarReais(minimo.coleta).padStart(9)}  (oficial R$ 42,92)\n` +
    `    tratamento  ${formatarReais(minimo.tratamento).padStart(9)}  (oficial R$ 23,07)`,
);

const deducoes = parcelasADeduzir();
console.log("\n  Parcela a deduzir por faixa (formato da fatura Sanasa):");
TARIFA_SANASA_RESIDENCIAL.faixas.forEach((f, i) => {
  console.log(
    `    faixa ${i + 1}  R$ ${f.precoM3.toFixed(3).replace(".", ",")}/m³   deduzir ${formatarReais(deducoes[i]).padStart(9)}`,
  );
});
const conferencia = 25 * TARIFA_SANASA_RESIDENCIAL.faixas[2].precoM3 - deducoes[2];
console.log(
  `    25 m³ pela fórmula da fatura: 25 × 9,94 − ${formatarReais(deducoes[2])} = ` +
    `${formatarReais(conferencia)}  ${Math.abs(conferencia - calcularConta(25).agua) < 0.01 ? "✓ bate com o cálculo cumulativo" : "✗ divergente"}`,
);

const c20 = calcularConta(20);
const c21 = calcularConta(21);
console.log(
  `\n  Um único m³ a mais (20 → 21) custa ${formatarReais(c21.total - c20.total)}, ` +
    `enquanto o m³ dentro da faixa 1 custa ${formatarReais(calcularConta(10).total / 10)}.`,
);

/* 4 ─ Impacto financeiro do vazamento -------------------------------- */

titulo("4. O VAZAMENTO EM DINHEIRO — o que o síndico precisa ver");

const consumoAteAgora = volumeTotalM3(comVazamento);
const impacto = calcularImpactoVazamento({
  consumoAcumuladoM3: consumoAteAgora,
  diaAtual: DIAS,
  diasNoMes: 30,
  vazaoVazamentoLpm: 0.31,
});

console.log(`Consumido até o dia ${DIAS}:  ${consumoAteAgora} m³`);
console.log(`Projeção do mês:        ${projetarConsumoMes(consumoAteAgora, DIAS, 30)} m³\n`);
console.log(`  Deixando como está →  ${impacto.consumoComVazamentoM3} m³  ` +
  `= ${formatarReais(impacto.contaComVazamento.total)}  (faixa ${impacto.contaComVazamento.faixaAtingida + 1})`);
console.log(`  Corrigindo hoje    →  ${impacto.consumoCorrigidoM3} m³  ` +
  `= ${formatarReais(impacto.contaCorrigida.total)}  (faixa ${impacto.contaCorrigida.faixaAtingida + 1})`);
console.log(`\n  Economia:             ${formatarReais(impacto.economiaReais)}`);
console.log(`  Água desperdiçada:    ${impacto.litrosDesperdicados} L até o fim do mês`);
console.log(`  Evita subir de faixa: ${impacto.evitaSubirFaixa ? "SIM ← este é o argumento de venda" : "não"}`);

/* 5 ─ Dados do gráfico de 24 h --------------------------------------- */

titulo("5. GRÁFICO DE 24 H — vazão média por hora (último dia, com vazamento)");

const porHora = agregarPorHora(ultimoDia);
const maxVazao = Math.max(...porHora.map((h) => h.vazaoMediaLpm), 0.01);
for (const h of porHora) {
  const largura = Math.round((h.vazaoMediaLpm / maxVazao) * 44);
  const madrugadaMarca = h.hora >= 2 && h.hora < 5 ? " ←madrugada" : "";
  console.log(
    `  ${String(h.hora).padStart(2, "0")}h ${String(h.vazaoMediaLpm.toFixed(2)).padStart(6)} L/min ` +
      `${"█".repeat(largura)}${madrugadaMarca}`,
  );
}

console.log("\n" + "─".repeat(66));
console.log("Verificação concluída.");
console.log("─".repeat(66) + "\n");
