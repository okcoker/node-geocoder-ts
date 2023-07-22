import OpenStreetMapGeocoder, {
  Options as OpenStreetMapOptions
} from './openstreetmapgeocoder';
import type { HTTPAdapter } from '../../types';

export interface Options extends Omit<OpenStreetMapOptions, 'provider'> {
  provider: 'pickpoint';
}

class PickPointGeocoder extends OpenStreetMapGeocoder {
  override _endpoint = 'https://api.pickpoint.io/v1/forward';
  override _endpoint_reverse = 'https://api.pickpoint.io/v1/reverse';

  constructor(
    httpAdapter: HTTPAdapter,
    options: Omit<Options, 'provider'> = {}
  ) {
    const overrideOptions: Options = { ...options, provider: 'pickpoint' };
    super(httpAdapter, overrideOptions);

    if (!httpAdapter.supportsHttps()) {
      throw new Error('You must use https http adapter');
    }
  }
}

export default PickPointGeocoder;
