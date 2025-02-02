// src/lib/ai/propmts/disruption-recovery.txt -->

export const disruptionRecovery = `
Analyze the following disruption and generate a recovery plan:

Shipment Details:
{{shipment}}

Disruption:
{{disruption}}

Impact Assessment:
{{impact}}

Available Alternatives:
{{alternatives}}

Consider:
1. Severity and duration of disruption
2. Available alternative routes and schedules
3. Cost implications
4. Stakeholder requirements
5. Service level agreements
6. Ripple effects on connected shipments

Provide:
1. Recommended recovery actions with priorities
2. Alternative route or schedule if needed
3. Cost impact analysis
4. Stakeholder communication plan
5. Risk mitigation measures
`;