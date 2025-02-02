import { ErrorLogger } from '@/lib/errors/logger';

export class LanguageDetector {
  private readonly languagePatterns: Record<string, RegExp[]> = {
    en: [/^[a-zA-Z\s]+$/],
    es: [/^[a-záéíóúüñ\s]+$/i],
    fr: [/^[a-zàâçéèêëîïôûùüÿñæœ\s]+$/i],
    de: [/^[a-zäöüß\s]+$/i]
  };

  detectLanguage(text: string): string {
    try {
      for (const [lang, patterns] of Object.entries(this.languagePatterns)) {
        if (patterns.some(pattern => pattern.test(text))) {
          return lang;
        }
      }
      return 'en'; // Default to English
    } catch (error) {
      ErrorLogger.error('Language detection failed', error as Error);
      return 'en';
    }
  }

  getConfidence(text: string, language: string): number {
    try {
      const patterns = this.languagePatterns[language];
      if (!patterns) return 0;

      const matches = patterns.filter(pattern => pattern.test(text)).length;
      return matches / patterns.length;
    } catch (error) {
      ErrorLogger.error('Language confidence calculation failed', error as Error);
      return 0;
    }
  }
}