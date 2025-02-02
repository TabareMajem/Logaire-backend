interface ResponseTemplate {
  pattern: string;
  variations: string[];
}

export class ResponseGenerator {
  private templates: Record<string, ResponseTemplate> = {
    success: {
      pattern: '{message}',
      variations: [
        'Here you go: {message}',
        'I found that for you: {message}',
        'Here\'s what I found: {message}'
      ]
    },
    error: {
      pattern: '{message}',
      variations: [
        'Sorry, {message}',
        'I apologize, but {message}',
        'I encountered an issue: {message}'
      ]
    },
    notFound: {
      pattern: '{item} not found',
      variations: [
        'I couldn\'t find {item}',
        'No {item} was found',
        '{item} doesn\'t seem to exist'
      ]
    }
  };

  generateResponse(type: keyof typeof this.templates, params: Record<string, string>): string {
    const template = this.templates[type];
    const variation = template.variations[Math.floor(Math.random() * template.variations.length)];
    
    return variation.replace(/{(\w+)}/g, (_, key) => params[key] || '');
  }
}