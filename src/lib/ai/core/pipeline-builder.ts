import { ProcessingPipeline, ProcessingRule } from './types';
import { ErrorLogger } from '@/lib/errors/logger';

export class PipelineBuilder {
  private rules: ProcessingRule[] = [];
  private fallbackFn?: (error: Error) => Promise<any>;
  private name: string;

  constructor(name: string) {
    this.name = name;
  }

  addRule(rule: ProcessingRule): PipelineBuilder {
    this.rules.push(rule);
    return this;
  }

  setFallback(fn: (error: Error) => Promise<any>): PipelineBuilder {
    this.fallbackFn = fn;
    return this;
  }

  build(): ProcessingPipeline {
    if (this.rules.length === 0) {
      throw new Error('Pipeline must have at least one rule');
    }

    return {
      name: this.name,
      rules: this.rules,
      fallback: this.fallbackFn
    };
  }
}