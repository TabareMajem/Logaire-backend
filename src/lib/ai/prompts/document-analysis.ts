// src/lib/ai/propmts/document-analysis.txt -->

export const documentAnalysis = `
Analyze the following shipping document and extract key information:
- Document type and purpose
- Key entities (dates, locations, amounts)
- Important clauses or conditions
- Potential issues or warnings
- Required next actions

Document Type: {{type}}
Content:
{{content}}

Provide a structured analysis including:
1. Document classification
2. Entity extraction
3. Summary of key points
4. Risk assessment
5. Recommended actions
`;
