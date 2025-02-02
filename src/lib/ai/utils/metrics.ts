// src/lib/ai/utils/metrics.ts -->

export interface PerformanceMetrics {
  accuracy: number;
  latency: number;
  resourceUsage: number;
}

export function calculateMetrics(
  startTime: number,
  results: any[],
  expectedResults: any[]
): PerformanceMetrics {
  const endTime = Date.now();
  const latency = endTime - startTime;

  const accuracy = results.reduce((acc, result, index) => {
    return acc + (isEquivalent(result, expectedResults[index]) ? 1 : 0);
  }, 0) / results.length;

  const resourceUsage = process.memoryUsage().heapUsed / 1024 / 1024; // MB

  return {
    accuracy,
    latency,
    resourceUsage
  };
}

function isEquivalent(a: any, b: any): boolean {
  if (a === b) return true;
  
  if (typeof a !== typeof b) return false;
  
  if (Array.isArray(a) && Array.isArray(b)) {
    return a.length === b.length && 
           a.every((item, index) => isEquivalent(item, b[index]));
  }
  
  if (typeof a === 'object') {
    const keys1 = Object.keys(a);
    const keys2 = Object.keys(b);
    
    return keys1.length === keys2.length &&
           keys1.every(key => isEquivalent(a[key], b[key]));
  }
  
  return false;
}