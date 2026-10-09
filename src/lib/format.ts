export const fmt = (n: number) => n.toLocaleString('pt-BR');

export const pctAptos = (p: number) =>
  (Math.abs(p) * 100).toLocaleString('pt-BR', { maximumFractionDigits: 1 }) +
  '%';
