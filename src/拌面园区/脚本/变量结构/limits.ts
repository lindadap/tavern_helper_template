export function clampShapingChange(previous: number, proposed: number) {
  return Math.max(0, Math.min(300, Math.max(previous - 10, Math.min(previous + 10, proposed))));
}
