"use client";

/*
 * Envolve a casa 3D: guarda o estado da interação, mostra o cartão de detalhe
 * e os botões de cômodo.
 *
 * Os botões existem por dois motivos: no celular não há "passar o mouse", e
 * quem navega por teclado ou leitor de tela precisa de um caminho que não
 * dependa do canvas.
 */

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { COMODOS, type IdComodo } from "./comodos";

// O WebGL só existe no navegador: a cena não é pré-renderizada no servidor.
const Casa3D = dynamic(() => import("./Casa3D"), {
  ssr: false,
  loading: () => (
    <div className="absolute inset-0 grid place-items-center">
      <span className="rotulo text-tinta-3 animate-pulse">Carregando a casa…</span>
    </div>
  ),
});

export default function CasaInterativa() {
  const [sobreCasa, setSobreCasa] = useState(false);
  const [hover, setHover] = useState<IdComodo | null>(null);
  const [foco, setFoco] = useState<IdComodo | null>(null);
  const reduzido = useReducedMotion() ?? false;

  const atual = COMODOS.find((c) => c.id === (hover ?? foco));
  const alternarFoco = (id: IdComodo) => setFoco((f) => (f === id ? null : id));

  useEffect(() => {
    const sair = (e: KeyboardEvent) => {
      if (e.key === "Escape") setFoco(null);
    };
    window.addEventListener("keydown", sair);
    return () => window.removeEventListener("keydown", sair);
  }, []);

  return (
    <div className="relative">
      <div
        className="relative h-[360px] sm:h-[440px] lg:h-[520px]"
        aria-hidden="true"
        onPointerEnter={() => setSobreCasa(true)}
        onPointerLeave={() => {
          setSobreCasa(false);
          setHover(null);
        }}
      >
        <Casa3D
          hover={hover}
          foco={foco}
          sobreCasa={sobreCasa}
          reduzido={reduzido}
          onHover={setHover}
          onFoco={alternarFoco}
        />
      </div>

      {foco && (
        <button
          type="button"
          onClick={() => setFoco(null)}
          className="absolute top-2 right-2 rounded-full bg-superficie/90 backdrop-blur border border-linha px-4 py-2 text-[0.82rem] font-semibold shadow-md hover:bg-superficie transition"
        >
          ← Ver a casa inteira
        </button>
      )}

      {/* Cartão de detalhe */}
      <div className="sm:absolute sm:left-0 sm:bottom-16 w-full sm:w-[310px] mt-3 sm:mt-0 pointer-events-none">
        <AnimatePresence mode="wait" initial={false}>
          {atual ? (
            <motion.div
              key={atual.id}
              initial={{ opacity: 0, y: 12, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.98 }}
              transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
              className="rounded-2xl border border-linha bg-superficie/95 backdrop-blur p-4 shadow-[0_18px_40px_-18px_rgba(6,24,43,0.35)]"
            >
              <div className="flex items-center justify-between gap-3">
                <span className="font-bold text-[1rem]">{atual.nome}</span>
                <span
                  className={`rotulo rounded-full px-2.5 py-1 ${
                    atual.estado === "atencao"
                      ? "bg-critico-fundo text-critico"
                      : "bg-bom-fundo text-bom"
                  }`}
                >
                  {atual.estado === "atencao" ? "Atenção" : "Normal"}
                </span>
              </div>
              <p className="text-[0.84rem] text-tinta mt-2.5 font-medium">{atual.sensor}</p>
              <p className="text-[0.84rem] text-tinta-2 mt-1 leading-snug">{atual.detecta}</p>
              {foco !== atual.id && (
                <p className="rotulo text-agua mt-3">Clique para aproximar</p>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="dica"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="hidden sm:flex items-center gap-2.5 rounded-full border border-linha bg-superficie/90 backdrop-blur px-4 py-2.5 shadow-md w-fit"
            >
              <span className="relative flex h-2 w-2">
                <span className="absolute inset-0 rounded-full bg-agua animate-ping opacity-70" />
                <span className="relative h-2 w-2 rounded-full bg-agua" />
              </span>
              <span className="text-[0.84rem] text-tinta-2">Passe o mouse pela casa</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Botões de cômodo: toque, teclado e leitor de tela */}
      <div className="flex flex-wrap justify-center gap-2 mt-4" role="group" aria-label="Cômodos monitorados">
        {COMODOS.map((c) => (
          <button
            key={c.id}
            type="button"
            aria-pressed={foco === c.id}
            onMouseEnter={() => setHover(c.id)}
            onMouseLeave={() => setHover(null)}
            onFocus={() => setHover(c.id)}
            onBlur={() => setHover(null)}
            onClick={() => alternarFoco(c.id)}
            className={`inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-[0.82rem] font-medium transition ${
              foco === c.id
                ? "bg-tinta text-fundo border-tinta"
                : "bg-superficie border-linha text-tinta-2 hover:border-agua hover:text-tinta"
            }`}
          >
            <span
              className={`h-1.5 w-1.5 rounded-full ${c.estado === "atencao" ? "bg-critico" : "bg-agua"}`}
            />
            {c.nome}
          </button>
        ))}
      </div>
    </div>
  );
}
