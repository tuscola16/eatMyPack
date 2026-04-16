export function gToOz(grams: number): number {
  return grams / 28.35;
}

export function ozToG(ounces: number): number {
  return ounces * 28.35;
}

export function calPerGToCalPerOz(calPerG: number): number {
  return calPerG * 28.35;
}

export function roundTo(num: number, decimals: number = 1): number {
  const factor = Math.pow(10, decimals);
  return Math.round(num * factor) / factor;
}
