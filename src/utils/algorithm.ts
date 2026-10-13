import type { AlgorithmStep } from '../types';

// 生成跳跃游戏算法的所有步骤
export function generateAlgorithmSteps(nums: number[]): AlgorithmStep[] {
  const steps: AlgorithmStep[] = [];
  const n = nums.length;
  let k = 0;
  const canReach = new Array(n).fill(false);

  if (n === 0) {
    return [{
      stepIndex: 0,
      description: '数组为空，没有可达的起点，返回 false',
      currentIndex: -1,
      maxReach: -1,
      previousMaxReach: -1,
      candidateReach: -1,
      nums: [],
      canReach: [],
      highlightedLines: {
        java: [8],
        python: [6],
        golang: [10],
        javascript: [10],
      },
      variables: {
        i: -1,
        k: -1,
        'nums[i]': -1,
        'i + nums[i]': -1,
      },
      isComplete: true,
      result: false,
      action: 'fail',
    }];
  }

  canReach[0] = true;

  // 初始化步骤
  steps.push({
    stepIndex: 0,
    description: '初始化：设置最远可达位置 k = 0，从第一个位置开始',
    currentIndex: -1,
    maxReach: 0,
    previousMaxReach: -1,
    candidateReach: -1,
    nums: [...nums],
    canReach: [...canReach],
    highlightedLines: {
      java: [3],
      python: [2],
      golang: [3],
      javascript: [2],
    },
    variables: {
      i: -1,
      k: 0,
      'nums[i]': -1,
      'i + nums[i]': -1,
    },
    isComplete: false,
    action: 'init',
  });

  for (let i = 0; i < n; i++) {
    // 检查当前位置是否可达
    if (i > k) {
      // 无法到达当前位置，算法失败
      steps.push({
        stepIndex: steps.length,
        description: `位置 ${i} 超出最远可达范围 ${k}，无法到达，返回 false`,
        currentIndex: i,
        maxReach: k,
        previousMaxReach: k,
        candidateReach: i + nums[i],
        nums: [...nums],
        canReach: [...canReach],
        highlightedLines: {
          java: [5],
          python: [4],
          golang: [5],
          javascript: [4],
        },
        variables: {
          i,
          k,
          'nums[i]': nums[i],
          'i + nums[i]': i + nums[i],
        },
        isComplete: true,
        result: false,
        action: 'fail',
      });
      return steps;
    }

    // 标记当前位置可达
    canReach[i] = true;

    // 检查步骤
    steps.push({
      stepIndex: steps.length,
      description: `检查位置 ${i}：当前位置 i=${i} ≤ 最远可达 k=${k}，可以到达此位置`,
      currentIndex: i,
      maxReach: k,
      previousMaxReach: k,
      candidateReach: i + nums[i],
      nums: [...nums],
      canReach: [...canReach],
      highlightedLines: {
        java: [4, 5],
        python: [3, 4],
        golang: [4, 5],
        javascript: [3, 4],
      },
      variables: {
        i,
        k,
        'nums[i]': nums[i],
        'i + nums[i]': i + nums[i],
      },
      isComplete: false,
      action: 'check',
    });

    // 更新最远可达位置
    const newK = Math.max(k, i + nums[i]);
    
    // 标记新可达的位置
    for (let j = k + 1; j <= Math.min(newK, n - 1); j++) {
      canReach[j] = true;
    }

    if (newK !== k) {
      steps.push({
        stepIndex: steps.length,
        description: `更新最远可达：k = max(${k}, ${i} + ${nums[i]}) = max(${k}, ${i + nums[i]}) = ${newK}`,
        currentIndex: i,
        maxReach: newK,
        previousMaxReach: k,
        candidateReach: i + nums[i],
        nums: [...nums],
        canReach: [...canReach],
        highlightedLines: {
          java: [6],
          python: [5],
          golang: [6],
          javascript: [5],
        },
        variables: {
          i,
          k: newK,
          'nums[i]': nums[i],
          'i + nums[i]': i + nums[i],
        },
        isComplete: false,
        action: 'update',
      });
    } else {
      steps.push({
        stepIndex: steps.length,
        description: `最远可达不变：k = max(${k}, ${i + nums[i]}) = ${k}`,
        currentIndex: i,
        maxReach: k,
        previousMaxReach: k,
        candidateReach: i + nums[i],
        nums: [...nums],
        canReach: [...canReach],
        highlightedLines: {
          java: [6],
          python: [5],
          golang: [6],
          javascript: [5],
        },
        variables: {
          i,
          k,
          'nums[i]': nums[i],
          'i + nums[i]': i + nums[i],
        },
        isComplete: false,
        action: 'update',
      });
    }

    k = newK;

    // 如果已经可以到达终点，提前结束
    if (k >= n - 1 && i === n - 1) {
      break;
    }
  }

  // 成功步骤
  steps.push({
    stepIndex: steps.length,
    description: `遍历完成：最远可达位置 k=${k} ≥ 最后位置 ${n - 1}，返回 true`,
    currentIndex: n - 1,
    maxReach: k,
    previousMaxReach: k,
    candidateReach: n - 1 + nums[n - 1],
    nums: [...nums],
    canReach: [...canReach],
    highlightedLines: {
      java: [8],
      python: [6],
      golang: [8],
      javascript: [6],
    },
    variables: {
      i: n - 1,
      k,
      'nums[i]': nums[n - 1],
      'i + nums[i]': n - 1 + nums[n - 1],
    },
    isComplete: true,
    result: true,
    action: 'success',
  });

  return steps;
}

// 验证输入数据是否合法
export function validateInput(input: string): { valid: boolean; nums?: number[]; error?: string } {
  const trimmed = input.trim();
  
  if (!trimmed) {
    return { valid: false, error: '请输入数组数据' };
  }

  // 支持多种格式：[1,2,3] 或 1,2,3 或 1 2 3
  let numsStr = trimmed;
  if (numsStr.startsWith('[') && numsStr.endsWith(']')) {
    numsStr = numsStr.slice(1, -1);
  }
  
  const parts = numsStr.split(/[,\s]+/).filter(s => s.length > 0);
  
  if (parts.length === 0) {
    return { valid: false, error: '数组不能为空' };
  }

  if (parts.length > 10000) {
    return { valid: false, error: '数组长度不能超过 10000' };
  }

  const nums: number[] = [];
  for (const part of parts) {
    const num = parseInt(part, 10);
    if (isNaN(num)) {
      return { valid: false, error: `"${part}" 不是有效的整数` };
    }
    if (num < 0) {
      return { valid: false, error: '数组元素必须是非负整数' };
    }
    if (num > 100000) {
      return { valid: false, error: '数组元素不能超过 100000' };
    }
    nums.push(num);
  }

  return { valid: true, nums };
}

// 生成随机合法数据
export function generateRandomInput(): number[] {
  const length = Math.floor(Math.random() * 8) + 3; // 3-10 个元素
  const nums: number[] = [];
  
  // 随机决定是否生成可达的数组
  const shouldBeReachable = Math.random() > 0.3;
  
  if (shouldBeReachable) {
    // 生成可达的数组
    for (let i = 0; i < length; i++) {
      if (i === length - 1) {
        nums.push(Math.floor(Math.random() * 5));
      } else {
        // 确保至少有机会跳到下一个位置
        const minJump = 1;
        const maxJump = Math.min(length - i, 5);
        nums.push(Math.floor(Math.random() * (maxJump - minJump + 1)) + minJump);
      }
    }
  } else {
    // 生成可能不可达的数组
    for (let i = 0; i < length; i++) {
      if (Math.random() > 0.7) {
        nums.push(0); // 有概率生成0
      } else {
        nums.push(Math.floor(Math.random() * 4));
      }
    }
  }
  
  return nums;
}

// 预设示例数据
export const EXAMPLE_INPUTS = [
  { nums: [2, 3, 1, 1, 4], label: '示例1: 可达' },
  { nums: [3, 2, 1, 0, 4], label: '示例2: 不可达' },
  { nums: [0], label: '单元素' },
  { nums: [2, 0, 0], label: '刚好可达' },
  { nums: [1, 1, 1, 1], label: '步步为营' },
];
