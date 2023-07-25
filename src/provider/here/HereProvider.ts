import BaseAbstractProviderAdapter from '../BaseAbstractProviderAdapter';
import type {
  HTTPAdapter,
  BatchResult,
  ReverseQuery,
  GeocodeQuery,
  Result
} from 'src/types';
import HereProviderV6, {
  Options as OptionsV6
} from './versions/HereProviderV6';
import HereProviderV7, {
  Options as OptionsV7
} from './versions/HereProviderV7';

type ApiVersion = '6' | '7';

export type Options = OptionsV6 &
  OptionsV7 & {
    provider: 'here';
    /**
     * If apiKey is not specified, this assumes you're using the `appId` & `appCode` combo
     */
    apiKey?: string;

    /**
     * Version of the HERE API to use. Defaults to 7
     */
    version?: ApiVersion;
  };

class HereProvider extends BaseAbstractProviderAdapter<Options> {
  get providerVersion(): BaseAbstractProviderAdapter<Options> {
    if (this.options.version === '6') {
      return new HereProviderV6(this.httpAdapter, this.options as OptionsV6);
    }

    return new HereProviderV7(this.httpAdapter, this.options as OptionsV7);
  }

  constructor(
    httpAdapter: HTTPAdapter,
    options: Omit<Options, 'provider'> = {}
  ) {
    super(httpAdapter, { ...options, provider: 'here' } as Options);

    if (!options.apiKey && !(options.appId && options.appCode)) {
      throw new Error('You must specify apiKey to use Here Geocoder');
    }
  }

  override async _geocode(
    query: GeocodeQuery & {
      address?: string;
      language?: string;
      politicalView?: string;
      country?: string;
      state?: string;
      zipcode?: string;
    }
  ): Promise<Result> {
    return this.providerVersion.geocode(query);
  }

  override async _reverse(query: ReverseQuery): Promise<Result> {
    return this.providerVersion.reverse(query);
  }

  override async _batchGeocode(queries: GeocodeQuery[]): Promise<BatchResult> {
    return this.providerVersion.batchGeocode(queries);
  }
}

export default HereProvider;
