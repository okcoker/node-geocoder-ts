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
    const overrideOptions: Options = {
      ...options,
      // @ts-expect-error @todo make a mapOptionsToParams method in the
      // base class so each adapter can map their options to params
      key: options.apiKey,
      apiKey: undefined,
      provider: 'pickpoint'
    };
    super(httpAdapter, overrideOptions);

    if (!httpAdapter.supportsHttps()) {
      throw new Error('You must use https http adapter');
    }

    if (!options.apiKey) {
      throw new Error(this.constructor.name + ' needs an apiKey');
    }
  }
}

export default PickPointGeocoder;
