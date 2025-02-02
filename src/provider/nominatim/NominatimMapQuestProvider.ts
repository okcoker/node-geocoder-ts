import OpenStreetMapProvider, {
  Options as OpenStreetMapOptions
} from '../openstreetmap/OpenStreetMapProvider';
import type { HTTPAdapter } from 'src/types';

export interface Options extends Omit<OpenStreetMapOptions, 'provider'> {
  provider: 'nominatimmapquest';
  apiKey: string;
}

class NominatimMapQuestProvider extends OpenStreetMapProvider {
  override _endpoint = 'http://open.mapquestapi.com/nominatim/v1/search';
  override _endpoint_reverse =
    'http://open.mapquestapi.com/nominatim/v1/reverse';

  constructor(
    httpAdapter: HTTPAdapter,
    options: Omit<Options, 'provider'> = { apiKey: '' }
  ) {
    const overrideOptions: Options = {
      ...options,
      key: options.apiKey,
      // @ts-expect-error @todo make a mapOptionsToParams method in the
      // base class so each adapter can map their options to params
      apiKey: undefined,
      provider: 'nominatimmapquest'
    };
    super(httpAdapter, overrideOptions);

    if (!options.apiKey) {
      throw new Error(this.constructor.name + ' needs an apiKey');
    }
  }
}

export default NominatimMapQuestProvider;
