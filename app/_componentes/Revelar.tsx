"use client";

/*
 * Animações de entrada da landing.
 *
 * Quem tem "reduzir movimento" ativado no sistema recebe o conteúdo direto,
 * sem animação.
 */

import { motion, useReducedMotion } from "motion/react";

const SUAVE = [0.22, 1, 0.36, 1] as const;

/** Sobe e aparece quando o bloco entra na tela (uma vez só). */
export function Revelar({
  children,
  atraso = 0,
  className,
  y = 28,
}: {
  children: React.ReactNode;
  atraso?: number;
  className?: string;
  y?: number;
}) {
  const reduzido = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduzido ? false : { opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -80px 0px" }}
      transition={{ duration: 0.7, delay: atraso, ease: SUAVE }}
    >
      {children}
    </motion.div>
  );
}
