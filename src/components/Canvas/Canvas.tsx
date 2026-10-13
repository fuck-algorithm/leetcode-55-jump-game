import { useEffect, useRef, useState, useCallback } from 'react';
import type { AlgorithmStep } from '../../types';
import type { StepNarrative } from '../../utils/stepNarrative';
import { drawCanvas } from './drawCanvas';
import './Canvas.css';

interface CanvasProps {
  currentStep: AlgorithmStep | null;
  narrative: StepNarrative | null;
}

export function Canvas({ currentStep, narrative }: CanvasProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [transform, setTransform] = useState({ x: 0, y: 0, scale: 1 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const updateMotionPreference = () => setReducedMotion(mediaQuery.matches);
    updateMotionPreference();
    mediaQuery.addEventListener('change', updateMotionPreference);
    return () => mediaQuery.removeEventListener('change', updateMotionPreference);
  }, []);


  const renderCanvas = useCallback(() => {
    drawCanvas(svgRef.current, containerRef.current, currentStep, transform, reducedMotion, isDragging, narrative);
  }, [currentStep, isDragging, narrative, reducedMotion, transform]);

  useEffect(() => {
    renderCanvas();
  }, [renderCanvas]);

  useEffect(() => {
    const handleResize = () => renderCanvas();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [renderCanvas]);

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).closest('button')) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - transform.x, y: e.clientY - transform.y });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    setTransform(prev => ({
      ...prev,
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    }));
  };

  const handleMouseUp = () => setIsDragging(false);

  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setTransform(prev => ({
      ...prev,
      scale: Math.max(0.5, Math.min(2, prev.scale * delta)),
    }));
  };

  const handleReset = () => setTransform({ x: 0, y: 0, scale: 1 });

  return (
    <div
      className={`canvas-container ${isDragging ? 'is-dragging' : ''}`}
      ref={containerRef}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onWheel={handleWheel}
    >
      <svg
        ref={svgRef}
        className="canvas-svg"
        role="img"
        aria-label={narrative
          ? `${narrative.title}。${narrative.detail}。${narrative.conclusion}。${currentStep?.description ?? ''}`
          : currentStep?.description ?? '跳跃游戏可视化画布'}
      />
      <button
        className="reset-view-btn"
        onClick={handleReset}
        title="重置视图"
        aria-label="重置画布视图"
      >
        ⟲
      </button>
      <div className="canvas-hint" aria-hidden="true">
        拖拽移动 · 滚轮缩放
      </div>
    </div>
  );
}
