import { WorkflowDefinition } from '../types';

export const WORKFLOW_TEMPLATES = {
  DOCUMENT_PROCESSING: 'document_processing',
  RATE_NEGOTIATION: 'rate_negotiation',
  ROUTE_OPTIMIZATION: 'route_optimization',
  MULTI_AGENT_COLLABORATION: 'multi_agent_collaboration'
} as const;

export type WorkflowTemplateType = typeof WORKFLOW_TEMPLATES[keyof typeof WORKFLOW_TEMPLATES];

export interface WorkflowTemplateConfig {
  documentTypes?: string[];
  rateParameters?: {
    minAcceptableRate: number;
    maxAcceptableRate: number;
    targetMargin: number;
  };
  routeParameters?: {
    maxTransitTime: number;
    maxTransshipments: number;
    prioritizeCost: number;
    prioritizeTime: number;
  };
  collaborationConfig?: {
    maxParallelAgents: number;
    timeoutSeconds: number;
  };
}

export const workflowTemplates: Record<WorkflowTemplateType, (config: WorkflowTemplateConfig) => WorkflowDefinition> = {
  [WORKFLOW_TEMPLATES.DOCUMENT_PROCESSING]: (config) => ({
    name: 'Document Processing Workflow',
    description: 'Process and analyze shipping documents with OCR and AI',
    steps: [
      {
        id: 'document_validation',
        agentType: 'document',
        dependencies: [],
        config: {
          supportedTypes: config.documentTypes || ['bill_of_lading', 'invoice', 'packing_list'],
          validationRules: {
            requireAllPages: true,
            qualityThreshold: 0.8
          }
        }
      },
      {
        id: 'data_extraction',
        agentType: 'document',
        dependencies: ['document_validation'],
        config: {
          extractionMode: 'detailed',
          confidence: 0.9
        }
      },
      {
        id: 'data_verification',
        agentType: 'verification',
        dependencies: ['data_extraction'],
        config: {
          verificationRules: ['completeness', 'consistency', 'format']
        }
      }
    ],
    errorHandling: {
      continueOnFailure: false,
      fallbackSteps: {
        document_validation: 'manual_validation',
        data_extraction: 'manual_extraction'
      }
    }
  }),

  [WORKFLOW_TEMPLATES.RATE_NEGOTIATION]: (config) => ({
    name: 'Rate Negotiation Workflow',
    description: 'Automated rate negotiation with multiple carriers',
    steps: [
      {
        id: 'market_analysis',
        agentType: 'market_data',
        dependencies: [],
        config: {
          dataPoints: ['historical_rates', 'market_trends', 'capacity_index']
        }
      },
      {
        id: 'rate_negotiation',
        agentType: 'rate',
        dependencies: ['market_analysis'],
        config: {
          negotiation: {
            minAcceptableRate: config.rateParameters?.minAcceptableRate || 0,
            maxAcceptableRate: config.rateParameters?.maxAcceptableRate || 0,
            targetMargin: config.rateParameters?.targetMargin || 0.1
          }
        }
      },
      {
        id: 'contract_generation',
        agentType: 'document',
        dependencies: ['rate_negotiation'],
        config: {
          templateType: 'rate_agreement',
          includeTerms: true
        }
      }
    ]
  }),

  [WORKFLOW_TEMPLATES.ROUTE_OPTIMIZATION]: (config) => ({
    name: 'Route Optimization Workflow',
    description: 'Optimize shipping routes considering multiple factors',
    steps: [
      {
        id: 'data_collection',
        agentType: 'data',
        dependencies: [],
        config: {
          dataSources: ['ports', 'vessels', 'schedules', 'weather']
        }
      },
      {
        id: 'route_analysis',
        agentType: 'route',
        dependencies: ['data_collection'],
        config: {
          optimization: {
            maxTransitTime: config.routeParameters?.maxTransitTime || 30,
            maxTransshipments: config.routeParameters?.maxTransshipments || 2,
            prioritizeCost: config.routeParameters?.prioritizeCost || 0.5,
            prioritizeTime: config.routeParameters?.prioritizeTime || 0.5
          }
        }
      },
      {
        id: 'schedule_optimization',
        agentType: 'schedule',
        dependencies: ['route_analysis'],
        config: {
          considerFactors: ['port_congestion', 'weather_delays', 'vessel_reliability']
        }
      }
    ]
  }),

  [WORKFLOW_TEMPLATES.MULTI_AGENT_COLLABORATION]: (config) => ({
    name: 'Multi-Agent Collaboration Workflow',
    description: 'Coordinate multiple agents for complex tasks',
    steps: [
      {
        id: 'task_distribution',
        agentType: 'orchestrator',
        dependencies: [],
        config: {
          maxParallelAgents: config.collaborationConfig?.maxParallelAgents || 3,
          timeoutSeconds: config.collaborationConfig?.timeoutSeconds || 300
        }
      },
      {
        id: 'parallel_processing',
        agentType: 'parallel',
        dependencies: ['task_distribution'],
        config: {
          agents: ['document', 'rate', 'route'],
          synchronization: 'barrier'
        }
      },
      {
        id: 'result_aggregation',
        agentType: 'aggregator',
        dependencies: ['parallel_processing'],
        config: {
          aggregationStrategy: 'weighted_average',
          conflictResolution: 'majority_vote'
        }
      }
    ],
    errorHandling: {
      continueOnFailure: true,
      fallbackSteps: {
        parallel_processing: 'sequential_processing'
      }
    }
  })
}; 