import Link from "next/link";
import GraficoVazao from "./GraficoVazao";
import { montarPainel, litrosDesperdicadosAteAgora } from "@/lib/demo";
import { formatarReais, TARIFA_SANASA_RESIDENCIAL } from "@/lib/tarifa";
import type { Severidade } from "@/lib/detectores";

export const metadata = {
  title: "Painel — Água Alerta",
};

const CORES: Record<Severidade, { texto: string; fundo: string; borda: string }> = {
  CRITICA: { texto: "text-critico", fundo: "bg-critico", borda: "border-critico" },
  ALTA: { texto: "text-critico", fundo: "bg-critico", borda: "border-critico" },
  MEDIA: { texto: "text-alerta", fundo: "bg-alerta", borda: "border-alerta" },
  BAIXA: { texto: "text-tinta-2", fundo: "bg-tinta-3", borda: "border-linha" },
};

function nf(v: number, casas = 0) {
  return v.toLocaleString("pt-BR", {
    minimumFractionDigits: casas,
    maximumFractionDigits: casas,
  });
}

export default function Painel() {
  const p = montarPainel();
  const principal = p.anomalias[0];
  const desperdicado = litrosDesperdicadosAteAgora();
  const faixas = TARIFA_SANASA_RESIDENCIAL.faixas;
  const faixaProjetada = p.contaProjetadaUnidade.faixaAtingida;

  return (
    <div className="painel bg-fundo text-tinta min-h-full flex-1">
      {/* Cabeçalho */}
      <header className="border-b border-linha-suave">
        <div className="mx-auto max-w-[1180px] px-5 py-4 flex flex-wrap items-baseline justify-between gap-4">
          <div>
            <div className="font-bold text-[1.05rem]" style={{ fontStretch: "110%" }}>
              {p.condominio}
            </div>
            <div className="text-tinta-3 text-[0.78rem] mt-0.5">
              {p.cidade} · 3 blocos · {p.unidades} unidades · {p.sensoresOnline} sensores online
            </div>
          </div>
          <nav className="flex gap-0.5 text-[0.8rem]">
            <span className="px-3 py-1.5 rounded bg-superficie-2 font-semibold">Visão geral</span>
            <span className="px-3 py-1.5 rounded text-tinta-3">Alertas</span>
            <span className="px-3 py-1.5 rounded text-tinta-3">Unidades</span>
            <span className="px-3 py-1.5 rounded text-tinta-3">Relatórios</span>
            <Link href="/" className="px-3 py-1.5 rounded text-agua">
              ← Site
            </Link>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-[1180px] px-5 pb-16">
        {/* Indicadores */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 border-b border-linha-suave">
          <Kpi
            rotulo="Consumo hoje"
            valor={nf(p.litrosHoje)}
            unidade="L"
            detalhe={`${p.variacaoPercentual >= 0 ? "↑" : "↓"} ${Math.abs(p.variacaoPercentual)}% vs. ontem`}
            cor={p.variacaoPercentual > 10 ? "text-critico" : "text-tinta-3"}
          />
          <Kpi
            rotulo="Acumulado do mês"
            valor={nf(p.m3NoMes, 1)}
            unidade="m³"
            detalhe={`dia ${p.diaAtual} de ${p.diasNoMes}`}
          />
          <Kpi
            rotulo="Alertas ativos"
            valor={String(p.anomalias.length)}
            detalhe={principal ? p.unidadeAfetada : "nenhuma anomalia"}
            cor={p.anomalias.length ? "text-critico" : "text-bom"}
          />
          <Kpi
            rotulo="Desperdiçado até agora"
            valor={nf(desperdicado)}
            unidade="L"
            detalhe="desde o início do vazamento"
            cor="text-critico"
          />
        </section>

        {/* Alerta principal */}
        {principal && (
          <section
            className={`border-l-[3px] ${CORES[principal.severidade].borda} border-b border-b-linha-suave`}
            style={{
              background:
                "linear-gradient(90deg, var(--critico-fundo), transparent 62%)",
            }}
          >
            <div className="p-5 flex flex-wrap gap-4 items-start">
              <span
                className={`rotulo ${CORES[principal.severidade].fundo} text-fundo px-2 py-1 rounded-sm shrink-0 mt-0.5`}
              >
                {principal.severidade}
              </span>

              <div className="flex-1 min-w-[260px]">
                <h2 className="font-bold text-[0.98rem]">
                  Vazamento contínuo — {p.unidadeAfetada}
                </h2>
                <p className="text-[0.85rem] text-tinta-2 mt-1">{principal.explicacao}</p>

                <div className="flex flex-wrap gap-5 mt-3">
                  <Fato rotulo="Perdido até agora" valor={`${nf(desperdicado)} L`} />
                  <Fato
                    rotulo="Se não corrigir"
                    valor={`${formatarReais(p.impacto.economiaReais)}`}
                  />
                  <Fato
                    rotulo="Ponto provável"
                    valor={
                      (p.anomalias.find((a) => a.tipo === "ASSINATURA_VAZAO")?.evidencia
                        .pontoProvavel as string) ?? "em análise"
                    }
                  />
                </div>
              </div>

              <div className="flex flex-wrap gap-2 sm:ml-auto shrink-0">
                <button className="text-[0.8rem] px-3.5 py-1.5 rounded bg-agua text-fundo font-semibold">
                  Avisar morador
                </button>
                <button className="text-[0.8rem] px-3.5 py-1.5 rounded border border-linha text-tinta-2">
                  Abrir ordem de serviço
                </button>
              </div>
            </div>

            {/* Demais detecções */}
            {p.anomalias.length > 1 && (
              <div className="px-5 pb-4 flex flex-col gap-1.5">
                {p.anomalias.slice(1).map((a) => (
                  <div key={a.tipo} className="flex flex-wrap gap-2 items-baseline text-[0.8rem]">
                    <span className={`rotulo ${CORES[a.severidade].texto}`}>{a.severidade}</span>
                    <span className="text-tinta-2">{a.explicacao}</span>
                    <span className="num text-tinta-3 text-[0.72rem]">
                      confiança {(a.confianca * 100).toFixed(0)}%
                    </span>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* Gráfico + zonas */}
        <section className="grid grid-cols-1 lg:grid-cols-[1.5fr_1fr] border-b border-linha-suave">
          <div className="p-5 lg:border-r border-linha-suave">
            <Cabecalho titulo="Vazão nas últimas 24 h" sub={`L/min · ${p.unidadeAfetada}`} />
            <GraficoVazao serie={p.serieUnidade} pisoVazaoLpm={p.pisoVazaoLpm} />
          </div>

          <div className="p-5">
            <Cabecalho titulo="Consumo por zona" sub="hoje" />
            <div className="flex flex-col gap-3.5">
              {p.zonas.map((z) => (
                <div key={z.nome}>
                  <div className="flex items-baseline justify-between gap-3">
                    <span className="text-[0.84rem]">
                      {z.nome}
                      {z.unidades && (
                        <span className="num text-tinta-3 text-[0.7rem] ml-1.5">
                          {z.unidades} un.
                        </span>
                      )}
                    </span>
                    <span
                      className={`num text-[0.83rem] ${z.temAlerta ? "text-critico" : "text-tinta-2"}`}
                    >
                      {nf(z.litrosHoje)} L
                    </span>
                  </div>
                  <div className="h-[5px] rounded-full bg-superficie-2 overflow-hidden mt-1.5">
                    <div
                      className={`h-full rounded-full ${z.temAlerta ? "bg-critico" : "bg-agua"}`}
                      style={{ width: `${Math.max(z.proporcao * 100, 3)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Faixa tarifária */}
        <section className="p-5">
          <Cabecalho
            titulo="Faixa tarifária projetada"
            sub={`${p.unidadeAfetada} · categoria residencial`}
          />

          <div className="flex h-9 rounded overflow-hidden mt-3">
            {faixas.map((f, i) => {
              const anterior = i === 0 ? 0 : (faixas[i - 1].ateM3 ?? 0);
              const rotulo =
                f.ateM3 === null ? `> ${anterior} m³` : `${anterior === 0 ? 0 : anterior + 1}–${f.ateM3} m³`;
              const atingida = i === faixaProjetada;
              return (
                <div
                  key={i}
                  className={`flex-1 flex items-center justify-center num text-[0.68rem] border-r border-fundo last:border-r-0 ${
                    atingida ? "text-alerta font-semibold" : "text-tinta-2"
                  }`}
                  style={{
                    background: atingida
                      ? "var(--alerta-fundo)"
                      : i < faixaProjetada
                        ? "var(--agua-fundo)"
                        : "var(--superficie-2)",
                  }}
                >
                  {rotulo}
                  {atingida && " ←"}
                </div>
              );
            })}
          </div>

          <div className="flex justify-between num text-[0.7rem] text-tinta-3 mt-2">
            <span>unidade acumulou: {nf(p.m3UnidadeNoMes, 1)} m³</span>
            <span>projeção do mês: {nf(p.impacto.consumoComVazamentoM3, 1)} m³</span>
          </div>

          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
            <Cenario
              titulo="Deixando como está"
              m3={p.impacto.consumoComVazamentoM3}
              valor={p.impacto.contaComVazamento.total}
              faixa={p.impacto.contaComVazamento.faixaAtingida + 1}
              ruim
            />
            <Cenario
              titulo="Corrigindo hoje"
              m3={p.impacto.consumoCorrigidoM3}
              valor={p.impacto.contaCorrigida.total}
              faixa={p.impacto.contaCorrigida.faixaAtingida + 1}
            />
          </div>

          {p.impacto.evitaSubirFaixa && (
            <p className="text-[0.87rem] text-tinta-2 mt-4 max-w-[68ch]">
              A tarifa é progressiva.{" "}
              <strong className="text-alerta">
                Corrigir o vazamento mantém a unidade na faixa{" "}
                {p.impacto.contaCorrigida.faixaAtingida + 1}
              </strong>{" "}
              até o fechamento — a economia de {formatarReais(p.impacto.economiaReais)} não é
              proporcional ao litro, é um degrau inteiro de preço.
            </p>
          )}

          {p.tarifaEstimada && (
            <p className="text-[0.75rem] text-tinta-3 mt-4 num">
              ⚠ Faixa 1 e percentuais de esgoto são oficiais (Sanasa, vigência 05/02/2026).
              Faixas 2 a 5 são estimativa — substituir pela Resolução Tarifária nº 01/2025.
            </p>
          )}
        </section>
      </main>
    </div>
  );
}

/* ---------- peças ---------- */

function Kpi({
  rotulo,
  valor,
  unidade,
  detalhe,
  cor = "text-tinta-3",
}: {
  rotulo: string;
  valor: string;
  unidade?: string;
  detalhe: string;
  cor?: string;
}) {
  return (
    <div className="p-5 border-b sm:border-b-0 sm:border-r last:border-r-0 border-linha-suave flex flex-col gap-1">
      <span className="rotulo text-tinta-3">{rotulo}</span>
      <span className="num text-[1.5rem] font-semibold leading-tight tracking-tight">
        {valor}
        {unidade && <span className="text-[0.82rem] text-tinta-3 font-normal ml-1">{unidade}</span>}
      </span>
      <span className={`text-[0.74rem] ${cor}`}>{detalhe}</span>
    </div>
  );
}

function Fato({ rotulo, valor }: { rotulo: string; valor: string }) {
  return (
    <div>
      <div className="rotulo text-tinta-3">{rotulo}</div>
      <div className="num text-[0.94rem] font-semibold mt-0.5">{valor}</div>
    </div>
  );
}

function Cabecalho({ titulo, sub }: { titulo: string; sub: string }) {
  return (
    <div className="flex items-baseline justify-between gap-3 mb-4">
      <h2 className="text-[0.88rem] font-bold">{titulo}</h2>
      <span className="num text-[0.7rem] text-tinta-3">{sub}</span>
    </div>
  );
}

function Cenario({
  titulo,
  m3,
  valor,
  faixa,
  ruim = false,
}: {
  titulo: string;
  m3: number;
  valor: number;
  faixa: number;
  ruim?: boolean;
}) {
  return (
    <div
      className={`rounded border p-4 ${ruim ? "border-critico" : "border-bom"}`}
      style={{ background: ruim ? "var(--critico-fundo)" : "var(--bom-fundo)" }}
    >
      <div className="rotulo text-tinta-3">{titulo}</div>
      <div className="num text-[1.3rem] font-semibold mt-1">{formatarReais(valor)}</div>
      <div className="num text-[0.74rem] text-tinta-2 mt-0.5">
        {m3.toLocaleString("pt-BR", { maximumFractionDigits: 1 })} m³ · faixa {faixa}
      </div>
    </div>
  );
}
