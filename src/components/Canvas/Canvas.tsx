import { useEffect, useRef, useState, useCallback } from 'react';
import * as d3 from 'd3';
import type { AlgorithmStep } from '../../types';
import './Canvas.css';

interface CanvasProps {
  currentStep: AlgorithmStep | null;
}

export function Canvas({ currentStep }: CanvasProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [transform, setTransform] = useState({ x: 0, y: 0, scale: 1 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // 绘制画布
  const drawCanvas = useCallback(() => {
    if (!svgRef.current || !currentStep) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight;

    svg.attr('width', width).attr('height', height);

    const g = svg.append('g')
      .attr('transform', `translate(${transform.x}, ${transform.y}) scale(${transform.scale})`);

    const { nums, currentIndex, maxReach, canReach, action, result } = currentStep;
    const n = nums.length;

    // 计算布局
    const cellWidth = Math.min(80, (width - 100) / n);
    const cellHeight = 60;
    const startX = (width - n * cellWidth) / 2;
    const startY = height / 2 - 50;

    // 绘制最远可达范围背景
    if (maxReach >= 0) {
      g.append('rect')
        .attr('x', startX)
        .attr('y', startY - 30)
        .attr('width', Math.min(maxReach + 1, n) * cellWidth)
        .attr('height', cellHeight + 60)
        .attr('fill', 'rgba(79, 195, 247, 0.1)')
        .attr('rx', 8);
    }

    // 绘制数组索引
    g.selectAll('.index-label')
      .data(nums)
      .enter()
      .append('text')
      .attr('class', 'index-label')
      .attr('x', (_, i) => startX + i * cellWidth + cellWidth / 2)
      .attr('y', startY - 40)
      .attr('text-anchor', 'middle')
      .attr('fill', '#888')
      .attr('font-size', '12px')
      .text((_, i) => i);

    // 绘制数组单元格
    const cells = g.selectAll('.cell')
      .data(nums)
      .enter()
      .append('g')
      .attr('class', 'cell')
      .attr('transform', (_, i) => `translate(${startX + i * cellWidth}, ${startY})`);

    // 单元格背景
    cells.append('rect')
      .attr('width', cellWidth - 4)
      .attr('height', cellHeight)
      .attr('rx', 6)
      .attr('fill', (_, i) => {
        if (i === currentIndex && action === 'fail') return '#f44336';
        if (i === currentIndex) return '#4fc3f7';
        if (i === n - 1 && result === true) return '#4caf50';
        if (canReach[i]) return '#2e7d32';
        return '#1a1a2e';
      })
      .attr('stroke', (_, i) => {
        if (i === currentIndex) return '#fff';
        if (canReach[i]) return '#4caf50';
        return '#0f3460';
      })
      .attr('stroke-width', (_, i) => i === currentIndex ? 2 : 1);

    // 单元格数值
    cells.append('text')
      .attr('x', (cellWidth - 4) / 2)
      .attr('y', cellHeight / 2 + 6)
      .attr('text-anchor', 'middle')
      .attr('fill', '#fff')
      .attr('font-size', '18px')
      .attr('font-weight', 'bold')
      .text(d => d);

    // 绘制可达标记
    cells.each(function(_, i) {
      if (canReach[i]) {
        d3.select(this)
          .append('text')
          .attr('x', (cellWidth - 4) / 2)
          .attr('y', cellHeight + 20)
          .attr('text-anchor', 'middle')
          .attr('fill', '#4caf50')
          .attr('font-size', '11px')
          .text('✓ 可达');
      }
    });

    // 绘制当前位置指针
    if (currentIndex >= 0 && currentIndex < n) {
      const pointerX = startX + currentIndex * cellWidth + (cellWidth - 4) / 2;
      
      g.append('polygon')
        .attr('points', `${pointerX - 8},${startY - 55} ${pointerX + 8},${startY - 55} ${pointerX},${startY - 42}`)
        .attr('fill', '#4fc3f7');

      g.append('text')
        .attr('x', pointerX)
        .attr('y', startY - 65)
        .attr('text-anchor', 'middle')
        .attr('fill', '#4fc3f7')
        .attr('font-size', '12px')
        .attr('font-weight', 'bold')
        .text(`i = ${currentIndex}`);
    }

    // 绘制最远可达位置指针
    if (maxReach >= 0 && maxReach < n) {
      const maxReachX = startX + maxReach * cellWidth + (cellWidth - 4) / 2;
      
      g.append('polygon')
        .attr('points', `${maxReachX - 8},${startY + cellHeight + 55} ${maxReachX + 8},${startY + cellHeight + 55} ${maxReachX},${startY + cellHeight + 42}`)
        .attr('fill', '#ff9800');

      g.append('text')
        .attr('x', maxReachX)
        .attr('y', startY + cellHeight + 75)
        .attr('text-anchor', 'middle')
        .attr('fill', '#ff9800')
        .attr('font-size', '12px')
        .attr('font-weight', 'bold')
        .text(`k = ${maxReach}`);
    }

    // 绘制跳跃范围箭头
    if (currentIndex >= 0 && currentIndex < n && nums[currentIndex] > 0) {
      const jumpRange = nums[currentIndex];
      const fromX = startX + currentIndex * cellWidth + (cellWidth - 4) / 2;
      const toIndex = Math.min(currentIndex + jumpRange, n - 1);
      const toX = startX + toIndex * cellWidth + (cellWidth - 4) / 2;

      // 绘制跳跃弧线
      const midY = startY - 80;
      const path = `M ${fromX} ${startY - 5} Q ${(fromX + toX) / 2} ${midY} ${toX} ${startY - 5}`;
      
      g.append('path')
        .attr('d', path)
        .attr('fill', 'none')
        .attr('stroke', '#ff9800')
        .attr('stroke-width', 2)
        .attr('stroke-dasharray', '5,3')
        .attr('marker-end', 'url(#arrowhead)');

      // 跳跃范围标签
      g.append('text')
        .attr('x', (fromX + toX) / 2)
        .attr('y', midY - 10)
        .attr('text-anchor', 'middle')
        .attr('fill', '#ff9800')
        .attr('font-size', '11px')
        .text(`可跳 ${jumpRange} 步`);
    }

    // 定义箭头标记
    svg.append('defs')
      .append('marker')
      .attr('id', 'arrowhead')
      .attr('markerWidth', 10)
      .attr('markerHeight', 7)
      .attr('refX', 9)
      .attr('refY', 3.5)
      .attr('orient', 'auto')
      .append('polygon')
      .attr('points', '0 0, 10 3.5, 0 7')
      .attr('fill', '#ff9800');

    // 绘制变量状态面板
    const panelX = 20;
    const panelY = 20;
    const panelWidth = 180;
    const panelHeight = 120;

    const panel = g.append('g')
      .attr('class', 'variable-panel');

    panel.append('rect')
      .attr('x', panelX)
      .attr('y', panelY)
      .attr('width', panelWidth)
      .attr('height', panelHeight)
      .attr('fill', 'rgba(26, 26, 46, 0.9)')
      .attr('stroke', '#0f3460')
      .attr('rx', 6);

    panel.append('text')
      .attr('x', panelX + 10)
      .attr('y', panelY + 25)
      .attr('fill', '#4fc3f7')
      .attr('font-size', '13px')
      .attr('font-weight', 'bold')
      .text('变量状态');

    const variables = [
      { name: 'i', value: currentStep.variables.i >= 0 ? currentStep.variables.i : '-' },
      { name: 'k', value: currentStep.variables.k },
      { name: 'nums[i]', value: currentStep.variables['nums[i]'] >= 0 ? currentStep.variables['nums[i]'] : '-' },
      { name: 'i + nums[i]', value: currentStep.variables['i + nums[i]'] >= 0 ? currentStep.variables['i + nums[i]'] : '-' },
    ];

    variables.forEach((v, i) => {
      panel.append('text')
        .attr('x', panelX + 10)
        .attr('y', panelY + 50 + i * 18)
        .attr('fill', '#aaa')
        .attr('font-size', '12px')
        .attr('font-family', 'Consolas, monospace')
        .text(`${v.name} = ${v.value}`);
    });

    // 绘制结果状态
    if (currentStep.isComplete) {
      const resultText = result ? '✓ 可以到达终点' : '✗ 无法到达终点';
      const resultColor = result ? '#4caf50' : '#f44336';

      g.append('rect')
        .attr('x', width / 2 - 100)
        .attr('y', startY + cellHeight + 100)
        .attr('width', 200)
        .attr('height', 40)
        .attr('fill', 'rgba(26, 26, 46, 0.9)')
        .attr('stroke', resultColor)
        .attr('rx', 6);

      g.append('text')
        .attr('x', width / 2)
        .attr('y', startY + cellHeight + 126)
        .attr('text-anchor', 'middle')
        .attr('fill', resultColor)
        .attr('font-size', '16px')
        .attr('font-weight', 'bold')
        .text(resultText);
    }

    // 绘制步骤说明
    g.append('text')
      .attr('x', width / 2)
      .attr('y', height - 30)
      .attr('text-anchor', 'middle')
      .attr('fill', '#e0e0e0')
      .attr('font-size', '14px')
      .text(currentStep.description);

  }, [currentStep, transform]);

  useEffect(() => {
    drawCanvas();
  }, [drawCanvas]);

  // 窗口大小变化时重绘
  useEffect(() => {
    const handleResize = () => drawCanvas();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [drawCanvas]);

  // 鼠标拖拽
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - transform.x, y: e.clientY - transform.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setTransform(prev => ({
      ...prev,
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    }));
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // 滚轮缩放
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setTransform(prev => ({
      ...prev,
      scale: Math.max(0.5, Math.min(2, prev.scale * delta)),
    }));
  };

  // 重置视图
  const handleReset = () => {
    setTransform({ x: 0, y: 0, scale: 1 });
  };

  return (
    <div 
      className="canvas-container" 
      ref={containerRef}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onWheel={handleWheel}
    >
      <svg ref={svgRef} className="canvas-svg" />
      <button className="reset-view-btn" onClick={handleReset} title="重置视图">
        ⟲
      </button>
      <div className="canvas-hint">
        拖拽移动 · 滚轮缩放
      </div>
    </div>
  );
}
