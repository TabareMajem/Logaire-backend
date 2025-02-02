import { CarrierConfig } from './types';
import { MaerskAdapter } from '../providers/maersk/adapter';
import { MscAdapter } from '../providers/msc/adapter';
import { CmaCgmAdapter } from '../providers/cma-cgm/adapter';
import { FreightosAdapter } from '../providers/freightos/adapter';
import { CarrierError } from './errors';

const carrierMap = {
  'maersk': MaerskAdapter,
  'msc': MscAdapter,
  'cma-cgm': CmaCgmAdapter,
  'freightos': FreightosAdapter,
} as const;

export class CarrierFactory {
  static createCarrier(config: CarrierConfig) {
    const CarrierClass = carrierMap[config.id.toLowerCase() as keyof typeof carrierMap];
    
    if (!CarrierClass) {
      throw new CarrierError(
        `Unsupported carrier: ${config.id}`,
        'INVALID_CARRIER',
        config.id
      );
    }

    return new CarrierClass(config);
  }

  static getSupportedCarriers(): string[] {
    return Object.keys(carrierMap);
  }
}