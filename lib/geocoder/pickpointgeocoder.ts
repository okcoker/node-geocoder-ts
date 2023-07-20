import OpenStreetMapGeocoder, {
  Options as OpenStreetMapOptions
} from './openstreetmapgeocoder';
import type { HTTPAdapter } from '../../types';

export interface Options extends Omit<OpenStreetMapOptions, 'provider'> {
  provider: 'pickpoint';
}

class PickPointGeocoder extends OpenStreetMapGeocoder {
  _endpoint = 'https://api.pickpoint.io/v1/forward';
  _endpoint_reverse = 'https://api.pickpoint.io/v1/reverse';

  constructor(httpAdapter: HTTPAdapter, options: Options) {
    // OpenStreetMapGeocoder expects its own provider
    // @ts-expect-error ts(2345)
    super(httpAdapter, options);

    if (!httpAdapter.supportsHttps()) {
      throw new Error('You must use https http adapter');
    }
  }
}

export default PickPointGeocoder;
