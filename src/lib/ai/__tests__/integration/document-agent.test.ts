import { AgentTask } from '../../agents/base/types';
import { DocumentAgent } from '../../agents/document-agent';

describe('DocumentAgent Integration', () => {
  let agent: DocumentAgent;

  beforeEach(async () => {
    agent = new DocumentAgent();
    // Set up test data
    await setupTestData();
  });

  afterEach(async () => {
    // Clean up test data
    await cleanupTestData();
  });

  it('should analyze document successfully', async () => {
    const task: AgentTask = {
      type: 'analyze',
      complexity: 'medium',
      priority: 'normal',
      input: {
        documentContent: 'Test Bill of Lading...',
        documentType: 'bill_of_lading'
      }
    };

    const result = await agent.execute(task);

    expect(result.success).toBe(true);
    expect(result.confidence).toBeGreaterThan(0.8);
    expect(result.data).toHaveProperty('documentType');
    expect(result.data).toHaveProperty('extractedData');
  });

  it('should handle validation failures appropriately', async () => {
    const task: AgentTask = {
      type: 'validate',
      complexity: 'medium',
      priority: 'high',
      input: {
        documentContent: 'Invalid content...'
      }
    };

    const result = await agent.execute(task);

    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
    expect(result.data?.validationResults?.isValid).toBe(false);
  });
}); 