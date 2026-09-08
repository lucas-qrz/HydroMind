import type { PontoHora } from "@/lib/demo";

/*
 * Gráfico de vazão nas últimas 24 horas.
 *
 * É a peça central do painel, e a razão é simples: numa noite normal a linha
 * encosta em zero. Quando há vazamento ela não encosta — fica travada num
 * piso. Qualquer pessoa entende isso em dois segundos, sem legenda e sem
 * explicação técnica.
 *
 * SVG escrito à mão em vez de biblioteca de gráficos: são 30 linhas, não
 * adiciona dependência, não briga com versão de React e dá controle total
 * sobre a anotação do piso de vazão — que é justamente o que precisa aparecer.
 */

const L = 56; // margem esquerda (espaço para os rótulos do eixo Y)
const R = 700; // margem direita
const TOPO = 20;
const BASE = 170;

interface Props {
  serie: PontoHora[];
  /** Vazão do vazamento, em L/min. Desenha a linha tracejada do piso. */
  pisoVazaoLpm?: number;
}

export default function GraficoVazao({ serie, pisoVazaoLpm }: Props) {
  const max = Math.max(...serie.map((p) => p.vazaoLpm), 0.1);
  const passo = (R - L) / (serie.length - 1);

  const x = (i: number) => L + i * passo;
  const y = (v: number) => BASE - (v / max) * (BASE - TOPO);

  const pontos = serie.map((p, i) => `${x(i).toFixed(1)},${y(p.vazaoLpm).toFixed(1)}`);
  const linha = pontos.join(" ");
  const area = `${L},${BASE} ${linha} ${R},${BASE}`;

  const yPiso = pisoVazaoLpm ? y(pisoVazaoLpm) : null;

  // A faixa da madrugada: das 2h às 5h.
  const xMadrugadaIni = x(2);
  const xMadrugadaFim = x(5);

  return (
    <div className="overflow-x-auto">
      <svg
        viewBox="0 0 730 212"
        className="block w-full min-w-[520px] h-auto"
        role="img"
        aria-label={
          `Vazão em litros por minuto ao longo de 24 horas. ` +
          (pisoVazaoLpm
            ? `A vazão nunca chega a zero: há um piso constante de ${pisoVazaoLpm} litros por minuto, inclusive na madrugada.`
            : `A vazão retorna a zero nos períodos sem uso.`)
        }
      >
        {/* Faixa da madrugada */}
        <rect
          x={xMadrugadaIni}
          y={TOPO}
          width={xMadrugadaFim - xMadrugadaIni}
          height={BASE - TOPO}
          fill="var(--critico)"
          opacity="0.1"
        />
        <text
          x={(xMadrugadaIni + xMadrugadaFim) / 2}
          y={TOPO + 14}
          fill="var(--critico)"
          className="num"
          fontSize="9"
          textAnchor="middle"
        >
          02h–05h
        </text>

        {/* Grade horizontal */}
        <line x1={L} y1={TOPO} x2={R} y2={TOPO} stroke="var(--linha-suave)" strokeWidth="1" />
        <line x1={L} y1={(TOPO + BASE) / 2} x2={R} y2={(TOPO + BASE) / 2} stroke="var(--linha-suave)" strokeWidth="1" />
        <line x1={L} y1={BASE} x2={R} y2={BASE} stroke="var(--linha)" strokeWidth="1" />

        {[max, max / 2, 0].map((v, i) => (
          <text
            key={i}
            x={L - 10}
            y={y(v) + 4}
            fill="var(--tinta-3)"
            className="num"
            fontSize="9"
            textAnchor="end"
          >
            {v.toFixed(1).replace(".", ",")}
          </text>
        ))}

        {/* Área e linha de vazão */}
        <polygon points={area} fill="var(--agua)" opacity="0.16" />
        <polyline
          points={linha}
          fill="none"
          stroke="var(--agua)"
          strokeWidth="2"
          strokeLinejoin="round"
          strokeLinecap="round"
        />

        {/* Piso de vazão — a evidência do vazamento */}
        {yPiso !== null && (
          <>
            <line
              x1={L}
              y1={yPiso}
              x2={R}
              y2={yPiso}
              stroke="var(--critico)"
              strokeWidth="1.5"
              strokeDasharray="4 4"
            />
            <circle cx={x(3.5)} cy={yPiso} r="3.5" fill="var(--critico)" />
            <line
              x1={x(3.5)}
              y1={yPiso - 3}
              x2={x(5.3)}
              y2={yPiso - 13}
              stroke="var(--critico)"
              strokeWidth="1"
            />
            <text
              x={x(5.5)}
              y={yPiso - 10}
              fill="var(--critico)"
              className="num"
              fontSize="10"
            >
              piso de {pisoVazaoLpm!.toFixed(2).replace(".", ",")} L/min — a vazão nunca zera
            </text>
          </>
        )}

        {/* Eixo X */}
        {[0, 6, 12, 18, 23].map((h, i) => (
          <text
            key={h}
            x={x(h)}
            y={190}
            fill="var(--tinta-3)"
            className="num"
            fontSize="9"
            textAnchor={i === 0 ? "start" : i === 4 ? "end" : "middle"}
          >
            {String(h).padStart(2, "0")}h
          </text>
        ))}

        <text x={L} y={207} fill="var(--tinta-2)" fontSize="10">
          {pisoVazaoLpm
            ? "Numa noite normal a linha encosta em zero. Aqui ela não encosta — é isso que o detector procura."
            : "A vazão retorna a zero entre os usos, como se espera de um consumo normal."}
        </text>
      </svg>
    </div>
  );
}
