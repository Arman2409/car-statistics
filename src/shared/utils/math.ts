export const roundToPrecision = (
  numberX: number,
  precisionS: number,
): number => {
  // 1. Divide X by S (e.g., 50 / 33.3 = 1.5015...)
  const ratio = numberX / precisionS;

  // 2. Round the result to the nearest integer (e.g., round(1.5015...) = 2)
  const nearestInteger = Math.round(ratio);

  // 3. Multiply the result by S (e.g., 2 * 33.3 = 66.6)
  const roundedValue = nearestInteger * precisionS;

  return roundedValue;
};
