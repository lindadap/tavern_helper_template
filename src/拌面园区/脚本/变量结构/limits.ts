export function clampShapingChange(previous: number, proposed: number) {
  return Math.max(0, Math.min(300, Math.max(previous - 5, Math.min(previous + 7, proposed))));
}
