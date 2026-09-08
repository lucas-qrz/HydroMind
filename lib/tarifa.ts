/**
 * Tarifa de água em faixas progressivas.
 *
 * Por que isso importa: a conta de água NÃO é linear. A concessionária cobra
 * por faixas — os primeiros 10 m³ custam um preço, os próximos 10 custam mais
 * caro, e assim por diante. Cada m³ é cobrado pelo preço da faixa em que ele
 * cai, não pelo preço da faixa final.
 *
 * A consequência comercial é o melhor argumento de venda do Água Alerta:
 * economizar 3 m³ pode valer muito mais do que 3× o preço do m³, porque pode
 * impedir o consumo de subir um degrau inteiro de faixa.
 *
 * ATENÇÃO — os valores em `TARIFA_SANASA_RESIDENCIAL` são ESTIMATIVAS.
 * A tabela oficial da Sanasa ainda não foi obtida pelo grupo. A estrutura de
 * faixas está correta; os preços precisam ser substituídos pelos reais antes
 * de qualquer uso que não seja acadêmico. Ver `fonte` em cada tarifa.
 */

export type CategoriaTarifa =
  | "RESIDENCIAL"
  | "RESIDENCIAL_SOCIAL"
  | "COMERCIAL"
  | "INDUSTRIAL"
  | "PUBLICA";

export interface FaixaTarifaria {
  /** Limite superior da faixa, em m³. `null` significa "sem limite" (última faixa). */
  ateM3: number | null;
  /** Preço do m³ DENTRO desta faixa, em reais. */
  precoM3: number;
}

export interface Tarifa {
  nome: string;
  categoria: CategoriaTarifa;
  /**
   * Faixas em ordem crescente. A primeira faixa costuma ser o "consumo mínimo":
   * cobrado integralmente mesmo que o cliente consuma menos que ela.
   */
  faixas: FaixaTarifaria[];
  /** Volume mínimo faturado, em m³. Consumir menos que isso não reduz a conta. */
  consumoMinimoM3: number;
  /** Esgoto como fração do valor da água (0.8 = 80%). */
  percentualEsgoto: number;
  vigenteDesde: string;
  /** De onde vieram os números. Obrigatório — o trabalho precisa citar a fonte. */
  fonte: string;
  /** `true` enquanto os valores forem estimados e não oficiais. */
  estimativa: boolean;
}

export interface ParcelaFaixa {
  indice: number;
  rotulo: string;
  /** Quantos m³ do consumo caíram nesta faixa. */
  m3NaFaixa: number;
  precoM3: number;
  valor: number;
}

export interface Conta {
  consumoM3: number;
  /** Volume efetivamente faturado (nunca menor que o consumo mínimo). */
  consumoFaturadoM3: number;
  agua: number;
  esgoto: number;
  total: number;
  /** Índice (base 0) da faixa mais alta que o consumo alcançou. */
  faixaAtingida: number;
  rotuloFaixaAtingida: string;
  parcelas: ParcelaFaixa[];
}

/**
 * ESTIMATIVA — estrutura de faixas no padrão praticado pela Sanasa (Campinas),
 * com preços aproximados. Substituir pelos valores da tabela oficial.
 */
export const TARIFA_SANASA_RESIDENCIAL: Tarifa = {
  nome: "Sanasa — Residencial (estimativa)",
  categoria: "RESIDENCIAL",
  faixas: [
    { ateM3: 10, precoM3: 5.42 },
    { ateM3: 20, precoM3: 7.89 },
    { ateM3: 30, precoM3: 9.94 },
    { ateM3: 50, precoM3: 12.36 },
    { ateM3: null, precoM3: 14.71 },
  ],
  consumoMinimoM3: 10,
  percentualEsgoto: 0.8,
  vigenteDesde: "2026-01-01",
  fonte:
    "Estimativa dos autores com base na estrutura tarifária da Sanasa/ARES-PCJ. " +
    "Valores NÃO oficiais — substituir pela tabela publicada.",
  estimativa: true,
};

function rotuloDaFaixa(faixas: FaixaTarifaria[], i: number): string {
  const inicio = i === 0 ? 0 : (faixas[i - 1].ateM3 ?? 0);
  const fim = faixas[i].ateM3;
  if (fim === null) return `acima de ${inicio} m³`;
  return `${inicio === 0 ? 0 : inicio + 1}–${fim} m³`;
}

/**
 * Calcula a conta aplicando as faixas de forma progressiva (cumulativa).
 *
 * Exemplo com as faixas padrão e consumo de 27 m³:
 *   10 m³ × R$ 5,42  (faixa 1)
 * + 10 m³ × R$ 7,89  (faixa 2)
 * +  7 m³ × R$ 9,94  (faixa 3)
 * = água; esgoto = 80% da água.
 */
export function calcularConta(
  consumoM3: number,
  tarifa: Tarifa = TARIFA_SANASA_RESIDENCIAL,
): Conta {
  const faturado = Math.max(consumoM3, tarifa.consumoMinimoM3);

  const parcelas: ParcelaFaixa[] = [];
  let restante = faturado;
  let pisoDaFaixa = 0;
  let faixaAtingida = 0;

  for (let i = 0; i < tarifa.faixas.length && restante > 0; i++) {
    const faixa = tarifa.faixas[i];
    const tetoDaFaixa = faixa.ateM3 ?? Infinity;
    const larguraDaFaixa = tetoDaFaixa - pisoDaFaixa;
    const m3NaFaixa = Math.min(restante, larguraDaFaixa);

    parcelas.push({
      indice: i,
      rotulo: rotuloDaFaixa(tarifa.faixas, i),
      m3NaFaixa,
      precoM3: faixa.precoM3,
      valor: m3NaFaixa * faixa.precoM3,
    });

    faixaAtingida = i;
    restante -= m3NaFaixa;
    pisoDaFaixa = tetoDaFaixa;
  }

  const agua = parcelas.reduce((soma, p) => soma + p.valor, 0);
  const esgoto = agua * tarifa.percentualEsgoto;

  return {
    consumoM3,
    consumoFaturadoM3: faturado,
    agua: arredondar(agua),
    esgoto: arredondar(esgoto),
    total: arredondar(agua + esgoto),
    faixaAtingida,
    rotuloFaixaAtingida: rotuloDaFaixa(tarifa.faixas, faixaAtingida),
    parcelas,
  };
}

/**
 * Projeta o consumo do mês inteiro a partir do que já foi consumido.
 *
 * Usa média diária simples. É deliberadamente ingênuo: com poucos dias de
 * histórico, qualquer modelo mais sofisticado erra mais do que acerta, e o
 * usuário precisa entender de onde veio o número que aparece na tela.
 */
export function projetarConsumoMes(
  consumoAcumuladoM3: number,
  diaAtual: number,
  diasNoMes: number,
): number {
  if (diaAtual <= 0) return 0;
  const mediaDiaria = consumoAcumuladoM3 / diaAtual;
  return arredondar(mediaDiaria * diasNoMes, 2);
}

export interface ImpactoVazamento {
  /** Consumo projetado se o vazamento continuar até o fim do mês. */
  consumoComVazamentoM3: number;
  /** Consumo projetado se o vazamento for corrigido hoje. */
  consumoCorrigidoM3: number;
  contaComVazamento: Conta;
  contaCorrigida: Conta;
  /** Quanto o cliente deixa de pagar ao corrigir hoje. */
  economiaReais: number;
  litrosDesperdicados: number;
  /** `true` quando corrigir o vazamento impede a subida de faixa. */
  evitaSubirFaixa: boolean;
}

/**
 * Traduz um vazamento em dinheiro — a única linguagem que faz o síndico agir.
 *
 * Responde: "quanto custa deixar esse vazamento aberto até o fim do mês?"
 * e, principalmente, "corrigir hoje impede o condomínio de subir de faixa?"
 */
export function calcularImpactoVazamento(params: {
  consumoAcumuladoM3: number;
  diaAtual: number;
  diasNoMes: number;
  vazaoVazamentoLpm: number;
  tarifa?: Tarifa;
}): ImpactoVazamento {
  const { consumoAcumuladoM3, diaAtual, diasNoMes, vazaoVazamentoLpm } = params;
  const tarifa = params.tarifa ?? TARIFA_SANASA_RESIDENCIAL;

  const diasRestantes = Math.max(0, diasNoMes - diaAtual);
  const m3PorDiaDeVazamento = (vazaoVazamentoLpm * 60 * 24) / 1000;

  const projetadoBase = projetarConsumoMes(consumoAcumuladoM3, diaAtual, diasNoMes);
  const consumoComVazamento = projetadoBase;
  const consumoCorrigido = arredondar(
    projetadoBase - m3PorDiaDeVazamento * diasRestantes,
    2,
  );

  const contaComVazamento = calcularConta(consumoComVazamento, tarifa);
  const contaCorrigida = calcularConta(Math.max(0, consumoCorrigido), tarifa);

  return {
    consumoComVazamentoM3: consumoComVazamento,
    consumoCorrigidoM3: Math.max(0, consumoCorrigido),
    contaComVazamento,
    contaCorrigida,
    economiaReais: arredondar(contaComVazamento.total - contaCorrigida.total),
    litrosDesperdicados: Math.round(vazaoVazamentoLpm * 60 * 24 * diasRestantes),
    evitaSubirFaixa: contaCorrigida.faixaAtingida < contaComVazamento.faixaAtingida,
  };
}

export function formatarReais(valor: number): string {
  return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function arredondar(valor: number, casas = 2): number {
  const fator = 10 ** casas;
  return Math.round(valor * fator) / fator;
}
