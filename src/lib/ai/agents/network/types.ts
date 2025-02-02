export interface NetworkNode {
  id: string;
  type: 'port' | 'hub' | 'warehouse';
  location: {
    name: string;
    coordinates: [number, number];
  };
  capacity: number;
  utilization: number;
}

export interface NetworkFlow {
  origin: string;
  destination: string;
  volume: number;
  frequency: string;
  cost: number;
}

export interface NetworkRequest {
  nodes: NetworkNode[];
  flows: NetworkFlow[];
  constraints: {
    maxCost?: number;
    maxTime?: number;
    requiredNodes?: string[];
  };
  objectives: Array<'cost' | 'time' | 'reliability' | 'sustainability'>;
}

export interface NetworkOptimization {
  efficiencyScore: number;
  improvements: Array<{
    type: 'flow' | 'node' | 'connection';
    description: string;
    impact: {
      cost: number;
      time: number;
    };
    priority: 'high' | 'medium' | 'low';
  }>;
  bottlenecks: Array<{
    location: string;
    type: string;
    severity: 'high' | 'medium' | 'low';
    resolution: string;
  }>;
  savings: {
    total: number;
    breakdown: Record<string, number>;
  };
}