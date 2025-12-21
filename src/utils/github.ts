import { saveGitHubStars, getGitHubStarsCache, isCacheValid } from './db';

const REPO_OWNER = 'fuck-algorithm';
const REPO_NAME = 'leetcode-55-jump-game';
const GITHUB_API_URL = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}`;
export const GITHUB_REPO_URL = `https://github.com/${REPO_OWNER}/${REPO_NAME}`;

export async function fetchGitHubStars(): Promise<number> {
  try {
    // 先检查缓存
    const cache = await getGitHubStarsCache();
    if (isCacheValid(cache)) {
      return cache!.stars;
    }

    // 缓存无效，从 API 获取
    const response = await fetch(GITHUB_API_URL);
    if (!response.ok) {
      throw new Error('Failed to fetch GitHub stars');
    }

    const data = await response.json();
    const stars = data.stargazers_count || 0;

    // 保存到缓存
    await saveGitHubStars(stars);

    return stars;
  } catch (error) {
    console.error('Error fetching GitHub stars:', error);
    
    // 获取失败时尝试使用缓存
    const cache = await getGitHubStarsCache();
    if (cache) {
      return cache.stars;
    }
    
    return 0;
  }
}
