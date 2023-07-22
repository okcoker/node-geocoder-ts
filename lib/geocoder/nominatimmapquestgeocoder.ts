import OpenStreetMapGeocoder, {
  Options as OpenStreetMapOptions
} from './openstreetmapgeocoder';
import type { HTTPAdapter } from '../../types';

export interface Options extends Omit<OpenStreetMapOptions, 'provider'> {
  provider: 'nominatimmapquest';
  apiKey: string;
}

class NominatimMapquestGeocoder extends OpenStreetMapGeocoder {
  override _endpoint = 'http://open.mapquestapi.com/nominatim/v1/search';
  override _endpoint_reverse = 'http://open.mapquestapi.com/nominatim/v1/reverse';

  constructor(
    httpAdapter: HTTPAdapter,
    options: Omit<Options, 'provider'> = { apiKey: '' }
  ) {
    const overrideOptions: Options = {
      ...options,
      provider: 'nominatimmapquest'
    };
    super(httpAdapter, overrideOptions);

    if (!this.options.apiKey) {
      throw new Error(this.constructor.name + ' needs an apiKey');
    }
  }
}

export default NominatimMapquestGeocoder;
