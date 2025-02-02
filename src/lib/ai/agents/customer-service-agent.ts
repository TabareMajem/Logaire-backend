import { ErrorLogger } from '@/lib/errors/logger';
import { AsyncWebCrawler, CrawlerRunConfig } from 'crawl4ai';
import { EnhancedBaseAgent } from './base/enhanced-base-agent';
import { AgentResult, AgentTask } from './base/types';

interface CustomerServiceResponse {
  response: string;
  confidence: number;
  requiresEscalation: boolean;
  suggestedActions: string[];
  sentiment: {
    customer: string;
    response: string;
  };
  context: {
    understood: boolean;
    missingInfo: string[];
    relevantPolicies: string[];
  };
}

export class CustomerServiceAgent extends EnhancedBaseAgent {
  private readonly crawler: AsyncWebCrawler;
  
  constructor() {
    super();
    this.crawler = new AsyncWebCrawler();
  }

  protected async processTask(
    task: AgentTask,
    model: string,
    prompt: string
  ): Promise<AgentResult> {
    try {
      // Gather relevant knowledge
      const knowledge = await this.gatherKnowledge(task.input.query);
      
      // Generate response using AI
      const response = await this.generateResponse(
        task.input.query,
        knowledge,
        model,
        prompt
      );

      return {
        success: true,
        data: {
          response: response.content,
          confidence: response.confidence,
          sources: knowledge.sources
        },
        confidence: response.confidence
      };
    } catch (error) {
      ErrorLogger.error('Customer service response failed', error as Error);
      throw error;
    }
  }

  private async gatherKnowledge(query: string): Promise<any> {
    // Define relevant knowledge sources
    const sources = [
      'help-center',
      'product-docs',
      'faq',
      'community-forum'
    ];

    const knowledge = await Promise.all(
      sources.map(source => this.crawlKnowledgeSource(source, query))
    );

    return this.aggregateKnowledge(knowledge);
  }

  private async crawlKnowledgeSource(source: string, query: string): Promise<any> {
    const config = new CrawlerRunConfig({
      markdown_generator: {
        content_filter: {
          user_query: query,
          threshold: 0.7
        }
      }
    });

    const result = await this.crawler.arun(
      `https://our-domain.com/${source}`,
      config
    );

    return {
      content: result.fit_markdown,
      source: source,
      relevance: result.relevance_score
    };
  }

  private async generateResponse(
    query: string,
    knowledge: any,
    model: string,
    basePrompt: string
  ): Promise<any> {
    const enhancedPrompt = `
      ${basePrompt}
      
      User Query: ${query}
      
      Relevant Knowledge:
      ${knowledge.relevantContent}
      
      Sources:
      ${knowledge.sources.join('\n')}
      
      Please provide a helpful response using this information.
    `;

    const completion = await this.anthropic.messages.create({
      model,
      messages: [{ role: 'user', content: enhancedPrompt }],
      temperature: 0.7
    });

    return this.parseResponse(completion.content[0].text);
  }

  protected getAgentType(): string {
    return 'customer-service';
  }

  protected getContext(): Record<string, any> {
    return {
      supportLevel: 'tier1',
      maxResponseTime: '2min'
    };
  }
} 