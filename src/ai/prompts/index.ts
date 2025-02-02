export const DOCUMENT_ANALYSIS_PROMPT = `
Analyze the following shipping document and extract key information:
- Document type
- Shipment reference
- Parties involved
- Cargo details
- Dates and deadlines
- Special instructions

Document content:
{{content}}
`;

export const ROUTE_OPTIMIZATION_PROMPT = `
Optimize the route for the following shipment considering:
- Distance and duration
- Cost efficiency
- Environmental impact
- Carrier preferences
- Service requirements

Shipment details:
{{details}}
`;

export const RATE_ESTIMATION_PROMPT = `
Estimate shipping rates based on:
- Origin and destination
- Cargo specifications
- Service level requirements
- Market conditions
- Carrier availability

Request parameters:
{{parameters}}
`;