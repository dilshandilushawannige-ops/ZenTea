export const calcTotal = (weightKg, rate) => {
  const w = Number(weightKg || 0);
  const r = Number(rate || 0);
  return Math.round((w * r) * 100) / 100;
};
