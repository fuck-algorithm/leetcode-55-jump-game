import { useState } from 'react';
import { validateInput, generateRandomInput, EXAMPLE_INPUTS } from '../../utils/algorithm';
import './InputPanel.css';

interface InputPanelProps {
  onInputChange: (nums: number[]) => void;
  currentInput: number[];
}

export function InputPanel({ onInputChange, currentInput }: InputPanelProps) {
  const [inputValue, setInputValue] = useState(currentInput.join(', '));
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (value: string) => {
    setInputValue(value);
    setError(null);
  };

  const handleApply = () => {
    const result = validateInput(inputValue);
    if (result.valid && result.nums) {
      onInputChange(result.nums);
      setError(null);
    } else {
      setError(result.error || '输入无效');
    }
  };

  const handleExampleClick = (nums: number[]) => {
    setInputValue(nums.join(', '));
    setError(null);
    onInputChange(nums);
  };

  const handleRandom = () => {
    const nums = generateRandomInput();
    setInputValue(nums.join(', '));
    setError(null);
    onInputChange(nums);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleApply();
    }
  };

  return (
    <div className="input-panel">
      <div className="input-row">
        <label className="input-label">nums =</label>
        <input
          type="text"
          className={`input-field ${error ? 'input-error' : ''}`}
          value={inputValue}
          onChange={e => handleInputChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="输入数组，如: 2, 3, 1, 1, 4"
        />
        <button className="apply-btn" onClick={handleApply}>
          应用
        </button>
        <button className="random-btn" onClick={handleRandom}>
          🎲 随机
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="examples-row">
        <span className="examples-label">示例：</span>
        {EXAMPLE_INPUTS.map((example, index) => (
          <button
            key={index}
            className={`example-btn ${
              JSON.stringify(currentInput) === JSON.stringify(example.nums) ? 'active' : ''
            }`}
            onClick={() => handleExampleClick(example.nums)}
          >
            {example.label}
          </button>
        ))}
      </div>
    </div>
  );
}
