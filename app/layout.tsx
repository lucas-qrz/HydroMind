import type { Metadata } from "next";
import { Archivo, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";

/*
 * Archivo com o eixo de largura (`wdth`) habilitado: é o que permite os
 * títulos em largura expandida da identidade. Sem declarar o eixo, a fonte
 * variável vem só com o eixo de peso e `font-stretch` não faz nada.
 */
const archivo = Archivo({
  subsets: ["latin"],
  axes: ["wdth"],
  variable: "--fonte-sans",
  display: "swap",
});

/* Fonte de dados: toda medição do produto é exibida em monoespaçada. */
const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--fonte-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Água Alerta — Hydro Mind",
  description:
    "Monitoramento de consumo de água com detecção de vazamentos, estimativa da conta em tempo real e identificação da zona de origem do desperdício.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="pt-BR"
      className={`${archivo.variable} ${plexMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
