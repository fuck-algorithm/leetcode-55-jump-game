import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Header } from './components/Header/Header';
import { InputPanel } from './components/InputPanel/InputPanel';
import { CodePanel } from './components/CodePanel/CodePanel';
import { Canvas } from './components/Canvas/Canvas';
import { ControlPanel } from './components/ControlPanel/ControlPanel';
import { ChatBubble } from './components/ChatBubble/ChatBubble';
import { generateAlgorithmSteps, EXAMPLE_INPUTS } from './utils/algorithm';
import './App.css';

function App() {
  const [nums, setNums] = useState<number[]>(EXAMPLE_INPUTS[0].nums);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
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

  return (
    <div className="app">
      <Header />
      <InputPanel onInputChange={handleInputChange} currentInput={nums} />
      
      <div className="main-content">
        <div className="code-section">
          <CodePanel currentStep={currentStep} />
        </div>
        <div className="canvas-section">
          <Canvas currentStep={currentStep} />
        </div>
      </div>

      <ControlPanel
        currentStep={currentStepIndex}
        totalSteps={steps.length}
        currentAction={currentStep?.action ?? null}
        currentDescription={currentStep?.description ?? ''}
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
