import type { AlgorithmStep, ProgrammingLanguage } from '../../types';

export function getVariableAnnotation(
  line: string,
  variables: AlgorithmStep['variables'] | undefined,
  language: ProgrammingLanguage,
): string | null {
  if (!variables || variables.i < 0) return null;

  const trimmedLine = line.trim();
  const commentPrefix = language === 'python' ? '# ' : '// ';

  if (trimmedLine.includes('k = 0') || trimmedLine.includes('k := 0')) {
    return `${commentPrefix}k = ${variables.k}`;
  }

  if (trimmedLine.includes('for') && trimmedLine.includes('i')) {
    return `${commentPrefix}i = ${variables.i}`;
  }

  if (trimmedLine.includes('i > k')) {
    return `${commentPrefix}${variables.i} > ${variables.k} = ${variables.i > variables.k}`;
  }

  if (trimmedLine.includes('max(k') || trimmedLine.includes('Math.max(k')) {
    return `${commentPrefix}max(${variables.k}, ${variables['i + nums[i]']}) = ${Math.max(variables.k, variables['i + nums[i]'])}`;
  }

  return null;
}
