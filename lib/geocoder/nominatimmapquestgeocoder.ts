import OpenStreetMapGeocoder, {
  Options as OpenStreetMapOptions
} from './openstreetmapgeocoder';
import type { HTTPAdapter } from '../../types';

export interface Options extends Omit<OpenStreetMapOptions, 'provider'> {
  provider: 'nominatimmapquest';
  apiKey: string;
}

class NominatimMapquestGeocoder extends OpenStreetMapGeocoder {
  _endpoint = 'http://open.mapquestapi.com/nominatim/v1/search';
  _endpoint_reverse = 'http://open.mapquestapi.com/nominatim/v1/reverse';

  constructor(httpAdapter: HTTPAdapter, options: Options) {
    // OpenStreetMapGeocoder expects its own provider
    // @ts-expect-error ts(2345)
    super(httpAdapter, options);

    if (!this.options.apiKey || this.options.apiKey == 'undefined') {
      throw new Error(this.constructor.name + ' needs an apiKey');
    }
  }
}

export default NominatimMapquestGeocoder;
