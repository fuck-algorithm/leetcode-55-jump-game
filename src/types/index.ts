// 算法步骤类型
export interface AlgorithmStep {
  stepIndex: number;
  description: string;
  currentIndex: number;
  maxReach: number;
  previousMaxReach?: number;
  candidateReach?: number;
  nums: number[];
  canReach: boolean[];
  highlightedLines: {
    java: number[];
    python: number[];
    golang: number[];
    javascript: number[];
  };
  variables: {
    i: number;
    k: number;
    'nums[i]': number;
    'i + nums[i]': number;
  };
  isComplete: boolean;
  result?: boolean;
  action: 'init' | 'check' | 'update' | 'fail' | 'success';
}

// 编程语言类型
export type ProgrammingLanguage = 'java' | 'python' | 'golang' | 'javascript';

// 播放状态
export interface PlaybackState {
  isPlaying: boolean;
  currentStep: number;
  totalSteps: number;
  speed: number;
}

// GitHub Star 缓存
export interface GitHubStarCache {
  key?: string;
  stars: number;
  timestamp: number;
}
