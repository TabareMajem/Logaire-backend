// src/lib/ai/propmts/rate-optimization.txt -->

export const rateOptimization = `
Analyze the following shipment details and constraints to provide optimal rate recommendations:

Shipment Details:
{{shipmentDetails}}

Constraints:
{{constraints}}

Market Data:
- Current Rates: {{marketRates}}
- Carrier Performance: {{carrierPerformance}}

User Preferences:
{{preferences}}

Consider:
1. Current market rates and trends
2. Carrier performance and reliability
3. Service level requirements
4. Special handling needs
5. User preferences and constraints

Provide:
1. Primary rate recommendation with detailed reasoning
2. Market trend analysis
3. Alternative options with tradeoffs
4. Risk factors and mitigation strategies
`;
