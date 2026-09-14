"use client";

/*
 * Abas "Detectar / Localizar / Economizar": cada uma troca o texto e uma
 * pequena ilustração animada da interface. Sem números — as ilustrações
 * representam a tela, não dados.
 */

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";

const ABAS = [
  {
    id: "detectar",
    rotulo: "Detectar",
    titulo: "Percebe o que foge do normal",
    texto:
      "Água correndo sem parar, consumo na madrugada, picos fora do padrão. O Água Alerta aprende o ritmo do seu imóvel e reconhece na hora quando algo muda.",
  },
  {
    id: "localizar",
    rotulo: "Localizar",
    titulo: "Mostra onde está o problema",
    texto:
      "Com sensores por ambiente, o alerta já chega com o endereço: qual cômodo, bloco ou setor. Menos tempo procurando, mais tempo resolvendo.",
  },
  {
    id: "economizar",
    rotulo: "Economizar",
    titulo: "Transforma alerta em economia",
    texto:
      "Cada vazamento corrigido cedo é desperdício que não chega à conta. Você acompanha o consumo e sabe como o mês vai fechar antes do boleto.",
  },
] as const;

type IdAba = (typeof ABAS)[number]["id"];

export default function Abas() {
  const [ativa, setAtiva] = useState<IdAba>("detectar");
  const aba = ABAS.find((a) => a.id === ativa)!;

  return (
    <div>
      <div className="flex justify-center">
        <div role="tablist" aria-label="O que o Água Alerta faz" className="inline-flex rounded-full bg-superficie-2 border border-linha p-1.5 gap-1">
          {ABAS.map((a) => (
            <button
              key={a.id}
              role="tab"
              type="button"
              aria-selected={ativa === a.id}
              onClick={() => setAtiva(a.id)}
              className={`relative rounded-full px-5 sm:px-7 py-2.5 text-[0.9rem] font-semibold transition-colors ${
                ativa === a.id ? "text-tinta" : "text-tinta-3 hover:text-tinta-2"
              }`}
            >
              {ativa === a.id && (
                <motion.span
                  layoutId="aba-ativa"
                  className="absolute inset-0 rounded-full bg-superficie shadow-sm"
                  transition={{ type: "spring", stiffness: 420, damping: 34 }}
                />
              )}
              <span className="relative">{a.rotulo}</span>
            </button>
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={aba.id}
          role="tabpanel"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="grid gap-12 lg:grid-cols-2 items-center mt-14"
        >
          <div className="rounded-3xl bg-agua-fundo p-8 sm:p-12 grid place-items-center min-h-[300px]">
            {aba.id === "detectar" && <VisualDetectar />}
            {aba.id === "localizar" && <VisualLocalizar />}
            {aba.id === "economizar" && <VisualEconomizar />}
          </div>
          <div>
            <h3 className="titulo-md text-[clamp(1.6rem,3vw,2.3rem)]">{aba.titulo}</h3>
            <p className="text-tinta-2 text-[1.05rem] leading-relaxed mt-5 max-w-[46ch]">{aba.texto}</p>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

/* ---------------- ilustrações ---------------- */

const SOMBRA = "shadow-[0_18px_40px_-18px_rgba(6,24,43,0.35)]";

function VisualDetectar() {
  return (
    <div className={`w-full max-w-[380px] rounded-2xl bg-superficie p-5 ${SOMBRA}`}>
      <div className="rotulo text-tinta-3">Vazão ao longo do dia</div>
      <svg viewBox="0 0 320 110" className="w-full h-auto mt-3" aria-hidden="true">
        <rect x="30" y="6" width="54" height="94" rx="6" fill="var(--critico)" opacity="0.1" />
        <path
          d="M0 92 L30 84 L84 84 L102 82 L116 34 L130 76 L160 70 L176 46 L192 78 L220 72 L238 22 L256 66 L284 58 L300 40 L320 80"
          fill="none"
          stroke="var(--agua)"
          strokeWidth="2.5"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
        <line
          x1="0"
          y1="84"
          x2="320"
          y2="84"
          stroke="var(--critico)"
          strokeWidth="1.6"
          strokeDasharray="6 5"
          className="animar-onda"
        />
      </svg>
      <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-critico-fundo text-critico px-3.5 py-1.5 text-[0.82rem] font-semibold">
        <span className="h-2 w-2 rounded-full bg-critico animar-piscar" />
        Fluxo contínuo identificado
      </div>
    </div>
  );
}

function VisualLocalizar() {
  const ambientes = ["Cozinha", "Banheiro", "Área de serviço", "Jardim"];
  return (
    <div className="grid grid-cols-2 gap-3 w-full max-w-[380px]">
      {ambientes.map((a) => {
        const alerta = a === "Banheiro";
        return (
          <div
            key={a}
            className={`relative rounded-2xl bg-superficie p-5 h-[110px] flex flex-col justify-between ${SOMBRA} ${
              alerta ? "ring-2 ring-critico" : ""
            }`}
          >
            <span className={`font-semibold text-[0.92rem] ${alerta ? "text-critico" : "text-tinta"}`}>{a}</span>
            <span className={`rotulo ${alerta ? "text-critico" : "text-bom"}`}>
              {alerta ? "Atenção" : "Normal"}
            </span>
            {alerta && (
              <span className="absolute top-4 right-4 flex h-3 w-3">
                <span className="absolute inset-0 rounded-full bg-critico animate-ping opacity-60" />
                <span className="relative h-3 w-3 rounded-full bg-critico" />
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}

function VisualEconomizar() {
  return (
    <div className={`w-full max-w-[380px] rounded-2xl bg-superficie p-6 ${SOMBRA}`}>
      <div className="rotulo text-tinta-3">Previsão da conta do mês</div>
      <div className="mt-5 flex flex-col gap-4">
        <div>
          <div className="text-[0.82rem] text-tinta-2 mb-1.5">Deixando o vazamento</div>
          <div className="h-3 rounded-full bg-superficie-2 overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-critico"
              initial={{ width: "8%" }}
              animate={{ width: "92%" }}
              transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
            />
          </div>
        </div>
        <div>
          <div className="text-[0.82rem] text-tinta-2 mb-1.5">Corrigindo agora</div>
          <div className="h-3 rounded-full bg-superficie-2 overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-bom"
              initial={{ width: "8%" }}
              animate={{ width: "58%" }}
              transition={{ duration: 1.1, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
            />
          </div>
        </div>
      </div>
      <div className="mt-5 inline-flex items-center gap-2 rounded-full bg-bom-fundo text-bom px-3.5 py-1.5 text-[0.82rem] font-semibold">
        Menos desperdício no fim do mês
      </div>
    </div>
  );
}
