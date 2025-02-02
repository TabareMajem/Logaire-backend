import { mockData } from './data';

export class MockAPIService {
  static async getShipments() {
    await new Promise(resolve => setTimeout(resolve, 500));
    return mockData.shipments;
  }

  static async getActivities() {
    await new Promise(resolve => setTimeout(resolve, 500));
    return mockData.activities;
  }

  static async getMetrics() {
    await new Promise(resolve => setTimeout(resolve, 500));
    return mockData.metrics;
  }
}