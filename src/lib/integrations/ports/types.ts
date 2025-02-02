export interface Location {
  code: string;
  name: string;
  type: 'port' | 'terminal' | 'depot';
  coordinates?: [number, number];
}

export interface PortStatus {
  portId: string;
  congestionLevel: number; // 0-1
  operationalStatus: 'operational' | 'limited' | 'closed';
  weatherConditions?: {
    condition: string;
    temperature: number;
    windSpeed: number;
    visibility: number;
  };
  lastUpdated: Date;
}

export interface TerminalSchedule {
  terminalId: string;
  workingHours: {
    start: string; // HH:mm format
    end: string;
    timezone: string;
  };
  slots: Array<{
    startTime: Date;
    endTime: Date;
    available: boolean;
    type: 'pickup' | 'delivery';
  }>;
  restrictions?: string[];
}

export interface Appointment {
  id: string;
  type: 'pickup' | 'delivery';
  terminalId: string;
  containerNumber?: string;
  startTime: Date;
  endTime: Date;
  status: 'confirmed' | 'pending' | 'cancelled';
  reference: string;
  instructions?: string;
}

export interface PickupRequest {
  terminalId: string;
  containerNumber: string;
  preferredDate: Date;
  timeSlot?: {
    start: string;
    end: string;
  };
  trucking: {
    company: string;
    driver?: string;
    vehicle?: string;
  };
  reference?: string;
}

export interface DeliveryRequest extends Omit<PickupRequest, 'containerNumber'> {
  bookingNumber: string;
}

export interface CongestionUpdate {
  portId: string;
  level: number;
  timestamp: Date;
  details?: {
    gateQueue?: number;
    yardDensity?: number;
    vesselOperations?: number;
  };
}

export interface VesselMovement {
  vesselId: string;
  vesselName: string;
  type: 'arrival' | 'departure';
  terminal: string;
  scheduledTime: Date;
  actualTime?: Date;
  status: 'scheduled' | 'completed' | 'delayed';
}
