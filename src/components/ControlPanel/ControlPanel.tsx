import { useEffect, useState, useCallback } from 'react';
import { savePlaybackSpeed, getPlaybackSpeed } from '../../utils/db';
import type { StepNarrative } from '../../utils/stepNarrative';
import './ControlPanel.css';

interface ControlPanelProps {
  currentStep: number;
  totalSteps: number;
  currentAction: 'init' | 'check' | 'update' | 'fail' | 'success' | null;
  currentDescription: string;
  narrative: StepNarrative | null;
  isPlaying: boolean;
  onPlay: () => void;
  onPause: () => void;
  onPrev: () => void;
  onNext: () => void;
  onReset: () => void;
  onSeek: (step: number) => void;
  onSpeedChange: (speed: number) => void;
}

const SPEED_OPTIONS = [0.5, 0.75, 1, 1.25, 1.5, 2];

const ACTION_LABELS: Record<NonNullable<ControlPanelProps['currentAction']>, string> = {
  init: '初始化',
  check: '检查可达性',
  update: '更新最远位置',
  fail: '无法继续',
  success: '完成',
};

export function ControlPanel({
  currentStep,
  totalSteps,
  currentAction,
  currentDescription,
  narrative,
  isPlaying,
  onPlay,
  onPause,
  onPrev,
  onNext,
  onReset,
  onSeek,
  onSpeedChange,
}: ControlPanelProps) {
  const [speed, setSpeed] = useState(1);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);

  useEffect(() => {
    getPlaybackSpeed().then(savedSpeed => {
      setSpeed(savedSpeed);
      onSpeedChange(savedSpeed);
    });
  }, [onSpeedChange]);

  const handleSpeedChange = async (newSpeed: number) => {
    setSpeed(newSpeed);
    setShowSpeedMenu(false);
    await savePlaybackSpeed(newSpeed);
    onSpeedChange(newSpeed);
  };

  // 键盘快捷键
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.target instanceof HTMLInputElement) return;

    switch (e.code) {
      case 'ArrowLeft':
        e.preventDefault();
        onPrev();
        break;
      case 'ArrowRight':
        e.preventDefault();
        onNext();
        break;
      case 'Space':
        e.preventDefault();
        if (isPlaying) {
          onPause();
        } else {
          onPlay();
        }
        break;
      case 'KeyR':
        e.preventDefault();
        onReset();
        break;
    }
  }, [isPlaying, onPrev, onNext, onPlay, onPause, onReset]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // 进度条拖拽
  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (totalSteps <= 1) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = x / rect.width;
    const step = Math.round(percentage * (totalSteps - 1));
    onSeek(Math.max(0, Math.min(totalSteps - 1, step)));
  };

  const handleProgressDrag = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.buttons !== 1) return;
    handleProgressClick(e);
  };

  const progress = totalSteps > 1 ? (currentStep / (totalSteps - 1)) * 100 : 0;

  const actionLabel = currentAction ? ACTION_LABELS[currentAction] : '准备开始';
  const isComplete = totalSteps > 0 && currentStep === totalSteps - 1;

  return (
    <div className="control-panel">
      <div className="step-summary" aria-live="polite">
        <span className={`action-badge action-${currentAction ?? 'idle'}`}>{narrative?.title ?? actionLabel}</span>
        <span className="step-description" title={currentDescription}>
          {narrative ? <><strong>{narrative.detail}</strong>{' · '}{narrative.conclusion}</> : currentDescription}
        </span>
        {isComplete && <span className="complete-badge">已完成</span>}
      </div>
      <div className="control-buttons">
        <button 
          className="control-btn" 
          onClick={onPrev}
          disabled={currentStep === 0}
          title="上一步 (←)"
          aria-label="上一步"
        >
          ⏮ 上一步 <kbd>←</kbd>
        </button>

        <button 
          className="control-btn play-btn" 
          onClick={isPlaying ? onPause : onPlay}
          title={isPlaying ? '暂停 (空格)' : '播放 (空格)'}
          aria-label={isPlaying ? '暂停播放' : '开始播放'}
        >
          {isPlaying ? '⏸ 暂停' : '▶ 播放'} <kbd>空格</kbd>
        </button>

        <button 
          className="control-btn" 
          onClick={onNext}
          disabled={currentStep === totalSteps - 1}
          title="下一步 (→)"
          aria-label="下一步"
        >
          下一步 ⏭ <kbd>→</kbd>
        </button>

        <button 
          className="control-btn reset-btn" 
          onClick={onReset}
          title="重置 (R)"
          aria-label="重置播放进度"
        >
          ↺ 重置 <kbd>R</kbd>
        </button>

        <div className="speed-control">
          <button
            className="speed-btn"
            onClick={() => setShowSpeedMenu(!showSpeedMenu)}
            aria-expanded={showSpeedMenu}
            aria-haspopup="menu"
            aria-label={`播放速度，当前 ${speed} 倍`}
          >
            {speed}x 速度 ▾
          </button>
          {showSpeedMenu && (
            <div className="speed-menu" role="menu">
              {SPEED_OPTIONS.map(s => (
                <button
                  key={s}
                  className={`speed-option ${speed === s ? 'active' : ''}`}
                  onClick={() => handleSpeedChange(s)}
                  role="menuitemradio"
                  aria-checked={speed === s}
                >
                  {s}x
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="step-indicator">
          步骤 {currentStep + 1} / {totalSteps}
        </div>
      </div>

      <div
        className="progress-bar"
        role="slider"
        tabIndex={0}
        aria-label="动画步骤进度"
        aria-valuemin={0}
        aria-valuemax={Math.max(totalSteps - 1, 0)}
        aria-valuenow={currentStep}
        onClick={handleProgressClick}
        onMouseMove={handleProgressDrag}
        onKeyDown={e => {
          if (e.key === 'ArrowLeft') onSeek(Math.max(0, currentStep - 1));
          if (e.key === 'ArrowRight') onSeek(Math.min(totalSteps - 1, currentStep + 1));
        }}
      >
        <div 
          className="progress-fill"
          style={{ width: `${progress}%` }}
        />
        <div 
          className="progress-handle"
          style={{ left: `${progress}%` }}
        />
      </div>
    </div>
  );
}
