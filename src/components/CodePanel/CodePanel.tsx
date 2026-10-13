import { useEffect, useState } from 'react';
import { CODE_SNIPPETS, LANGUAGE_LABELS } from '../../data/codeSnippets';
import { saveLanguagePreference, getLanguagePreference } from '../../utils/db';
import type { ProgrammingLanguage, AlgorithmStep } from '../../types';
import { getVariableAnnotation } from './annotations';
import { tokenizeLine } from './syntax';
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
  const variables = currentStep?.variables;

  return (
    <section id="algorithm-code" className="code-panel" aria-label="算法代码">
      <div className="code-header">
        <div className="language-tabs" role="group" aria-label="选择编程语言">
          {(Object.keys(CODE_SNIPPETS) as ProgrammingLanguage[]).map(lang => (
            <button
              key={lang}
              type="button"
              className={`language-tab ${language === lang ? 'active' : ''}`}
              onClick={() => handleLanguageChange(lang)}
              aria-pressed={language === lang}
            >
              {LANGUAGE_LABELS[lang]}
            </button>
          ))}
        </div>
      </div>

      <div className="code-content">
        <pre className="code-block" aria-label={`${LANGUAGE_LABELS[language]} 跳跃游戏算法代码`}>
          <code>
            {lines.map((line, index) => {
              const lineNum = index + 1;
              const isHighlighted = highlightedLines.includes(lineNum);
              const variableAnnotation = getVariableAnnotation(line, variables, language);

              return (
                <span
                  key={`${language}-${lineNum}`}
                  className={`code-line ${isHighlighted ? 'highlighted' : ''}`}
                >
                  <span className="line-number" aria-hidden="true">{lineNum}</span>
                  <span className="line-content">
                    {tokenizeLine(line, language).map((token, tokenIndex) => (
                      token.kind === 'plain'
                        ? token.value
                        : <span key={tokenIndex} className={token.kind}>{token.value}</span>
                    ))}
                  </span>
                  {variableAnnotation && (
                    <span className="variable-annotation" aria-label={`当前变量值：${variableAnnotation.replace(/^(?:\/\/|#)\s*/, '')}`}>
                      {variableAnnotation}
                    </span>
                  )}
                </span>
              );
            })}
          </code>
        </pre>
      </div>
    </section>
  );
}
