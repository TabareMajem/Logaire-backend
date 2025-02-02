// src/lib/ai/propmts/route-alternative.txt --> 

export const routeAlternative = `
Given the current route and issue, suggest alternative routes that:
- Avoid or mitigate the reported issue
- Maintain efficiency and cost-effectiveness
- Consider current market conditions
- Align with user preferences

Current Route:
{{currentRoute}}

Reported Issue:
{{issue}}

Market Conditions:
{{marketConditions}}

Provide multiple alternative routes with:
1. Detailed waypoints and timings
2. Cost implications
3. Risk assessment
4. Pros and cons comparison
`;
