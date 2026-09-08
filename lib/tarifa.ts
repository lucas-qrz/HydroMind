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
  /**
   * Coleta de esgoto como fração do valor da água.
   * Na Sanasa é 0,80 — verificado pela razão entre os mínimos oficiais
   * (R$ 42,92 ÷ R$ 53,65 = 0,80 exato).
   */
  percentualColeta: number;
  /**
   * Tratamento de esgoto como fração do valor da água.
   * Na Sanasa é 0,43 (R$ 23,07 ÷ R$ 53,65).
   *
   * Atenção: água + coleta + tratamento significa que o esgoto soma 123% do
   * valor da água, não 80%. Tratar esgoto como uma parcela única de 80%
   * subestima a conta em cerca de 24% — erro que a primeira versão deste
   * arquivo cometia.
   */
  percentualTratamento: number;
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
  /** Coleta de esgoto. */
  coleta: number;
  /** Tratamento de esgoto. */
  tratamento: number;
  /** coleta + tratamento. */
  esgoto: number;
  total: number;
  /** Índice (base 0) da faixa mais alta que o consumo alcançou. */
  faixaAtingida: number;
  rotuloFaixaAtingida: string;
  parcelas: ParcelaFaixa[];
}

/**
 * Tarifa residencial da Sanasa, vigente desde 05/02/2026 (reajuste de 5,17%
 * fixado pela ARES-PCJ).
 *
 * O que é OFICIAL aqui:
 *   - consumo mínimo de 10 m³ para a categoria residencial;
 *   - faixa 1 a R$ 5,365/m³, derivada do mínimo divulgado de R$ 53,65 ÷ 10 m³;
 *   - coleta a 80% e tratamento a 43% do valor da água, derivados dos mínimos
 *     oficiais de R$ 42,92 e R$ 23,07 sobre os mesmos R$ 53,65.
 *
 * O que ainda é ESTIMATIVA:
 *   - os preços das faixas 2 em diante. A tabela completa está na Resolução
 *     Tarifária nº 01/2025, publicada em PDF no site da Sanasa, que bloqueia
 *     acesso automatizado (Akamai). Precisa ser aberta manualmente no
 *     navegador e os cinco números transcritos aqui.
 */
export const TARIFA_SANASA_RESIDENCIAL: Tarifa = {
  nome: "Sanasa — Residencial",
  categoria: "RESIDENCIAL",
  faixas: [
    { ateM3: 10, precoM3: 5.365 }, // oficial: R$ 53,65 ÷ 10 m³
    { ateM3: 20, precoM3: 7.89 }, // estimativa
    { ateM3: 30, precoM3: 9.94 }, // estimativa
    { ateM3: 50, precoM3: 12.36 }, // estimativa
    { ateM3: null, precoM3: 14.71 }, // estimativa
  ],
  consumoMinimoM3: 10,
  percentualColeta: 0.8,
  percentualTratamento: 0.43,
  vigenteDesde: "2026-02-05",
  fonte:
    "Sanasa / ARES-PCJ, reajuste de 5,17% vigente desde 05/02/2026. " +
    "Mínimos oficiais: água R$ 53,65, coleta R$ 42,92, tratamento R$ 23,07 " +
    "(10 m³). Faixas 2 a 5: estimativa dos autores — transcrever da " +
    "Resolução Tarifária nº 01/2025.",
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
  const coleta = agua * tarifa.percentualColeta;
  const tratamento = agua * tarifa.percentualTratamento;
  const esgoto = coleta + tratamento;

  return {
    consumoM3,
    consumoFaturadoM3: faturado,
    agua: arredondar(agua),
    coleta: arredondar(coleta),
    tratamento: arredondar(tratamento),
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

/**
 * "Parcela a deduzir" de cada faixa — o formato que aparece na fatura da Sanasa.
 *
 * A concessionária não soma faixa a faixa na conta impressa. Ela multiplica o
 * consumo TOTAL pelo preço da faixa final e subtrai um valor fixo, a parcela a
 * deduzir. O resultado é idêntico ao cálculo cumulativo — é só uma forma mais
 * curta de escrever a mesma conta:
 *
 *     valor da água = consumo × preço da faixa − parcela a deduzir
 *
 * Vale a pena expor isso no painel: o cliente consegue conferir o número do
 * app contra a fatura dele, linha por linha. Um app cujo valor não bate com o
 * boleto perde a confiança do usuário na primeira conta.
 */
export function parcelasADeduzir(
  tarifa: Tarifa = TARIFA_SANASA_RESIDENCIAL,
): number[] {
  const deducoes: number[] = [];

  for (let i = 0; i < tarifa.faixas.length; i++) {
    let deducao = 0;
    let piso = 0;

    for (let j = 0; j < i; j++) {
      const teto = tarifa.faixas[j].ateM3 ?? 0;
      deducao += (teto - piso) * (tarifa.faixas[i].precoM3 - tarifa.faixas[j].precoM3);
      piso = teto;
    }

    deducoes.push(arredondar(deducao));
  }

  return deducoes;
}

export function formatarReais(valor: number): string {
  return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function arredondar(valor: number, casas = 2): number {
  const fator = 10 ** casas;
  return Math.round(valor * fator) / fator;
}
