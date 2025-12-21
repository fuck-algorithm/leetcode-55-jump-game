import { useState, useEffect } from 'react';
import { fetchGitHubStars, GITHUB_REPO_URL } from '../../utils/github';
import { ALGORITHM_THOUGHTS } from '../../data/algorithmThoughts';
import './Header.css';

const LEETCODE_URL = 'https://leetcode.cn/problems/jump-game/';
const HOT100_URL = 'https://fuck-algorithm.github.io/leetcode-hot-100/';

export function Header() {
  const [stars, setStars] = useState<number>(0);
  const [showThoughts, setShowThoughts] = useState(false);

  useEffect(() => {
    fetchGitHubStars().then(setStars);
  }, []);

  return (
    <header className="header">
      <div className="header-left">
        <a 
          href={HOT100_URL} 
          target="_blank" 
          rel="noopener noreferrer"
          className="back-link"
        >
          ← 返回 Leetcode Hot 100
        </a>
      </div>

      <div className="header-center">
        <a 
          href={LEETCODE_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="title-link"
        >
          <h1 className="title">55. 跳跃游戏</h1>
        </a>
      </div>

      <div className="header-right">
        <button 
          className="thoughts-btn"
          onClick={() => setShowThoughts(true)}
        >
          💡 算法思路
        </button>

        <a
          href={GITHUB_REPO_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="github-link"
          title="点击去 GitHub 仓库 Star 支持一下"
        >
          <svg className="github-icon" viewBox="0 0 16 16" fill="currentColor">
            <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/>
          </svg>
          <span className="star-count">⭐ {stars}</span>
        </a>
      </div>

      {showThoughts && (
        <div className="modal-overlay" onClick={() => setShowThoughts(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <button 
              className="modal-close"
              onClick={() => setShowThoughts(false)}
            >
              ✕
            </button>
            <div 
              className="thoughts-content"
              dangerouslySetInnerHTML={{ __html: formatMarkdown(ALGORITHM_THOUGHTS) }}
            />
          </div>
        </div>
      )}
    </header>
  );
}

// 简单的 Markdown 格式化
function formatMarkdown(text: string): string {
  return text
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/`(.+?)`/g, '<code>$1</code>')
    .replace(/^- (.+)$/gm, '<li>$1</li>')
    .replace(/(<li>.*<\/li>\n?)+/g, '<ul>$&</ul>')
    .replace(/\n\n/g, '</p><p>')
    .replace(/^/, '<p>')
    .replace(/$/, '</p>');
}
