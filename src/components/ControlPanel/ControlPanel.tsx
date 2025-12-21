import { useEffect, useState, useCallback } from 'react';
import { savePlaybackSpeed, getPlaybackSpeed } from '../../utils/db';
import './ControlPanel.css';

interface ControlPanelProps {
  currentStep: number;
  totalSteps: number;
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

export function ControlPanel({
  currentStep,
  totalSteps,
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
        isPlaying ? onPause() : onPlay();
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

  return (
    <div className="control-panel">
      <div className="control-buttons">
        <button 
          className="control-btn" 
          onClick={onPrev}
          disabled={currentStep === 0}
          title="上一步 (←)"
        >
          ⏮ 上一步 <kbd>←</kbd>
        </button>

        <button 
          className="control-btn play-btn" 
          onClick={isPlaying ? onPause : onPlay}
          title={isPlaying ? '暂停 (空格)' : '播放 (空格)'}
        >
          {isPlaying ? '⏸ 暂停' : '▶ 播放'} <kbd>空格</kbd>
        </button>

        <button 
          className="control-btn" 
          onClick={onNext}
          disabled={currentStep === totalSteps - 1}
          title="下一步 (→)"
        >
          下一步 ⏭ <kbd>→</kbd>
        </button>

        <button 
          className="control-btn reset-btn" 
          onClick={onReset}
          title="重置 (R)"
        >
          ↺ 重置 <kbd>R</kbd>
        </button>

        <div className="speed-control">
          <button 
            className="speed-btn"
            onClick={() => setShowSpeedMenu(!showSpeedMenu)}
          >
            {speed}x 速度 ▾
          </button>
          {showSpeedMenu && (
            <div className="speed-menu">
              {SPEED_OPTIONS.map(s => (
                <button
                  key={s}
                  className={`speed-option ${speed === s ? 'active' : ''}`}
                  onClick={() => handleSpeedChange(s)}
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
        onClick={handleProgressClick}
        onMouseMove={handleProgressDrag}
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
