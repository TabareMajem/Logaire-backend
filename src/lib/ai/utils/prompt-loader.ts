import { PROMPTS, PromptTemplate } from '../prompts';
import { ErrorLogger } from '@/lib/errors/logger';

export async function loadPromptTemplate(
  templateName: PromptTemplate
): Promise<string> {
  try {
    return PROMPTS[templateName];
  } catch (error) {
    ErrorLogger.error(`Failed to load prompt template: ${templateName}`, error as Error);
    throw error;
  }
}

export function interpolateVariables(
  template: string,
  variables: Record<string, any>
): string {
  return template.replace(
    /\{\{(\w+)\}\}/g,
    (_, key) => {
      const value = variables[key];
      return value === undefined ? '' : JSON.stringify(value);
    }
  );
}