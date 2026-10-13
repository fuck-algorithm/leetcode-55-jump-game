import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Header } from './components/Header/Header';
import { InputPanel } from './components/InputPanel/InputPanel';
import { CodePanel } from './components/CodePanel/CodePanel';
import { Canvas } from './components/Canvas/Canvas';
import { ControlPanel } from './components/ControlPanel/ControlPanel';
import { ChatBubble } from './components/ChatBubble/ChatBubble';
import { generateAlgorithmSteps, EXAMPLE_INPUTS } from './utils/algorithm';
import { getStepNarrative } from './utils/stepNarrative';
import './App.css';

function App() {
  const [nums, setNums] = useState<number[]>(EXAMPLE_INPUTS[0].nums);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [showCode, setShowCode] = useState(false);
  const playIntervalRef = useRef<number | null>(null);

  // 生成算法步骤
  const steps = useMemo(() => generateAlgorithmSteps(nums), [nums]);

  // 自动播放
  useEffect(() => {
    if (!isPlaying || steps.length <= 1) {
      if (playIntervalRef.current !== null) {
        window.clearInterval(playIntervalRef.current);
        playIntervalRef.current = null;
      }
      return;
    }

    playIntervalRef.current = window.setInterval(() => {
      setCurrentStepIndex(prev => {
        if (prev >= steps.length - 1) {
          if (playIntervalRef.current !== null) {
            window.clearInterval(playIntervalRef.current);
            playIntervalRef.current = null;
          }
          setIsPlaying(false);
          return prev;
        }
        return prev + 1;
      });
    }, 1500 / speed);

    return () => {
      if (playIntervalRef.current !== null) {
        window.clearInterval(playIntervalRef.current);
        playIntervalRef.current = null;
      }
    };
  }, [isPlaying, speed, steps.length]);

  const handlePlay = useCallback(() => {
    if (currentStepIndex >= steps.length - 1) {
      setCurrentStepIndex(0);
    }
    setIsPlaying(true);
  }, [currentStepIndex, steps.length]);

  const handlePause = useCallback(() => {
    setIsPlaying(false);
  }, []);

  const handlePrev = useCallback(() => {
    setIsPlaying(false);
    setCurrentStepIndex(prev => Math.max(0, prev - 1));
  }, []);

  const handleNext = useCallback(() => {
    setIsPlaying(false);
    setCurrentStepIndex(prev => Math.min(steps.length - 1, prev + 1));
  }, [steps.length]);

  const handleReset = useCallback(() => {
    setIsPlaying(false);
    setCurrentStepIndex(0);
  }, []);

  const handleSeek = useCallback((step: number) => {
    setIsPlaying(false);
    setCurrentStepIndex(step);
  }, []);

  const handleSpeedChange = useCallback((newSpeed: number) => {
    setSpeed(newSpeed);
  }, []);

  const handleInputChange = useCallback((newNums: number[]) => {
    setIsPlaying(false);
    setCurrentStepIndex(0);
    setNums(newNums);
  }, []);

  const currentStep = steps[currentStepIndex] || null;
  const currentNarrative = currentStep ? getStepNarrative(currentStep) : null;

  return (
    <div className="app">
      <Header />
      <InputPanel onInputChange={handleInputChange} currentInput={nums} />
      
      <div className="main-content">
        {showCode && (
          <div className="code-section">
            <CodePanel currentStep={currentStep} />
          </div>
        )}
        <div className="canvas-section">
          <div className="learning-model">
            <div className="learning-model-copy">
              <span className="learning-model-kicker">先记住这一点</span>
              <p><strong>k</strong> 是目前能到达的最远位置。只检查 <strong>i ≤ k</strong> 的位置，再用 <strong>i + nums[i]</strong> 尝试把边界推远。</p>
            </div>
            <div className="learning-legend" aria-label="图示说明">
              <span><i className="legend-dot legend-current" />i 当前检查</span>
              <span><i className="legend-dot legend-reach" />k 可达边界</span>
              <span><i className="legend-dot legend-end" />终点 n−1</span>
            </div>
          </div>
          <div className="visualization-toolbar">
            <span>跟着边界走，不必先记跳跃路径</span>
            <button
              type="button"
              className="toggle-code-btn"
              onClick={() => setShowCode(value => !value)}
              aria-expanded={showCode}
              aria-controls="algorithm-code"
            >
              {showCode ? '收起代码' : '查看代码'}
            </button>
          </div>
          <Canvas currentStep={currentStep} narrative={currentNarrative} />
        </div>
      </div>

      <ControlPanel
        currentStep={currentStepIndex}
        totalSteps={steps.length}
        currentAction={currentStep?.action ?? null}
        currentDescription={currentStep?.description ?? ''}
        narrative={currentNarrative}
        isPlaying={isPlaying}
        onPlay={handlePlay}
        onPause={handlePause}
        onPrev={handlePrev}
        onNext={handleNext}
        onReset={handleReset}
        onSeek={handleSeek}
        onSpeedChange={handleSpeedChange}
      />

      <ChatBubble />
    </div>
  );
}

export default App;
