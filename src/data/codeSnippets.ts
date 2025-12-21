import type { ProgrammingLanguage } from '../types';

export const CODE_SNIPPETS: Record<ProgrammingLanguage, string> = {
  java: `class Solution {
    public boolean canJump(int[] nums) {
        int k = 0;
        for (int i = 0; i < nums.length; i++) {
            if (i > k) return false;
            k = Math.max(k, i + nums[i]);
        }
        return true;
    }
}`,

  python: `class Solution:
    def canJump(self, nums: List[int]) -> bool:
        k = 0
        for i in range(len(nums)):
            if i > k: return False
            k = max(k, i + nums[i])
        return True`,

  golang: `func canJump(nums []int) bool {
    k := 0
    for i := 0; i < len(nums); i++ {
        if i > k {
            return false
        }
        k = max(k, i + nums[i])
    }
    return true
}`,

  javascript: `var canJump = function(nums) {
    let k = 0;
    for (let i = 0; i < nums.length; i++) {
        if (i > k) return false;
        k = Math.max(k, i + nums[i]);
    }
    return true;
};`,
};

export const LANGUAGE_LABELS: Record<ProgrammingLanguage, string> = {
  java: 'Java',
  python: 'Python',
  golang: 'Go',
  javascript: 'JavaScript',
};
