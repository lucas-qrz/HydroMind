/**
 * Motor de detecção do Água Alerta.
 *
 * Quatro detectores, em ordem de eficácia comprovada. Nenhum deles é rede
 * neural — e é por isso que funcionam com poucos dados e são explicáveis para
 * o cliente. Um alerta que o morador não entende é um alerta que ele ignora.
 *
 * Correções em relação à primeira versão do backend (`backend/src/anomalies`):
 *   1. A janela de madrugada usava `getUTCHours()`. Campinas é UTC−3, então
 *      "0h às 5h UTC" era, na prática, 21h às 2h no horário local — a janela
 *      errada. Agora a hora é calculada no fuso America/Sao_Paulo.
 *   2. O consumo de madrugada estava com severidade BAIXA. É o sinal com a
 *      MENOR taxa de falso positivo que existe neste domínio: ninguém usa água
 *      dormindo. Passou a ser o detector de maior severidade.
 */

export type TipoAnomalia =
  | "FLUXO_CONTINUO"
  | "CONSUMO_MADRUGADA"
  | "DESVIO_BASELINE"
  | "ASSINATURA_VAZAO";

export type Severidade = "CRITICA" | "ALTA" | "MEDIA" | "BAIXA";

export interface Leitura {
  ts: Date;
  /** Vazão instantânea em litros por minuto. */
  vazaoLpm: number;
  /** Volume consumido desde a leitura anterior, em litros. */
  volumeL: number;
}

export interface Anomalia {
  tipo: TipoAnomalia;
  severidade: Severidade;
  /** 0 a 1 — o quanto o detector está confiante. */
  confianca: number;
  /** Frase pronta para exibir ao usuário. Sem jargão. */
  explicacao: string;
  /** Números que sustentam a explicação, para auditoria e para a tela. */
  evidencia: Record<string, number | string>;
  detectadoEm: Date;
  iniciadoEm: Date;
}

export interface ConfigDetector {
  /** Vazão a partir da qual consideramos que "está correndo água", em L/min. */
  vazaoMinimaLpm: number;
  /** Minutos ininterruptos de fluxo para acusar vazamento contínuo. */
  minutosFluxoContinuo: number;
  /** Volume de madrugada, em litros/hora, a partir do qual soa o alarme. */
  limiteMadrugadaLh: number;
  /** Z-score a partir do qual o consumo é considerado anormal. */
  zScoreLimite: number;
}

export const CONFIG_PADRAO: ConfigDetector = {
  vazaoMinimaLpm: 0.05,
  minutosFluxoContinuo: 45,
  limiteMadrugadaLh: 3,
  zScoreLimite: 3,
};

const FUSO = "America/Sao_Paulo";

/**
 * Hora local (0–23) em Campinas, independente do fuso do servidor.
 *
 * Este é o detalhe que quebrou a versão anterior. Um servidor em UTC e um
 * notebook em UTC−3 precisam concordar sobre o que é "madrugada", senão o
 * detector dispara no horário do jantar.
 */
export function horaLocal(data: Date): number {
  const texto = new Intl.DateTimeFormat("pt-BR", {
    timeZone: FUSO,
    hour: "numeric",
    hour12: false,
  }).format(data);
  return Number(texto) % 24;
}

/** Dia da semana local, 0 = domingo. */
export function diaSemanaLocal(data: Date): number {
  const texto = new Intl.DateTimeFormat("en-US", {
    timeZone: FUSO,
    weekday: "short",
  }).format(data);
  return ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(texto);
}

/* ------------------------------------------------------------------ *
 * Detector 1 — Fluxo contínuo
 * ------------------------------------------------------------------ */

/**
 * Água correndo sem parar por mais de N minutos.
 *
 * O detector mais eficaz do conjunto, e o mais simples. Um banho longo dura
 * 15 minutos; uma máquina de lavar tem ciclos com pausas. Água que corre por
 * 45 minutos ininterruptos, sem nenhuma queda a zero, não é uso humano.
 */
export function detectarFluxoContinuo(
  leituras: Leitura[],
  agora: Date,
  cfg: ConfigDetector = CONFIG_PADRAO,
): Anomalia | null {
  if (leituras.length < 2) return null;

  const ordenadas = [...leituras].sort((a, b) => +a.ts - +b.ts);

  // Caminha de trás para frente enquanto a vazão nunca zerar.
  let inicio: Date | null = null;
  let menorVazao = Infinity;
  for (let i = ordenadas.length - 1; i >= 0; i--) {
    if (ordenadas[i].vazaoLpm < cfg.vazaoMinimaLpm) break;
    inicio = ordenadas[i].ts;
    menorVazao = Math.min(menorVazao, ordenadas[i].vazaoLpm);
  }
  if (!inicio) return null;

  const minutos = (+agora - +inicio) / 60000;
  if (minutos < cfg.minutosFluxoContinuo) return null;

  const litrosPerdidos = menorVazao * minutos;

  return {
    tipo: "FLUXO_CONTINUO",
    severidade: minutos >= cfg.minutosFluxoContinuo * 4 ? "CRITICA" : "ALTA",
    confianca: Math.min(1, minutos / (cfg.minutosFluxoContinuo * 4)),
    explicacao:
      `Água correndo sem parar há ${formatarDuracao(minutos)}, ` +
      `com vazão mínima de ${menorVazao.toFixed(2)} L/min. ` +
      `Nenhum uso doméstico normal dura tanto sem interrupção.`,
    evidencia: {
      minutosContinuos: Math.round(minutos),
      vazaoMinimaLpm: Number(menorVazao.toFixed(3)),
      litrosPerdidos: Math.round(litrosPerdidos),
    },
    detectadoEm: agora,
    iniciadoEm: inicio,
  };
}

/* ------------------------------------------------------------------ *
 * Detector 2 — Piso de madrugada
 * ------------------------------------------------------------------ */

/**
 * Consumo entre 2h e 5h da manhã (horário local).
 *
 * O detector com a menor taxa de falso positivo do domínio. Numa noite normal
 * a vazão encosta em zero; se ela não encosta, a água está indo para algum
 * lugar que não é uma torneira.
 */
export function detectarConsumoMadrugada(
  leituras: Leitura[],
  agora: Date,
  cfg: ConfigDetector = CONFIG_PADRAO,
): Anomalia | null {
  const daMadrugada = leituras.filter((l) => {
    const h = horaLocal(l.ts);
    return h >= 2 && h < 5;
  });
  if (daMadrugada.length < 3) return null;

  const litros = daMadrugada.reduce((s, l) => s + l.volumeL, 0);
  const span = +daMadrugada[daMadrugada.length - 1].ts - +daMadrugada[0].ts;
  const horas = Math.max(span / 3_600_000, 0.5);
  const litrosPorHora = litros / horas;

  if (litrosPorHora < cfg.limiteMadrugadaLh) return null;

  // Se a vazão nunca zerou na janela, é praticamente certeza de vazamento.
  const nuncaZerou = daMadrugada.every((l) => l.vazaoLpm >= cfg.vazaoMinimaLpm);

  return {
    tipo: "CONSUMO_MADRUGADA",
    severidade: nuncaZerou ? "CRITICA" : "ALTA",
    confianca: nuncaZerou ? 0.95 : Math.min(0.85, litrosPorHora / (cfg.limiteMadrugadaLh * 4)),
    explicacao:
      `Consumo de ${litrosPorHora.toFixed(1)} L/h entre 2h e 5h da manhã` +
      (nuncaZerou ? ", sem nenhum momento de vazão zero." : ".") +
      ` Nesse horário o consumo esperado é praticamente nulo.`,
    evidencia: {
      litrosPorHora: Number(litrosPorHora.toFixed(2)),
      litrosNaJanela: Math.round(litros),
      leituras: daMadrugada.length,
      vazaoNuncaZerou: nuncaZerou ? "sim" : "não",
    },
    detectadoEm: agora,
    iniciadoEm: daMadrugada[0].ts,
  };
}

/* ------------------------------------------------------------------ *
 * Detector 3 — Desvio da linha de base
 * ------------------------------------------------------------------ */

/**
 * Compara o consumo atual com o histórico da MESMA hora e do MESMO dia da
 * semana. Sábado 8h se compara com outros sábados 8h, não com a média geral —
 * senão todo fim de semana vira alerta.
 */
export function detectarDesvioBaseline(
  leiturasRecentes: Leitura[],
  historico: Leitura[],
  agora: Date,
  cfg: ConfigDetector = CONFIG_PADRAO,
): Anomalia | null {
  if (leiturasRecentes.length === 0 || historico.length < 20) return null;

  const hora = horaLocal(agora);
  const dia = diaSemanaLocal(agora);

  // Comparar HORA CHEIA contra HORA CHEIA, não leitura contra leitura.
  //
  // O consumo real é feito de eventos curtos com longas pausas: a maioria das
  // leituras de 5 min é zero. Comparando leitura a leitura, a média histórica
  // dá ~0, o desvio dá ~0, e qualquer copo d'água vira "anomalia de 200×".
  // Somando a hora inteira, a distribuição passa a ter significado.
  const volumeDaHoraAtual = leiturasRecentes
    .filter((l) => horaLocal(l.ts) === hora)
    .reduce((s, l) => s + l.volumeL, 0);

  const historicoPorHora = somarPorHoraLocal(
    historico.filter((l) => horaLocal(l.ts) === hora && diaSemanaLocal(l.ts) === dia),
  );
  if (historicoPorHora.length < 3) return null;

  const media = historicoPorHora.reduce((s, v) => s + v, 0) / historicoPorHora.length;
  const desvio = Math.sqrt(
    historicoPorHora.reduce((s, v) => s + (v - media) ** 2, 0) / historicoPorHora.length,
  );

  // Piso de ruído proporcional ao consumo típico, com um mínimo absoluto.
  // Sem isso, um histórico sem variação faz o z-score explodir.
  const desvioSeguro = Math.max(desvio, media * 0.25, 2);

  const excedente = volumeDaHoraAtual - media;
  const z = excedente / desvioSeguro;

  // Dois filtros, não um. O z-score diz que é raro; o excedente absoluto diz
  // que importa. Alertar sobre 3 litros a mais irrita o usuário e ensina ele
  // a ignorar o app — que é o pior resultado possível para o produto.
  const EXCEDENTE_MINIMO_L = 20;
  if (z < cfg.zScoreLimite || excedente < EXCEDENTE_MINIMO_L) return null;

  return {
    tipo: "DESVIO_BASELINE",
    severidade: z >= cfg.zScoreLimite * 2 ? "ALTA" : "MEDIA",
    confianca: Math.min(1, z / (cfg.zScoreLimite * 2)),
    explicacao:
      `Consumo de ${volumeDaHoraAtual.toFixed(0)} L nesta hora, contra ` +
      `${media.toFixed(0)} L habituais em ${nomeDiaSemana(dia)} às ` +
      `${String(hora).padStart(2, "0")}h.`,
    evidencia: {
      zScore: Number(z.toFixed(2)),
      volumeAtualL: Number(volumeDaHoraAtual.toFixed(1)),
      mediaHistoricaL: Number(media.toFixed(1)),
      excedenteL: Number(excedente.toFixed(1)),
      semanasComparadas: historicoPorHora.length,
    },
    detectadoEm: agora,
    iniciadoEm: leiturasRecentes[0].ts,
  };
}

/** Soma o volume por (data local + hora), devolvendo um total por ocorrência. */
function somarPorHoraLocal(leituras: Leitura[]): number[] {
  const baldes = new Map<string, number>();
  for (const l of leituras) {
    const chave = new Intl.DateTimeFormat("pt-BR", {
      timeZone: FUSO,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      hour12: false,
    }).format(l.ts);
    baldes.set(chave, (baldes.get(chave) ?? 0) + l.volumeL);
  }
  return [...baldes.values()];
}

/* ------------------------------------------------------------------ *
 * Detector 4 — Assinatura de vazão
 * ------------------------------------------------------------------ */

export type PontoHidraulico =
  | "CAIXA_ACOPLADA"
  | "TORNEIRA_GOTEJANDO"
  | "TUBULACAO"
  | "REGISTRO_CAIXA"
  | "INDETERMINADO";

const ASSINATURAS: {
  ponto: PontoHidraulico;
  rotulo: string;
  vazaoMin: number;
  vazaoMax: number;
  estabilidadeMax: number;
}[] = [
  { ponto: "TORNEIRA_GOTEJANDO", rotulo: "torneira gotejando", vazaoMin: 0.01, vazaoMax: 0.12, estabilidadeMax: 0.15 },
  { ponto: "CAIXA_ACOPLADA", rotulo: "vedação de caixa acoplada", vazaoMin: 0.12, vazaoMax: 0.6, estabilidadeMax: 0.1 },
  { ponto: "REGISTRO_CAIXA", rotulo: "registro ou boia da caixa d'água", vazaoMin: 0.6, vazaoMax: 2.5, estabilidadeMax: 0.25 },
  { ponto: "TUBULACAO", rotulo: "tubulação (vazamento estrutural)", vazaoMin: 2.5, vazaoMax: Infinity, estabilidadeMax: 0.3 },
];

/**
 * Classifica QUAL ponto hidráulico está vazando, pelo formato do fluxo.
 *
 * A ideia: cada defeito tem uma assinatura própria. Um vaso sanitário com
 * vedação gasta pouco mas de forma extremamente estável; um cano rompido tem
 * vazão alta. A classificação usa dois números — a vazão média e o quanto ela
 * oscila (coeficiente de variação).
 *
 * É o diferencial competitivo do produto: os concorrentes avisam QUE vazou,
 * não ONDE. Aqui está deliberadamente simples e baseado em regras; é o ponto
 * natural para evoluir para aprendizado de máquina quando houver dados reais.
 *
 * IMPORTANTE — passe uma janela em que SÓ o vazamento esteja correndo
 * (a madrugada, tipicamente). Com o dia inteiro, o banho e a máquina de lavar
 * dominam a média e a assinatura do vazamento fica ilegível.
 */
export function classificarAssinatura(
  leituras: Leitura[],
  agora: Date,
): Anomalia | null {
  const comFluxo = leituras.filter((l) => l.vazaoLpm > 0);
  if (comFluxo.length < 10) return null;

  const vazoes = comFluxo.map((l) => l.vazaoLpm);
  const media = vazoes.reduce((s, v) => s + v, 0) / vazoes.length;
  if (media <= 0) return null;

  const desvio = Math.sqrt(
    vazoes.reduce((s, v) => s + (v - media) ** 2, 0) / vazoes.length,
  );
  // Coeficiente de variação: 0 = fluxo perfeitamente constante.
  const estabilidade = desvio / media;

  const casa = ASSINATURAS.find(
    (a) => media >= a.vazaoMin && media < a.vazaoMax && estabilidade <= a.estabilidadeMax,
  );
  if (!casa) return null;

  return {
    tipo: "ASSINATURA_VAZAO",
    severidade: "MEDIA",
    confianca: Number((1 - estabilidade / Math.max(casa.estabilidadeMax, 0.01)).toFixed(2)),
    explicacao: `Assinatura de vazão compatível com ${casa.rotulo}.`,
    evidencia: {
      pontoProvavel: casa.ponto,
      vazaoMediaLpm: Number(media.toFixed(3)),
      coeficienteVariacao: Number(estabilidade.toFixed(3)),
      amostras: comFluxo.length,
    },
    detectadoEm: agora,
    iniciadoEm: comFluxo[0].ts,
  };
}

/* ------------------------------------------------------------------ *
 * Orquestrador
 * ------------------------------------------------------------------ */

const PESO_SEVERIDADE: Record<Severidade, number> = {
  CRITICA: 4,
  ALTA: 3,
  MEDIA: 2,
  BAIXA: 1,
};

/**
 * Roda os quatro detectores e devolve as anomalias da mais grave para a menos
 * grave — a ordem em que o painel deve exibi-las.
 */
export function analisar(params: {
  leiturasRecentes: Leitura[];
  historico?: Leitura[];
  agora?: Date;
  cfg?: ConfigDetector;
}): Anomalia[] {
  const { leiturasRecentes } = params;
  const historico = params.historico ?? [];
  const agora = params.agora ?? new Date();
  const cfg = params.cfg ?? CONFIG_PADRAO;

  // A assinatura só é legível na madrugada, quando nenhum morador está usando
  // água e o único fluxo restante é o do próprio vazamento.
  const janelaMadrugada = leiturasRecentes.filter((l) => {
    const h = horaLocal(l.ts);
    return h >= 2 && h < 5;
  });

  const achados = [
    detectarFluxoContinuo(leiturasRecentes, agora, cfg),
    detectarConsumoMadrugada(leiturasRecentes, agora, cfg),
    detectarDesvioBaseline(leiturasRecentes, historico, agora, cfg),
    classificarAssinatura(janelaMadrugada, agora),
  ].filter((a): a is Anomalia => a !== null);

  return achados.sort(
    (a, b) =>
      PESO_SEVERIDADE[b.severidade] - PESO_SEVERIDADE[a.severidade] ||
      b.confianca - a.confianca,
  );
}

function nomeDiaSemana(dia: number): string {
  return [
    "domingo", "segunda-feira", "terça-feira", "quarta-feira",
    "quinta-feira", "sexta-feira", "sábado",
  ][dia] ?? "dia desconhecido";
}

function formatarDuracao(minutos: number): string {
  if (minutos < 60) return `${Math.round(minutos)} min`;
  const h = Math.floor(minutos / 60);
  const m = Math.round(minutos % 60);
  return m === 0 ? `${h} h` : `${h} h ${m} min`;
}
