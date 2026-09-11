/*
 * Ícones de traço, desenhados à mão em 24×24. Sem biblioteca: são poucos, e
 * assim herdam a cor do texto (`currentColor`) em qualquer tema.
 */

type Props = { className?: string };

function Base({ className, children }: Props & { children: React.ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className ?? "w-6 h-6"}
    >
      {children}
    </svg>
  );
}

export const IconeGota = (p: Props) => (
  <Base {...p}>
    <path d="M12 3c-3 4-6 7.5-6 11a6 6 0 0 0 12 0c0-3.5-3-7-6-11z" />
  </Base>
);

export const IconeConta = (p: Props) => (
  <Base {...p}>
    <path d="M6 3h12v18l-3-2-3 2-3-2-3 2V3z" />
    <path d="M9 8h6M9 12h6M9 16h3" />
  </Base>
);

export const IconeAmbiente = (p: Props) => (
  <Base {...p}>
    <rect x="3" y="3" width="8" height="8" rx="1.5" />
    <rect x="13" y="3" width="8" height="8" rx="1.5" />
    <rect x="3" y="13" width="8" height="8" rx="1.5" />
    <rect x="13" y="13" width="8" height="8" rx="1.5" />
  </Base>
);

export const IconeSino = (p: Props) => (
  <Base {...p}>
    <path d="M6 16v-5a6 6 0 0 1 12 0v5l2 2H4l2-2z" />
    <path d="M10 20a2 2 0 0 0 4 0" />
  </Base>
);

export const IconeRelatorio = (p: Props) => (
  <Base {...p}>
    <path d="M4 4v16h16" />
    <path d="M8 16v-4M12 16V8M16 16v-6" />
  </Base>
);

export const IconeInteligencia = (p: Props) => (
  <Base {...p}>
    <path d="M12 3l1.8 4.9L19 9.7l-4.2 3.1 1.5 5.2L12 15l-4.3 3 1.5-5.2L5 9.7l5.2-1.8z" />
  </Base>
);

export const IconeEscudo = (p: Props) => (
  <Base {...p}>
    <path d="M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6z" />
    <path d="M9 12l2 2 4-4" />
  </Base>
);

export const IconeCasa = (p: Props) => (
  <Base {...p}>
    <path d="M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z" />
  </Base>
);

export const IconePredio = (p: Props) => (
  <Base {...p}>
    <path d="M5 21V4h9v17M14 9h5v12M3 21h18" />
    <path d="M8 8h3M8 12h3M8 16h3" />
  </Base>
);

export const IconeEmpresa = (p: Props) => (
  <Base {...p}>
    <path d="M3 21h18M5 21V10l7-4v15M12 21V6l7 4v11" />
  </Base>
);

export const IconeEscola = (p: Props) => (
  <Base {...p}>
    <path d="M3 9l9-5 9 5-9 5-9-5z" />
    <path d="M7 11v5c0 1.5 2.2 3 5 3s5-1.5 5-3v-5" />
  </Base>
);

export const IconeCheck = (p: Props) => (
  <Base {...p}>
    <path d="M5 12l4 4 10-10" />
  </Base>
);

export const IconeSeta = (p: Props) => (
  <Base {...p}>
    <path d="M5 12h14M13 6l6 6-6 6" />
  </Base>
);
