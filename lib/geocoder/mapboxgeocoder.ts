import ResultError from 'lib/error/ResultError';
import BaseAbstractGeocoderAdapter from './abstractgeocoder';
import type {
  HTTPAdapter,
  BaseAdapterOptions,
  ReverseQuery,
  GeocodeQuery,
  Result,
  ResultData
} from 'types';

/**
 * available options
 * @see https://docs.mapbox.com/api/search/geocoding/
 */
export interface Options extends BaseAdapterOptions {
  provider: 'mapbox';
  apiKey?: string;
  language?: string;
  country?: string;
  autocomplete?: string;
  bbox?: string;
  fuzzyMatch?: string;
  limit?: string;
  proximity?: string;
  routing?: string;
}

const OPTIONS_MAP = {
  apiKey: 'access_token'
};

class MapBoxGeocoder extends BaseAbstractGeocoderAdapter<Options> {
  _geocodeEndpoint = 'https://api.mapbox.com/geocoding/v5/mapbox.places';

  constructor(
    httpAdapter: HTTPAdapter,
    options: Omit<Options, 'provider'> = { apiKey: '' }
  ) {
    super(httpAdapter, { ...options, provider: 'mapbox' });

    if (!this.options.apiKey) {
      throw new Error('You must specify apiKey to use MapBox Geocoder');
    }
  }

  override async _geocode(value: GeocodeQuery): Promise<Result> {
    let params = this._prepareQueryString({});
    let searchtext = value;

    if (typeof value !== 'string' && value.address) {
      params = this._prepareQueryString(value);
      searchtext = value.address.toString();
    }

    const endpoint = `${this._geocodeEndpoint}/${encodeURIComponent(
      searchtext as string
    )}.json`;

    const result = await this.httpAdapter.get(endpoint, params);

    if (!result) {
      throw new ResultError(this);
    }
    const view: unknown[] = result.features || [];
    const results = view.map(this._formatResult);

    return {
      raw: result,
      data: results
    };
  }

  override async _reverse(query: ReverseQuery): Promise<Result> {
    const { lat, lon, ...other } = query;

    const params = this._prepareQueryString(other);
    const endpoint = `${this._geocodeEndpoint}/${encodeURIComponent(
      `${lon},${lat}`
    )}.json`;

    const result = await this.httpAdapter.get(endpoint, params);

    if (!result) {
      throw new ResultError(this);
    }

    const view: unknown[] = result.features || [];
    const results = view.map(this._formatResult);

    return {
      raw: result,
      data: results
    };
  }

  private _formatResult(result: any): ResultData {
    const context = (result.context || []).reduce((o: any, item: any) => {
      // possible types: country, region, postcode, district, place, locality, neighborhood, address
      const [type] = item.id.split('.');
      if (type) {
        o[type] = item.text;
        if (type === 'country' && item.short_code) {
          o.countryCode = item.short_code.toUpperCase();
        }
      }
      return o;
    }, {});
    // get main type
    const [type] = result.id.split('.');
    if (type) {
      context[type] = result.text;
    }

    const properties = result.properties || {};

    const extractedObj: ResultData = {
      latitude: result.center[1],
      longitude: result.center[0],
      formattedAddress: result.place_name,
      country: context.country,
      countryCode: context.countryCode,
      state: context.region,
      district: context.district,
      city: context.place,
      zipcode: context.postcode,
      neighborhood: context.neighborhood || context.locality,
      extra: {
        id: result.id,
        address: properties.address || context.address,
        category: properties.category,
        bbox: result.bbox
      }
    };

    return extractedObj;
  }

  _prepareQueryString(params: any): Record<string, any> {
    const newParams: Record<string, string> = {
      ...params
    };
    const options = this.options as Record<string, any>;
    const optionMap = OPTIONS_MAP as Record<string, string>;

    Object.keys(options).forEach(key => {
      const val = options[key];
      if (val) {
        const _key = optionMap[key] || key;
        newParams[_key] = val;
      }
    });

    return newParams;
  }
}

export default MapBoxGeocoder;
