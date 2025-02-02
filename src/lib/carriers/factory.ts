import { CarrierConfig } from './types';
import { BaseCarrier } from './base-carrier';
import { MaerskCarrier } from './providers/maersk/carrier';
import { CmaCgmCarrier } from './providers/cma-cgm/carrier';
import { MscCarrier } from './providers/msc/carrier';

const carrierMap: Record<string, new (config: CarrierConfig) => BaseCarrier> = {
  'maersk': MaerskCarrier,
  'cma-cgm': CmaCgmCarrier,
  'msc': MscCarrier
};

export function createCarrier(config: CarrierConfig): BaseCarrier {
  const CarrierClass = carrierMap[config.code.toLowerCase()];
  
  if (!CarrierClass) {
    throw new Error(`Unsupported carrier: ${config.code}`);
  }

  return new CarrierClass(config);
}