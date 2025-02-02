// src/lib/ai/propmts/route-optimization.txt -->

export const routeOptimization = `
Given the following route parameters and context, provide an optimized route that considers:
- Distance and duration
- Cost efficiency
- Environmental impact
- Current market conditions
- User preferences

Origin: {{origin}}
Destination: {{destination}}
Waypoints: {{waypoints}}
Constraints: {{constraints}}

Market Conditions:
{{context.marketConditions}}

User Preferences:
{{context.preferences}}

Provide a detailed route optimization with:
1. Step-by-step waypoints
2. Estimated times and distances
3. Cost estimates
4. Environmental impact assessment
`;

