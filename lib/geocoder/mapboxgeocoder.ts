import BaseAbstractGeocoder from './abstractgeocoder';
import type {
  HTTPAdapter,
  ResultCallback,
  BaseOptions,
  Location,
  GeocodeValue
} from '../../types';

/**
 * available options
 * @see https://docs.mapbox.com/api/search/geocoding/
 */
export interface Options extends BaseOptions {
  provider: 'mapbox';
  apiKey: string;
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

class MapBoxGeocoder extends BaseAbstractGeocoder<Options> {
  _geocodeEndpoint = 'https://api.mapbox.com/geocoding/v5/mapbox.places';

  constructor(httpAdapter: HTTPAdapter, options: Omit<Options, 'provider'>) {
    super(httpAdapter, { ...options, provider: 'mapbox' });

    if (!this.options.apiKey) {
      throw new Error('You must specify apiKey to use MapBox Geocoder');
    }
  }

  _geocode(value: GeocodeValue, callback: ResultCallback) {
    let params = this._prepareQueryString({});
    let searchtext = value;

    if (typeof value !== 'string' && value.address) {
      params = this._prepareQueryString(value);
      searchtext = value.address;
    }

    const endpoint = `${this._geocodeEndpoint}/${encodeURIComponent(
      searchtext as string
    )}.json`;

    this.httpAdapter.get(endpoint, params, (err: any, result: any) => {
      if (err) {
        return callback(err, null);
      } else {
        const view = result.features;
        if (!view) {
          return callback(null, {
            raw: result,
            data: []
          });
        }
        const results = view.map(this._formatResult);

        callback(null, {
          raw: result,
          data: results
        });
      }
    });
  }

  _reverse(query: Location, callback: ResultCallback) {
    const { lat, lon, ...other } = query;

    const params = this._prepareQueryString(other);
    const endpoint = `${this._geocodeEndpoint}/${encodeURIComponent(
      `${lon},${lat}`
    )}.json`;

    this.httpAdapter.get(endpoint, params, (err: any, result: any) => {
      if (err) {
        return callback(err, null);
      } else {
        const view = result.features;
        if (!view) {
          return callback(null, {
            raw: result,
            data: []
          });
        }
        const results = view.map(this._formatResult);

        callback(null, {
          raw: result,
          data: results
        });
      }
    });
  }

  _formatResult(result: any) {
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

    const extractedObj = {
      latitude: result.center[1],
      longitude: result.center[0],
      formattedAddress: result.place_name,
      country: context.country,
      countryCode: context.countryCode,
      state: context.region,
      district: context.district,
      city: context.place,
      zipcode: context.postcode,
      neighbourhood: context.neighborhood || context.locality,
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
