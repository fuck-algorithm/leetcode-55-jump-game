import { useEffect, useState } from 'react';
import { CODE_SNIPPETS, LANGUAGE_LABELS } from '../../data/codeSnippets';
import { saveLanguagePreference, getLanguagePreference } from '../../utils/db';
import type { ProgrammingLanguage, AlgorithmStep } from '../../types';
import './CodePanel.css';

interface CodePanelProps {
  currentStep: AlgorithmStep | null;
}

export function CodePanel({ currentStep }: CodePanelProps) {
  const [language, setLanguage] = useState<ProgrammingLanguage>('java');

  useEffect(() => {
    getLanguagePreference().then(setLanguage);
  }, []);

  const handleLanguageChange = async (lang: ProgrammingLanguage) => {
    setLanguage(lang);
    await saveLanguagePreference(lang);
  };

  const code = CODE_SNIPPETS[language];
  const lines = code.split('\n');
  const highlightedLines = currentStep?.highlightedLines[language] || [];

  // 获取当前步骤的变量值
  const variables = currentStep?.variables;

  return (
    <div className="code-panel">
      <div className="code-header">
        <div className="language-tabs">
          {(Object.keys(CODE_SNIPPETS) as ProgrammingLanguage[]).map(lang => (
            <button
              key={lang}
              className={`language-tab ${language === lang ? 'active' : ''}`}
              onClick={() => handleLanguageChange(lang)}
            >
              {LANGUAGE_LABELS[lang]}
            </button>
          ))}
        </div>
      </div>

      <div className="code-content">
        <pre className="code-block">
          {lines.map((line, index) => {
            const lineNum = index + 1;
            const isHighlighted = highlightedLines.includes(lineNum);
            const variableAnnotation = getVariableAnnotation(line, variables, language);

            return (
              <div
                key={index}
                className={`code-line ${isHighlighted ? 'highlighted' : ''}`}
              >
                <span className="line-number">{lineNum}</span>
                <span className="line-content">
                  {highlightSyntax(line, language)}
                </span>
                {variableAnnotation && (
                  <span className="variable-annotation">{variableAnnotation}</span>
                )}
              </div>
            );
          })}
        </pre>
      </div>
    </div>
  );
}

// 获取变量注释
function getVariableAnnotation(
  line: string,
  variables: AlgorithmStep['variables'] | undefined,
  _language: ProgrammingLanguage
): string | null {
  if (!variables || variables.i < 0) return null;

  // 根据语言和行内容判断显示哪些变量
  const trimmedLine = line.trim();

  // k 的初始化行
  if (trimmedLine.includes('k = 0') || trimmedLine.includes('k := 0')) {
    return `// k = ${variables.k}`;
  }

  // 循环行
  if (trimmedLine.includes('for') && trimmedLine.includes('i')) {
    return `// i = ${variables.i}`;
  }

  // 条件检查行
  if (trimmedLine.includes('i > k')) {
    return `// ${variables.i} > ${variables.k} = ${variables.i > variables.k}`;
  }

  // 更新 k 的行
  if (trimmedLine.includes('max(k') || trimmedLine.includes('Math.max(k')) {
    return `// max(${variables.k}, ${variables['i + nums[i]']}) = ${Math.max(variables.k, variables['i + nums[i]'])}`;
  }

  return null;
}

// 语法高亮
function highlightSyntax(line: string, language: ProgrammingLanguage): React.ReactNode {
  const keywords: Record<ProgrammingLanguage, string[]> = {
    java: ['class', 'public', 'boolean', 'int', 'for', 'if', 'return', 'true', 'false'],
    python: ['class', 'def', 'for', 'in', 'if', 'return', 'True', 'False', 'range', 'len', 'max'],
    golang: ['func', 'for', 'if', 'return', 'true', 'false', 'int', 'bool', 'len', 'max'],
    javascript: ['var', 'let', 'const', 'function', 'for', 'if', 'return', 'true', 'false'],
  };

  const langKeywords = keywords[language];
  let result = line;

  // 高亮关键字
  langKeywords.forEach(keyword => {
    const regex = new RegExp(`\\b(${keyword})\\b`, 'g');
    result = result.replace(regex, `<span class="keyword">$1</span>`);
  });

  // 高亮数字
  result = result.replace(/\b(\d+)\b/g, '<span class="number">$1</span>');

  // 高亮字符串
  result = result.replace(/(["'].*?["'])/g, '<span class="string">$1</span>');

  // 高亮注释
  if (result.includes('//')) {
    const commentIndex = result.indexOf('//');
    const beforeComment = result.substring(0, commentIndex);
    const comment = result.substring(commentIndex);
    result = beforeComment + `<span class="comment">${comment}</span>`;
  }

  return <span dangerouslySetInnerHTML={{ __html: result }} />;
}
