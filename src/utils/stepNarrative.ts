import type { AlgorithmStep } from '../types';

export interface StepNarrative {
  title: string;
  detail: string;
  conclusion: string;
}

export function getStepNarrative(step: AlgorithmStep): StepNarrative {
  const { action, currentIndex, maxReach, previousMaxReach, candidateReach, nums, result } = step;
  const previous = previousMaxReach ?? maxReach;
  const candidate = candidateReach ?? (currentIndex >= 0 ? currentIndex + (nums[currentIndex] ?? 0) : -1);

  switch (action) {
    case 'init':
      return {
        title: '从起点开始',
        detail: '最远边界 k = 0',
        conclusion: '可达位置始终连成 0..k；先检查位置 0',
      };
    case 'check':
      return {
        title: `检查位置 ${currentIndex}`,
        detail: `${currentIndex} ≤ ${maxReach}？`,
        conclusion: `在连续可达区间 0..${maxReach} 内；可以用它尝试扩展边界`,
      };
    case 'update':
      return {
        title: `用位置 ${currentIndex} 更新边界`,
        detail: `候选 ${currentIndex} + ${nums[currentIndex]} = ${candidate}；max(${previous}, ${candidate})`,
        conclusion: maxReach > previous
          ? `边界从 ${previous} 推进到 ${maxReach}；0..${maxReach} 仍连续可达`
          : `候选没有超过旧边界；可达区间仍是 0..${maxReach}`,
      };
    case 'fail':
      if (currentIndex < 0 || currentIndex >= nums.length) {
        return {
          title: '没有可检查的位置',
          detail: '输入数组为空',
          conclusion: '不存在起点，返回 false',
        };
      }
      return {
        title: `断点出现在位置 ${currentIndex}`,
        detail: `${currentIndex} > ${maxReach}`,
        conclusion: `最远只能到 ${maxReach}，无法跨过这个位置，返回 false`,
      };
    case 'success':
      return {
        title: '终点可达',
        detail: `终点下标 n−1 = ${nums.length - 1}，最远边界 k = ${maxReach}`,
        conclusion: result === true
          ? '终点已落在可达范围内，返回 true'
          : '遍历完成，返回 true',
      };
  }
}
