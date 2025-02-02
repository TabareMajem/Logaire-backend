// src/lib/ai/propmts/rate-prediction.txt --> 

export const ratePrediction = `
Analyze historical rate data and market factors to predict rate trends for:

Route: {{route}}
Timeframe: {{timeframe}} days

Historical Data:
{{historicalRates}}

Market Factors:
{{marketFactors}}

Consider:
1. Seasonal patterns
2. Fuel price trends
3. Capacity utilization
4. Market events and disruptions
5. Economic indicators

Provide:
1. Rate trend prediction
2. Confidence level
3. Contributing factors
4. Risk assessment
5. Recommended actions
`;