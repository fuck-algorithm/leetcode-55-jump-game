import type { ProgrammingLanguage } from '../../types';

export interface SyntaxToken {
  value: string;
  kind: 'plain' | 'keyword' | 'number' | 'string' | 'comment';
}

const KEYWORDS: Record<ProgrammingLanguage, Set<string>> = {
  java: new Set(['class', 'public', 'boolean', 'int', 'for', 'if', 'return', 'true', 'false']),
  python: new Set(['class', 'def', 'for', 'in', 'if', 'return', 'True', 'False', 'range', 'len', 'max']),
  golang: new Set(['func', 'for', 'if', 'return', 'true', 'false', 'int', 'bool', 'len', 'max']),
  javascript: new Set(['var', 'let', 'const', 'function', 'for', 'if', 'return', 'true', 'false']),
};

const IDENTIFIER = /^[\p{L}_$][\p{L}\p{N}_$]*/u;
const NUMBER = /^(?:\d+\.\d+|\d+)/;

export function tokenizeLine(line: string, language: ProgrammingLanguage): SyntaxToken[] {
  const tokens: SyntaxToken[] = [];
  const append = (value: string, kind: SyntaxToken['kind']) => {
    if (!value) return;
    const previous = tokens[tokens.length - 1];
    if (previous?.kind === kind) {
      previous.value += value;
    } else {
      tokens.push({ value, kind });
    }
  };
  let index = 0;

  while (index < line.length) {
    const rest = line.slice(index);

    if ((language !== 'python' && rest.startsWith('//')) || (language === 'python' && rest.startsWith('#'))) {
      append(rest, 'comment');
      break;
    }

    const char = line[index];
    if (char === '"' || char === "'") {
      let end = index + 1;
      while (end < line.length) {
        if (line[end] === '\\') {
          end += 2;
          continue;
        }
        if (line[end] === char) {
          end += 1;
          break;
        }
        end += 1;
      }
      append(line.slice(index, end), 'string');
      index = end;
      continue;
    }

    const number = rest.match(NUMBER)?.[0];
    if (number) {
      append(number, 'number');
      index += number.length;
      continue;
    }

    const identifier = rest.match(IDENTIFIER)?.[0];
    if (identifier) {
      append(identifier, KEYWORDS[language].has(identifier) ? 'keyword' : 'plain');
      index += identifier.length;
      continue;
    }

    append(char, 'plain');
    index += 1;
  }

  return tokens;
}
