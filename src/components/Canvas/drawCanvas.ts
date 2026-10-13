import * as d3 from 'd3';
import type { AlgorithmStep } from '../../types';
import { getCanvasLayout } from './layout';

interface CanvasTransform {
  x: number;
  y: number;
  scale: number;
}

export const ANIMATION_DURATION = 360;

export function drawCanvas(
  svgElement: SVGSVGElement | null,
  container: HTMLDivElement | null,
  currentStep: AlgorithmStep | null,
  transform: CanvasTransform,
  reducedMotion: boolean,
  isDragging: boolean,
): void {

  if (!svgElement || !currentStep || !container) return;

  d3.select(svgElement).interrupt();
  d3.select(svgElement).selectAll('*').interrupt();
  const width = Math.max(container.clientWidth, 320);
  const height = Math.max(container.clientHeight, 260);
  const svg = d3.select(svgElement);
  const duration = reducedMotion || isDragging ? 0 : ANIMATION_DURATION;
  const transition = <G extends d3.BaseType, Datum, P extends d3.BaseType, PD>(
    selection: d3.Selection<G, Datum, P, PD>,
  ) => selection.transition().duration(duration).ease(d3.easeCubicOut);

  svg
    .attr('width', width)
    .attr('height', height)
    .attr('role', 'img')
    .attr('aria-label', `跳跃游戏算法演示：${currentStep.description}`);

  let defs = svg.select<SVGDefsElement>('defs');
  if (defs.empty()) {
    defs = svg.append('defs');
    defs.append('marker')
      .attr('id', 'arrowhead')
      .attr('markerWidth', 10)
      .attr('markerHeight', 7)
      .attr('refX', 9)
      .attr('refY', 3.5)
      .attr('orient', 'auto')
      .append('polygon')
      .attr('points', '0 0, 10 3.5, 0 7')
      .attr('fill', '#ffb347');
  }

  let scene = svg.select<SVGGElement>('.canvas-scene');
  if (scene.empty()) {
    scene = svg.append('g').attr('class', 'canvas-scene');
    scene.append('g').attr('class', 'range-layer');
    scene.append('g').attr('class', 'index-layer');
    scene.append('g').attr('class', 'cell-layer');
    scene.append('g').attr('class', 'marker-layer');
    scene.append('g').attr('class', 'jump-layer');
    scene.append('g').attr('class', 'info-layer');
  }
  scene.attr('transform', `translate(${transform.x}, ${transform.y}) scale(${transform.scale})`);

  const { nums, currentIndex, maxReach, canReach, action, result } = currentStep;
  const n = nums.length;
  const layout = getCanvasLayout(width, height, n, currentIndex);
  const {
    cellWidth,
    cellHeight,
    startX,
    startY,
    visibleStart,
    visibleEnd,
  } = layout;
  const visibleIndices = d3.range(visibleStart, visibleEnd);
  const xForIndex = (index: number) => startX + (index - visibleStart) * cellWidth + (cellWidth - 4) / 2;
  const cellX = (index: number) => startX + (index - visibleStart) * cellWidth;
  const cellColor = (index: number) => {
    if (index === currentIndex && action === 'fail') return '#e55353';
    if (index === currentIndex) return '#39b8e8';
    if (index === n - 1 && result === true) return '#3fbf72';
    if (canReach[index]) return '#236b4a';
    return '#171d2b';
  };
  const cellStroke = (index: number) => {
    if (index === currentIndex) return '#d9f5ff';
    if (canReach[index]) return '#3fbf72';
    return '#294b72';
  };

  const rangeLayer = scene.select<SVGGElement>('.range-layer');
  const rangeStart = Math.max(visibleStart, 0);
  const rangeEnd = Math.min(Math.max(maxReach, visibleStart - 1), visibleEnd - 1);
  const rangeData = maxReach >= visibleStart && visibleIndices.length > 0 ? [{ rangeStart, rangeEnd }] : [];
  const range = rangeLayer.selectAll<SVGRectElement, { rangeStart: number; rangeEnd: number }>('.reach-range')
    .data(rangeData);
  range.exit().remove();
  const rangeEnter = range.enter().append('rect').attr('class', 'reach-range').attr('rx', 10);
  transition(rangeEnter.merge(range))
    .attr('x', d => cellX(d.rangeStart) - 8)
    .attr('y', startY - 34)
    .attr('width', d => Math.max(cellWidth, (d.rangeEnd - d.rangeStart + 1) * cellWidth + 8))
    .attr('height', cellHeight + 68)
    .attr('fill', 'rgba(79, 195, 247, 0.09)')
    .attr('stroke', 'rgba(79, 195, 247, 0.26)')
    .attr('stroke-dasharray', '4 4');

  const previousMaxReach = currentStep.previousMaxReach ?? maxReach;
  const shouldShowExpansion = action === 'update' && maxReach > previousMaxReach;
  const expansionStart = Math.max(previousMaxReach + 1, visibleStart);
  const expansionEnd = Math.min(maxReach, visibleEnd - 1);
  const expansionData = shouldShowExpansion && expansionEnd >= expansionStart
    ? [{ start: expansionStart, end: expansionEnd }]
    : [];
  const expansion = rangeLayer.selectAll<SVGRectElement, { start: number; end: number }>('.reach-expansion')
    .data(expansionData);
  expansion.exit().remove();
  const expansionEnter = expansion.enter().append('rect')
    .attr('class', 'reach-expansion')
    .attr('rx', 7)
    .attr('y', startY - 28)
    .attr('height', cellHeight + 56)
    .attr('fill', 'rgba(255, 179, 71, 0.18)')
    .attr('stroke', 'rgba(255, 179, 71, 0.8)');
  transition(expansionEnter.merge(expansion))
    .attr('x', d => cellX(d.start))
    .attr('width', d => Math.max(cellWidth - 4, (d.end - d.start + 1) * cellWidth - 4))
    .attr('opacity', 1);

  const indexLayer = scene.select<SVGGElement>('.index-layer');
  const indexLabels = indexLayer.selectAll<SVGTextElement, number>('.index-label').data(visibleIndices, d => String(d));
  indexLabels.exit().remove();
  const indexEnter = indexLabels.enter().append('text').attr('class', 'index-label').attr('text-anchor', 'middle');
  transition(indexEnter.merge(indexLabels))
    .attr('x', d => xForIndex(d))
    .attr('y', startY - 46)
    .attr('fill', '#8490a8')
    .attr('font-size', Math.max(10, Math.min(12, cellWidth / 4)))
    .text(d => d);

  const cellLayer = scene.select<SVGGElement>('.cell-layer');
  const cells = cellLayer.selectAll<SVGGElement, number>('.cell').data(visibleIndices, d => String(d));
  cells.exit()
    .call(selection => transition(selection).style('opacity', 0).remove());
  const cellEnter = cells.enter().append('g').attr('class', 'cell').style('opacity', 0);
  cellEnter.append('rect').attr('class', 'cell-background').attr('rx', 7);
  cellEnter.append('text').attr('class', 'cell-value').attr('text-anchor', 'middle');
  cellEnter.append('text').attr('class', 'reach-label').attr('text-anchor', 'middle').text('✓ 可达');
  const cellUpdate = cellEnter.merge(cells);
  transition(cellUpdate)
    .style('opacity', 1)
    .attr('transform', d => `translate(${cellX(d)}, ${startY})`)
    .attr('class', d => `cell ${d === currentIndex ? 'is-current' : ''} ${d === n - 1 ? 'is-last' : ''}`);
  transition(cellUpdate.select<SVGRectElement>('.cell-background'))
    .attr('width', Math.max(12, cellWidth - 4))
    .attr('height', cellHeight)
    .attr('fill', d => cellColor(d))
    .attr('stroke', d => cellStroke(d))
    .attr('stroke-width', d => d === currentIndex ? 2 : 1);
  transition(cellUpdate.select<SVGTextElement>('.cell-value'))
    .attr('x', (cellWidth - 4) / 2)
    .attr('y', cellHeight / 2 + 6)
    .attr('fill', '#f5f8ff')
    .attr('font-size', Math.max(14, Math.min(18, cellWidth / 3.5)))
    .text(d => nums[d]);
  transition(cellUpdate.select<SVGTextElement>('.reach-label'))
    .attr('x', (cellWidth - 4) / 2)
    .attr('y', cellHeight + 20)
    .attr('fill', '#53d58a')
    .attr('font-size', Math.max(9, Math.min(11, cellWidth / 4)))
    .style('opacity', d => canReach[d] ? 1 : 0);

  const gapLayer = indexLayer.selectAll<SVGTextElement, string>('.gap-label')
    .data([
      ...(visibleStart > 0 ? ['before'] : []),
      ...(visibleEnd < n ? ['after'] : []),
    ]);
  gapLayer.exit().remove();
  const gapEnter = gapLayer.enter().append('text').attr('class', 'gap-label').attr('text-anchor', 'middle');
  transition(gapEnter.merge(gapLayer))
    .attr('x', d => d === 'before' ? startX - 16 : startX + (visibleEnd - visibleStart) * cellWidth + 8)
    .attr('y', startY + cellHeight / 2 + 5)
    .attr('fill', '#6f7c95')
    .attr('font-size', 18)
    .text('…');

  const markerLayer = scene.select<SVGGElement>('.marker-layer');
  const markerData = [
    ...(currentIndex >= visibleStart && currentIndex < visibleEnd ? [{ type: 'current', index: currentIndex, label: `i = ${currentIndex}` }] : []),
    ...(action === 'update' && maxReach > previousMaxReach && previousMaxReach >= visibleStart && previousMaxReach < visibleEnd
      ? [{ type: 'previous-max', index: previousMaxReach, label: `旧 k = ${previousMaxReach}` }]
      : []),
    ...(maxReach >= 0 && visibleIndices.length > 0 ? [{ type: 'max', index: Math.min(Math.max(maxReach, visibleStart), visibleEnd - 1), label: `k = ${maxReach}` }] : []),
    ...(action === 'success' && visibleIndices.length > 0 && currentIndex !== n - 1
      ? [{ type: 'end', index: n - 1, label: '终点' }]
      : []),
    ...(action === 'fail' && currentIndex >= visibleStart && currentIndex < visibleEnd
      ? [{ type: 'blocked', index: currentIndex, label: '不可达' }]
      : []),
  ];
  const markers = markerLayer.selectAll<SVGGElement, { type: string; index: number; label: string }>('.position-marker')
    .data(markerData, d => d.type);
  markers.exit().remove();
  const markerEnter = markers.enter().append('g').attr('class', 'position-marker');
  markerEnter.append('polygon').attr('class', 'marker-triangle');
  markerEnter.append('text').attr('class', 'marker-label').attr('text-anchor', 'middle');
  const markerUpdate = markerEnter.merge(markers);
  transition(markerUpdate)
    .attr('transform', d => {
      const x = xForIndex(d.index);
      const y = d.type === 'previous-max'
        ? startY - 88
        : d.type === 'current' || d.type === 'end'
          ? startY - 58
          : startY + cellHeight + 58;
      return `translate(${x}, ${y})`;
    });
  transition(markerUpdate.select<SVGPolygonElement>('.marker-triangle'))
    .attr('points', d => d.type === 'current' || d.type === 'end' || d.type === 'previous-max' ? '-8,0 8,0 0,12' : '-8,12 8,12 0,0')
    .attr('fill', d => {
      if (d.type === 'current') return '#4fc3f7';
      if (d.type === 'end') return '#53d58a';
      if (d.type === 'previous-max') return '#ffda8a';
      if (d.type === 'blocked') return '#ff6b6b';
      return '#ffb347';
    });
  transition(markerUpdate.select<SVGTextElement>('.marker-label'))
    .attr('y', d => d.type === 'current' || d.type === 'end' || d.type === 'previous-max' ? -8 : 30)
    .attr('fill', d => {
      if (d.type === 'current') return '#7ddcff';
      if (d.type === 'end') return '#53d58a';
      if (d.type === 'previous-max') return '#ffda8a';
      if (d.type === 'blocked') return '#ff6b6b';
      return '#ffb347';
    })
    .attr('font-size', 12)
    .attr('font-weight', 'bold')
    .text(d => d.label);

  const jumpLayer = scene.select<SVGGElement>('.jump-layer');
  const jumpData = currentIndex >= 0 && currentIndex < n && nums[currentIndex] > 0
    ? [{
      from: currentIndex,
      candidate: currentStep.candidateReach ?? currentIndex + nums[currentIndex],
      to: Math.min(currentStep.candidateReach ?? currentIndex + nums[currentIndex], n - 1),
    }]
    : [];
  const jumpPaths = jumpLayer.selectAll<SVGPathElement, { from: number; candidate: number; to: number }>('.jump-path').data(jumpData);
  jumpPaths.exit().remove();
  const jumpEnter = jumpPaths.enter().append('path').attr('class', 'jump-path').attr('fill', 'none');
  const jumpUpdate = jumpEnter.merge(jumpPaths);
  transition(jumpUpdate)
    .attr('d', d => {
      const fromX = xForIndex(d.from);
      const toX = xForIndex(Math.min(Math.max(d.to, visibleStart), visibleEnd - 1));
      const arcHeight = Math.min(100, 54 + Math.abs(toX - fromX) * 0.18);
      return `M ${fromX} ${startY - 6} Q ${(fromX + toX) / 2} ${startY - arcHeight} ${toX} ${startY - 6}`;
    })
    .attr('stroke', '#ffb347')
    .attr('stroke-width', 2)
    .attr('stroke-dasharray', '7 4')
    .attr('marker-end', 'url(#arrowhead)')
    .style('opacity', 1);
  const jumpLabels = jumpLayer.selectAll<SVGTextElement, { from: number; candidate: number; to: number }>('.jump-label').data(jumpData);
  jumpLabels.exit().remove();
  const jumpLabelEnter = jumpLabels.enter().append('text').attr('class', 'jump-label').attr('text-anchor', 'middle');
  transition(jumpLabelEnter.merge(jumpLabels))
    .attr('x', d => (xForIndex(d.from) + xForIndex(Math.min(Math.max(d.to, visibleStart), visibleEnd - 1))) / 2)
    .attr('y', d => startY - Math.min(100, 64 + Math.abs(d.to - d.from) * cellWidth * 0.18) - 10)
    .attr('fill', '#ffb347')
    .attr('font-size', 11)
    .text(d => d.candidate > d.to
      ? `可跳 ${nums[d.from]} 步 · 候选 ${d.candidate}（终点 ${d.to}）`
      : `可跳 ${nums[d.from]} 步 · 落点 ${d.to}`);

  const infoLayer = scene.select<SVGGElement>('.info-layer');
  let variablePanel = infoLayer.select<SVGGElement>('.variable-panel');
  if (variablePanel.empty()) {
    variablePanel = infoLayer.append('g').attr('class', 'variable-panel');
    variablePanel.append('rect').attr('class', 'variable-panel-bg').attr('rx', 8);
    variablePanel.append('text').attr('class', 'variable-panel-title').text('变量状态');
    variablePanel.append('g').attr('class', 'variable-rows');
  }
  const panelX = 18;
  const panelY = 18;
  const panelWidth = width < 560 ? 156 : 184;
  const panelHeight = 116;
  transition(variablePanel)
    .attr('transform', `translate(${panelX}, ${panelY})`)
    .style('opacity', 1);
  transition(variablePanel.select<SVGRectElement>('.variable-panel-bg'))
    .attr('width', panelWidth)
    .attr('height', panelHeight)
    .attr('fill', 'rgba(20, 27, 43, 0.92)')
    .attr('stroke', '#294b72');
  transition(variablePanel.select<SVGTextElement>('.variable-panel-title'))
    .attr('x', 12)
    .attr('y', 24)
    .attr('fill', '#7ddcff')
    .attr('font-size', 13)
    .attr('font-weight', 'bold');
  const variableValues = [
    `i = ${currentStep.variables.i >= 0 ? currentStep.variables.i : '—'}`,
    `k = ${currentStep.variables.k}`,
    `nums[i] = ${currentStep.variables['nums[i]'] >= 0 ? currentStep.variables['nums[i]'] : '—'}`,
    `i + nums[i] = ${currentStep.variables['i + nums[i]'] >= 0 ? currentStep.variables['i + nums[i]'] : '—'}`,
  ];
  const variableRows = variablePanel.select('.variable-rows').selectAll<SVGTextElement, string>('.variable-row').data(variableValues);
  variableRows.exit().remove();
  const variableRowEnter = variableRows.enter().append('text').attr('class', 'variable-row');
  transition(variableRowEnter.merge(variableRows))
    .attr('x', 12)
    .attr('y', (_, index) => 48 + index * 17)
    .attr('fill', '#b8c2d6')
    .attr('font-size', 11)
    .attr('font-family', 'Consolas, monospace')
    .text(d => d);

  const resultData = currentStep.isComplete ? [{ result: result === true }] : [];
  const resultGroup = infoLayer.selectAll<SVGGElement, { result: boolean }>('.result-group').data(resultData);
  resultGroup.exit().remove();
  const resultEnter = resultGroup.enter().append('g').attr('class', 'result-group').style('opacity', 0);
  resultEnter.append('rect').attr('class', 'result-bg').attr('rx', 8);
  resultEnter.append('text').attr('class', 'result-text').attr('text-anchor', 'middle');
  const resultUpdate = resultEnter.merge(resultGroup);
  transition(resultUpdate)
    .style('opacity', 1)
    .attr('transform', `translate(${width / 2}, ${startY + cellHeight + 100})`);
  transition(resultUpdate.select<SVGRectElement>('.result-bg'))
    .attr('x', -112)
    .attr('y', -22)
    .attr('width', 224)
    .attr('height', 44)
    .attr('fill', d => d.result ? 'rgba(42, 120, 77, 0.24)' : 'rgba(170, 55, 55, 0.24)')
    .attr('stroke', d => d.result ? '#53d58a' : '#ff6b6b');
  transition(resultUpdate.select<SVGTextElement>('.result-text'))
    .attr('y', 6)
    .attr('fill', d => d.result ? '#53d58a' : '#ff6b6b')
    .attr('font-size', 15)
    .attr('font-weight', 'bold')
    .text(d => d.result ? '✓ 可以到达终点' : '✗ 无法到达终点');

  const description = infoLayer.selectAll<SVGForeignObjectElement, string>('.description-box').data([currentStep.description]);
  const descriptionEnter = description.enter().append('foreignObject').attr('class', 'description-box');
  descriptionEnter.append('xhtml:div').attr('class', 'canvas-description');
  transition(descriptionEnter.merge(description))
    .attr('x', Math.max(190, width * 0.2))
    .attr('y', height - 52)
    .attr('width', Math.max(140, width - Math.max(190, width * 0.2) - 24))
    .attr('height', 40);
  descriptionEnter.merge(description)
    .select<HTMLDivElement>('.canvas-description')
    .text(currentStep.description);

}
