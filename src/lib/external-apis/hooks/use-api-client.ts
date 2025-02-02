done done

"use client";

import { useMemo } from 'react';
import { CarrierAPIClient, PortAPIClient, WeatherAPIClient } from '../clients';
import { API_CONFIG } from '../config';

export function useCarrierAPI(config = API_CONFIG) {
  return useMemo(() => new CarrierAPIClient(config), []);
}

export function usePortAPI(config = API_CONFIG) {
  return useMemo(() => new PortAPIClient(config), []);
}

export function useWeatherAPI(config = API_CONFIG) {
  return useMemo(() => new WeatherAPIClient(config), []);
}