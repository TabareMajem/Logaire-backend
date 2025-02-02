// src/lib/ai/propmts/risk-assessment.txt --> 

export const riskAssessment = `
Analyze the following shipment and risk data to provide a comprehensive risk assessment:

Shipment Details:
{{shipment}}

Risk Data:
- Weather Risks: {{weatherRisks}}
- Political Risks: {{politicalRisks}}
- Security Risks: {{securityRisks}}

Context:
{{context}}

Consider:
1. Weather conditions and natural hazards
2. Political stability and regulatory changes
3. Security threats and crime rates
4. Operational risks and bottlenecks
5. Financial and market risks

Provide:
1. Overall risk assessment
2. Detailed risk factors with severity and likelihood
3. Impact analysis for each risk
4. Mitigation strategies and recommendations
5. Contingency plans for high-impact risks
`;