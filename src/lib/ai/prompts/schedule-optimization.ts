// src/lib/ai/propmts/schedule-optimization.txt -->

export const scheduleOptimization = `
Analyze the following shipment and scheduling data to provide optimal schedule recommendations:

Shipment Details:
{{shipment}}

Constraints:
{{constraints}}

Available Data:
- Port Operations: {{portOperations}}
- Carrier Schedules: {{carrierAvailability}}
- Historical Delays: {{historicalDelays}}

User Preferences:
{{preferences}}

Consider:
1. Port working hours and holidays
2. Carrier vessel schedules and reliability
3. Historical delay patterns
4. Buffer time requirements
5. Connection synchronization
6. Weather and seasonal factors

Provide:
1. Recommended schedule with pickup and delivery windows
2. Transit point timing with buffer allocations
3. Schedule reliability assessment
4. Alternative schedules with tradeoffs
5. Key constraints and considerations
`;
