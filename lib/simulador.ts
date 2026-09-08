/**
 * Simulador de consumo de água.
 *
 * Como o projeto não terá hardware físico, este arquivo é a FONTE DE DADOS do
 * produto — não um improviso. Ele é o que torna a demonstração possível: no
 * painel, dá para injetar um vazamento e ver o motor de detecção reagir ao
 * vivo, em vez de esperar semanas por um sensor real pingando devagar.
 *
 * Decisão de projeto: a simulação é por EVENTOS discretos (um banho, uma
 * descarga, um ciclo de máquina), não por uma curva de consumo por hora.
 * Isso importa porque o consumo real tem PAUSAS — e é justamente a ausência
 * de pausas que denuncia um vazamento. Uma curva suave por hora nunca zera,
 * então o detector de fluxo contínuo acusaria vazamento o tempo todo e o
 * produto pareceria funcionar quando não está.
 *
 * O gerador é determinístico (recebe uma semente): a mesma semente produz
 * sempre os mesmos dados. Numa apresentação, isso é a diferença entre uma
 * demo que se repete e uma que surpreende você na frente da banca.
 */

import type { Leitura } from "./detectores";

/** Intervalo entre leituras, em minutos. Um sensor real reporta nessa ordem. */
export const INTERVALO_MIN = 5;
const LEITURAS_POR_DIA = (24 * 60) / INTERVALO_MIN;

export interface TipoEvento {
  nome: string;
  /** Vazão típica do ponto, em L/min. */
  vazaoLpm: number;
  /** Duração em minutos. */
  duracaoMin: number;
  /** Quantas vezes por dia, em média. */
  vezesPorDia: number;
  /** Horas do dia em que o evento costuma acontecer. */
  horasProvaveis: number[];
}

/** Perfil de uma residência de 4 pessoas. Base do consumo simulado. */
export const EVENTOS_RESIDENCIA: TipoEvento[] = [
  { nome: "descarga", vazaoLpm: 6, duracaoMin: 1, vezesPorDia: 20, horasProvaveis: [6, 7, 8, 9, 12, 13, 18, 19, 20, 21, 22] },
  { nome: "chuveiro", vazaoLpm: 9, duracaoMin: 8, vezesPorDia: 4, horasProvaveis: [6, 7, 8, 18, 19, 20, 21] },
  { nome: "pia da cozinha", vazaoLpm: 6, duracaoMin: 3, vezesPorDia: 8, horasProvaveis: [7, 8, 12, 13, 14, 19, 20, 21] },
  { nome: "pia do banheiro", vazaoLpm: 4, duracaoMin: 1, vezesPorDia: 12, horasProvaveis: [6, 7, 8, 12, 18, 19, 21, 22] },
  { nome: "máquina de lavar", vazaoLpm: 12, duracaoMin: 6, vezesPorDia: 0.6, horasProvaveis: [9, 10, 14, 15] },
  { nome: "rega do jardim", vazaoLpm: 11, duracaoMin: 14, vezesPorDia: 0.4, horasProvaveis: [7, 17, 18] },
];

export interface Vazamento {
  /** Vazão constante do vazamento, em L/min. Ex.: 0,31 para caixa acoplada. */
  vazaoLpm: number;
  /** Momento em que o vazamento começou. */
  inicio: Date;
  /** Quando foi corrigido. `null` = ainda aberto. */
  fim?: Date | null;
  rotulo?: string;
}

export interface OpcoesSimulacao {
  /** Primeiro dia da série. */
  inicio: Date;
  dias: number;
  /** Multiplicador de consumo — 1 = residência de 4 pessoas. */
  fator?: number;
  eventos?: TipoEvento[];
  vazamento?: Vazamento | null;
  /** Semente do gerador. Mesma semente = mesma série. */
  semente?: number;
}

/** PRNG determinístico (mulberry32). Simples, rápido e reprodutível. */
function criarAleatorio(semente: number) {
  let a = semente >>> 0;
  return function () {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Gera a série temporal de leituras.
 *
 * O retorno tem uma leitura a cada `INTERVALO_MIN` minutos, com a vazão média
 * do intervalo e o volume consumido nele — exatamente o formato que um sensor
 * de vazão real enviaria.
 */
export function simular(opcoes: OpcoesSimulacao): Leitura[] {
  const {
    inicio,
    dias,
    fator = 1,
    eventos = EVENTOS_RESIDENCIA,
    vazamento = null,
    semente = 42,
  } = opcoes;

  const rnd = criarAleatorio(semente);
  const total = dias * LEITURAS_POR_DIA;

  // Volume (em litros) atribuído a cada slot de 5 minutos.
  const volumePorSlot = new Float64Array(total);

  for (let dia = 0; dia < dias; dia++) {
    const base = new Date(inicio);
    base.setDate(base.getDate() + dia);
    const fimDeSemana = base.getDay() === 0 || base.getDay() === 6;

    for (const evento of eventos) {
      // Fim de semana: mais uso em casa, menos saída pela manhã.
      const ajuste = fimDeSemana ? 1.25 : 1;
      const quantidade = amostrarPoisson(evento.vezesPorDia * fator * ajuste, rnd);

      for (let i = 0; i < quantidade; i++) {
        const hora = evento.horasProvaveis[Math.floor(rnd() * evento.horasProvaveis.length)];
        const minuto = Math.floor(rnd() * 60);
        const inicioMin = hora * 60 + minuto;

        // Duração e vazão variam um pouco a cada uso — ninguém toma dois
        // banhos exatamente iguais.
        const duracao = Math.max(1, evento.duracaoMin * (0.7 + rnd() * 0.6));
        const vazao = evento.vazaoLpm * (0.85 + rnd() * 0.3);

        distribuirEvento(volumePorSlot, dia, inicioMin, duracao, vazao);
      }
    }
  }

  // Monta as leituras e soma o vazamento, se houver.
  const leituras: Leitura[] = [];
  for (let i = 0; i < total; i++) {
    const ts = new Date(+inicio + i * INTERVALO_MIN * 60_000);

    let volume = volumePorSlot[i];
    if (vazamento && ts >= vazamento.inicio && (!vazamento.fim || ts < vazamento.fim)) {
      volume += vazamento.vazaoLpm * INTERVALO_MIN;
    }

    leituras.push({
      ts,
      vazaoLpm: Number((volume / INTERVALO_MIN).toFixed(4)),
      volumeL: Number(volume.toFixed(3)),
    });
  }

  return leituras;
}

/** Espalha o volume de um evento pelos slots de 5 min que ele atravessa. */
function distribuirEvento(
  slots: Float64Array,
  dia: number,
  inicioMin: number,
  duracaoMin: number,
  vazaoLpm: number,
): void {
  const offsetDia = dia * LEITURAS_POR_DIA;
  let restante = duracaoMin;
  let minuto = inicioMin;

  while (restante > 0) {
    const slot = offsetDia + Math.floor(minuto / INTERVALO_MIN);
    if (slot < 0 || slot >= slots.length) break;

    const minutoNoSlot = minuto % INTERVALO_MIN;
    const cabeNoSlot = Math.min(restante, INTERVALO_MIN - minutoNoSlot);

    slots[slot] += vazaoLpm * cabeNoSlot;
    restante -= cabeNoSlot;
    minuto += cabeNoSlot;
  }
}

/** Amostra de uma Poisson — o número de eventos por dia não é fixo. */
function amostrarPoisson(media: number, rnd: () => number): number {
  if (media <= 0) return 0;
  const limite = Math.exp(-media);
  let k = 0;
  let p = 1;
  do {
    k++;
    p *= rnd();
  } while (p > limite);
  return k - 1;
}

/* ------------------------------------------------------------------ *
 * Utilitários para o painel
 * ------------------------------------------------------------------ */

/** Agrega as leituras em 24 pontos horários — o formato do gráfico de 24 h. */
export function agregarPorHora(leituras: Leitura[]): { hora: number; vazaoMediaLpm: number; volumeL: number }[] {
  const baldes = Array.from({ length: 24 }, () => ({ volume: 0, n: 0 }));

  for (const l of leituras) {
    const h = l.ts.getHours();
    baldes[h].volume += l.volumeL;
    baldes[h].n++;
  }

  return baldes.map((b, hora) => ({
    hora,
    vazaoMediaLpm: b.n ? Number((b.volume / (b.n * INTERVALO_MIN)).toFixed(3)) : 0,
    volumeL: Number(b.volume.toFixed(1)),
  }));
}

/** Volume total da série, em litros. */
export function volumeTotalL(leituras: Leitura[]): number {
  return Number(leituras.reduce((s, l) => s + l.volumeL, 0).toFixed(1));
}

/** Volume total da série, em m³ — a unidade da conta de água. */
export function volumeTotalM3(leituras: Leitura[]): number {
  return Number((volumeTotalL(leituras) / 1000).toFixed(3));
}

/** Recorta as leituras de um dia específico (0 = primeiro dia da série). */
export function leiturasDoDia(leituras: Leitura[], dia: number): Leitura[] {
  const inicio = dia * LEITURAS_POR_DIA;
  return leituras.slice(inicio, inicio + LEITURAS_POR_DIA);
}
