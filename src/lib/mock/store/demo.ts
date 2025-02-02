done done

"use client";

import { create } from 'zustand';
import { mockShipments, mockActivities, mockMetrics } from '../data';

interface DemoState {
  isAuthenticated: boolean;
  shipments: typeof mockShipments;
  activities: typeof mockActivities;
  metrics: typeof mockMetrics;
  setAuthenticated: (value: boolean) => void;
}

export const useDemoStore = create<DemoState>((set) => ({
  isAuthenticated: false,
  shipments: mockShipments,
  activities: mockActivities,
  metrics: mockMetrics,
  setAuthenticated: (value) => set({ isAuthenticated: value })
}));