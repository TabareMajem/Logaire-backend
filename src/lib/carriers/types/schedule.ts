export interface ScheduleRequest {
  origin: Location;
  destination: Location;
  dateRange: {
    from: Date;
    to: Date;
  };
  equipmentType?: string;
  directOnly?: boolean;
}

export interface Schedule {
  service: string;
  route: {
    origin: Location;
    destination: Location;
    transshipments?: Location[];
  };
  vessel: {
    name: string;
    voyage: string;
  };
  dates: {
    departure: Date;
    arrival: Date;
    cutoff?: {
      documentation: Date;
      vgm: Date;
      cargo: Date;
    };
  };
  space: {
    available: boolean;
    status: 'open' | 'limited' | 'full';
  };
  transitTime: number;
  reliability?: number;
}