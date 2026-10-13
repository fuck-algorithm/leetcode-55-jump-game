export interface CanvasLayout {
  width: number;
  height: number;
  cellWidth: number;
  cellHeight: number;
  startX: number;
  startY: number;
  visibleStart: number;
  visibleEnd: number;
}

export const MAX_VISIBLE_ITEMS = 48;

export function getCanvasLayout(
  width: number,
  height: number,
  itemCount: number,
  currentIndex: number,
): CanvasLayout {
  const focusIndex = currentIndex >= 0 ? currentIndex : 0;
  const visibleStart = itemCount <= MAX_VISIBLE_ITEMS
    ? 0
    : Math.min(Math.max(0, focusIndex - 10), itemCount - MAX_VISIBLE_ITEMS);
  const visibleEnd = Math.min(itemCount, visibleStart + MAX_VISIBLE_ITEMS);
  const visibleCount = Math.max(visibleEnd - visibleStart, 1);
  const horizontalPadding = width < 560 ? 24 : 48;
  const cellWidth = Math.min(74, Math.max(36, (width - horizontalPadding * 2) / visibleCount));
  const cellHeight = width < 560 ? 52 : 60;
  const contentWidth = visibleCount * cellWidth;
  const startX = Math.max(horizontalPadding, (width - contentWidth) / 2);
  const startY = Math.max(142, height / 2 - cellHeight / 2 - 18);

  return {
    width,
    height,
    cellWidth,
    cellHeight,
    startX,
    startY,
    visibleStart,
    visibleEnd,
  };
}
