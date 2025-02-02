done done

import { mockShipments, mockActivities, mockMetrics } from '../data';

export class MockAPIService {
  static async getShipments() {
    await new Promise(resolve => setTimeout(resolve, 500));
    return mockShipments;
  }

  static async getActivities() {
    await new Promise(resolve => setTimeout(resolve, 500));
    return mockActivities;
  }

  static async getMetrics() {
    await new Promise(resolve => setTimeout(resolve, 500));
    return mockMetrics;
  }
}