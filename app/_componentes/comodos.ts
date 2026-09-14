/*
 * Cômodos monitorados na casa 3D da abertura.
 *
 * Arquivo compartilhado entre a cena 3D (que usa as posições) e o cartão de
 * detalhes (que usa os textos). Os textos seguem a regra da landing: nenhum
 * número, só o que o sensor faz.
 */

export type IdComodo = "cozinha" | "banheiro" | "area" | "jardim" | "caixa";

export interface Comodo {
  id: IdComodo;
  nome: string;
  sensor: string;
  detecta: string;
  estado: "normal" | "atencao";
  /** Ponto para onde a câmera olha ao aproximar do cômodo. */
  foco: [number, number, number];
  /** Posição do marcador do sensor na cena. */
  pino: [number, number, number];
}

export const COMODOS: Comodo[] = [
  {
    id: "cozinha",
    nome: "Cozinha",
    sensor: "Sensor de vazão na pia",
    detecta: "Cada uso acompanhado em tempo real.",
    estado: "normal",
    foco: [-1.5, 0.3, -1],
    pino: [-1.5, 0.82, -1.72],
  },
  {
    id: "banheiro",
    nome: "Banheiro",
    sensor: "Sensores na descarga e no chuveiro",
    detecta: "Água correndo sem parar: possível vazamento na descarga.",
    estado: "atencao",
    foco: [-1.9, 0.3, 0.9],
    pino: [-2.6, 0.85, 0.16],
  },
  {
    id: "area",
    nome: "Área de serviço",
    sensor: "Sensores na máquina e no tanque",
    detecta: "Ciclos de lavagem reconhecidos automaticamente.",
    estado: "normal",
    foco: [1.0, 0.3, 0.9],
    pino: [0.1, 0.98, 0.36],
  },
  {
    id: "jardim",
    nome: "Jardim",
    sensor: "Sensor na torneira externa",
    detecta: "Rega fora do horário ou do padrão é sinalizada.",
    estado: "normal",
    foco: [4.1, 0.3, 0.4],
    pino: [3.4, 0.72, 0.6],
  },
  {
    id: "caixa",
    nome: "Caixa d'água",
    sensor: "Sensor de nível e de boia",
    detecta: "Transbordo e boia travada avisados na hora.",
    estado: "normal",
    foco: [4.3, 1.1, -1.6],
    pino: [4.3, 2.08, -1.6],
  },
];
