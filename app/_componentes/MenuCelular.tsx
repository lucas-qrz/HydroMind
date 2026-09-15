"use client";

/*
 * Menu do celular. Abaixo de `md` os links do topo somem; este botão abre um
 * painel de tela cheia com os mesmos destinos e o botão de demonstração.
 *
 * Fecha ao escolher um link, ao tocar no botão de novo ou com Esc. Enquanto
 * está aberto, a página por trás não rola.
 */

import Link from "next/link";
import { useEffect, useState } from "react";

const LINKS: [string, string][] = [
  ["#recursos", "Recursos"],
  ["#como-funciona", "Como funciona"],
  ["#para-quem", "Para quem"],
  ["#planos", "Planos"],
  ["#perguntas", "Dúvidas"],
];

export default function MenuCelular() {
  const [aberto, setAberto] = useState(false);

  useEffect(() => {
    if (!aberto) return;
    const fechar = (e: KeyboardEvent) => {
      if (e.key === "Escape") setAberto(false);
    };
    window.addEventListener("keydown", fechar);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", fechar);
      document.body.style.overflow = "";
    };
  }, [aberto]);

  return (
    <div className="md:hidden">
      <button
        type="button"
        aria-expanded={aberto}
        aria-controls="menu-celular"
        aria-label={aberto ? "Fechar menu" : "Abrir menu"}
        onClick={() => setAberto((a) => !a)}
        className="grid place-items-center w-11 h-11 rounded-full bg-superficie-2"
      >
        <span className="relative block w-5 h-3" aria-hidden>
          <span
            className={`absolute left-0 right-0 h-0.5 rounded-full bg-tinta transition-all duration-300 ${
              aberto ? "top-1/2 -translate-y-1/2 rotate-45" : "top-0"
            }`}
          />
          <span
            className={`absolute left-0 right-0 h-0.5 rounded-full bg-tinta transition-all duration-300 ${
              aberto ? "top-1/2 -translate-y-1/2 -rotate-45" : "top-full -translate-y-full"
            }`}
          />
        </span>
      </button>

      {aberto && (
        <nav
          id="menu-celular"
          aria-label="Menu principal"
          className="absolute left-0 right-0 top-full h-[calc(100dvh-4.5rem)] bg-fundo border-t border-linha px-6 pt-6 pb-10 flex flex-col overflow-y-auto animar-entrar"
          style={{ animationDuration: "0.35s" }}
        >
          {LINKS.map(([href, texto]) => (
            <a
              key={href}
              href={href}
              onClick={() => setAberto(false)}
              className="titulo-md text-[1.7rem] py-4 border-b border-linha flex items-center justify-between"
            >
              {texto}
              <span className="text-agua text-xl" aria-hidden>
                →
              </span>
            </a>
          ))}
          <Link
            href="/painel"
            onClick={() => setAberto(false)}
            className="mt-8 rounded-full bg-agua py-4 text-center font-semibold text-white"
          >
            Ver demonstração
          </Link>
          <p className="mt-auto pt-10 text-center text-[0.9rem] text-tinta-3">
            Água inteligente. Menos desperdício. Mais economia.
          </p>
        </nav>
      )}
    </div>
  );
}
