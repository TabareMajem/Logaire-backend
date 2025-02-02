import { create } from 'zustand';
import { mockData } from './data';

interface DemoStore {
  shipments: typeof mockData.shipments;
  activities: typeof mockData.activities;
  metrics: typeof mockData.metrics;
  isAuthenticated: boolean;
  setAuthenticated: (value: boolean) => void;
}

export const useDemoStore = create<DemoStore>((set) => ({
  shipments: mockData.shipments,
  activities: mockData.activities,
  metrics: mockData.metrics,
  isAuthenticated: false,
  setAuthenticated: (value) => set({ isAuthenticated: value })
}));