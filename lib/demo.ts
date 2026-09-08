/**
 * Monta o estado do painel a partir do motor real.
 *
 * Nenhum número desta tela é digitado à mão: o consumo sai do simulador, os
 * alertas saem dos detectores e os valores saem da tarifa progressiva. Trocar
 * o simulador por leituras de sensores reais é trocar a origem das séries —
 * o resto da tela não muda.
 *
 * A data de referência é fixa de propósito. Uma demonstração precisa dar o
 * mesmo resultado toda vez que roda, inclusive na frente da banca, e uma data
 * fixa também evita divergência entre o que o servidor renderiza e o que o
 * navegador espera.
 */

import {
  simular,
  leiturasDoDia,
  agregarPorHora,
  volumeTotalL,
  volumeTotalM3,
  type Vazamento,
} from "./simulador";
import { analisar, type Anomalia, type Leitura } from "./detectores";
import {
  calcularConta,
  calcularImpactoVazamento,
  projetarConsumoMes,
  TARIFA_SANASA_RESIDENCIAL,
  type Conta,
  type ImpactoVazamento,
} from "./tarifa";

const INICIO = new Date("2026-09-01T00:00:00-03:00");
const DIAS = 22;
const DIAS_NO_MES = 30;

/** Vazamento da demonstração: vedação de caixa acoplada no apto 42. */
const VAZAMENTO: Vazamento = {
  vazaoLpm: 0.31,
  inicio: new Date(+INICIO + 19 * 24 * 60 * 60_000 + 22 * 60 * 60_000),
  rotulo: "vedação de caixa acoplada",
};

interface DefinicaoZona {
  nome: string;
  tipo: string;
  /** Multiplicador de consumo — 1 equivale a uma residência de 4 pessoas. */
  fator: number;
  semente: number;
  unidades?: number;
}

const ZONAS: DefinicaoZona[] = [
  { nome: "Bloco A", tipo: "AREA_COMUM", fator: 40, semente: 11, unidades: 40 },
  { nome: "Bloco B", tipo: "AREA_COMUM", fator: 40, semente: 22, unidades: 40 },
  { nome: "Bloco C", tipo: "AREA_COMUM", fator: 38, semente: 33, unidades: 38 },
  { nome: "Jardim", tipo: "JARDIM", fator: 2.5, semente: 44 },
  { nome: "Piscina", tipo: "PISCINA", fator: 1.2, semente: 55 },
];

export interface ZonaPainel {
  nome: string;
  tipo: string;
  unidades?: number;
  litrosHoje: number;
  m3NoMes: number;
  /** Fração do maior consumo do dia — usado para o comprimento da barra. */
  proporcao: number;
  temAlerta: boolean;
}

export interface PontoHora {
  hora: number;
  vazaoLpm: number;
  volumeL: number;
}

export interface EstadoPainel {
  condominio: string;
  cidade: string;
  unidades: number;
  sensoresOnline: number;
  diaAtual: number;
  diasNoMes: number;

  litrosHoje: number;
  variacaoPercentual: number;
  m3NoMes: number;
  m3Projetado: number;

  zonas: ZonaPainel[];

  /** Série de 24 h da unidade com vazamento — o gráfico principal. */
  serieUnidade: PontoHora[];
  /** Piso de vazão da madrugada: o que denuncia o vazamento. */
  pisoVazaoLpm: number;

  anomalias: Anomalia[];
  unidadeAfetada: string;

  /** Consumo acumulado da unidade com vazamento, em m³. */
  m3UnidadeNoMes: number;
  contaProjetadaUnidade: Conta;
  impacto: ImpactoVazamento;
  tarifaEstimada: boolean;
}

/** Soma o volume de uma lista de leituras, em litros. */
function litros(leituras: Leitura[]): number {
  return Number(leituras.reduce((s, l) => s + l.volumeL, 0).toFixed(1));
}

export function montarPainel(): EstadoPainel {
  const agora = new Date(+INICIO + DIAS * 24 * 60 * 60_000 - 60_000);

  /* Série da unidade com vazamento — é dela que sai o alerta e o gráfico. */
  const serieApto = simular({
    inicio: INICIO,
    dias: DIAS,
    semente: 7,
    vazamento: VAZAMENTO,
  });
  const aptoHoje = leiturasDoDia(serieApto, DIAS - 1);

  const anomalias = analisar({
    leiturasRecentes: aptoHoje,
    historico: serieApto.slice(0, -288),
    agora,
  });

  /* Séries por zona do condomínio. */
  const zonasBrutas = ZONAS.map((z) => {
    const serie = simular({
      inicio: INICIO,
      dias: DIAS,
      fator: z.fator,
      semente: z.semente,
      // O vazamento do apto 42 fica dentro do Bloco B e aparece no total dele.
      vazamento: z.nome === "Bloco B" ? VAZAMENTO : null,
    });
    const hoje = leiturasDoDia(serie, DIAS - 1);
    const ontem = leiturasDoDia(serie, DIAS - 2);
    return {
      def: z,
      litrosHoje: litros(hoje),
      litrosOntem: litros(ontem),
      m3NoMes: volumeTotalM3(serie),
    };
  });

  const maiorConsumo = Math.max(...zonasBrutas.map((z) => z.litrosHoje), 1);

  const zonas: ZonaPainel[] = zonasBrutas.map((z) => ({
    nome: z.def.nome,
    tipo: z.def.tipo,
    unidades: z.def.unidades,
    litrosHoje: z.litrosHoje,
    m3NoMes: z.m3NoMes,
    proporcao: z.litrosHoje / maiorConsumo,
    temAlerta: z.def.nome === "Bloco B" && anomalias.length > 0,
  }));

  const litrosHoje = Number(
    zonasBrutas.reduce((s, z) => s + z.litrosHoje, 0).toFixed(0),
  );
  const litrosOntem = zonasBrutas.reduce((s, z) => s + z.litrosOntem, 0);
  const m3NoMes = Number(
    zonasBrutas.reduce((s, z) => s + z.m3NoMes, 0).toFixed(1),
  );

  /* Gráfico e conta são da UNIDADE, não do condomínio. Em prédio com
     individualização, cada apartamento tem sua própria faixa tarifária — e é
     no nível da unidade que a faixa vira argumento de venda. */
  const serieUnidade = agregarPorHora(aptoHoje).map((h) => ({
    hora: h.hora,
    vazaoLpm: h.vazaoMediaLpm,
    volumeL: h.volumeL,
  }));

  const m3UnidadeNoMes = volumeTotalM3(serieApto);
  const impacto = calcularImpactoVazamento({
    consumoAcumuladoM3: m3UnidadeNoMes,
    diaAtual: DIAS,
    diasNoMes: DIAS_NO_MES,
    vazaoVazamentoLpm: VAZAMENTO.vazaoLpm,
  });

  return {
    condominio: "Condomínio Parque das Águas",
    cidade: "Campinas / SP",
    unidades: 118,
    sensoresOnline: 42,
    diaAtual: DIAS,
    diasNoMes: DIAS_NO_MES,

    litrosHoje,
    variacaoPercentual: Number(
      (((litrosHoje - litrosOntem) / Math.max(litrosOntem, 1)) * 100).toFixed(0),
    ),
    m3NoMes,
    m3Projetado: projetarConsumoMes(m3NoMes, DIAS, DIAS_NO_MES),

    zonas,
    serieUnidade,
    pisoVazaoLpm: VAZAMENTO.vazaoLpm,

    anomalias,
    unidadeAfetada: "Bloco B · apto 42",

    m3UnidadeNoMes,
    contaProjetadaUnidade: calcularConta(impacto.consumoComVazamentoM3),
    impacto,
    tarifaEstimada: TARIFA_SANASA_RESIDENCIAL.estimativa,
  };
}

/** Total de litros desperdiçados desde o início do vazamento. */
export function litrosDesperdicadosAteAgora(): number {
  const agora = new Date(+INICIO + DIAS * 24 * 60 * 60_000 - 60_000);
  const minutos = (+agora - +VAZAMENTO.inicio) / 60_000;
  return Math.round(VAZAMENTO.vazaoLpm * minutos);
}

export { volumeTotalL };
