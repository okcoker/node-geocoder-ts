import BaseAbstractGeocoderAdapter from './abstractgeocoder';
import type {
  HTTPAdapter,
  ResultCallback,
  BaseAdapterOptions,
  Location,
  GeocodeValue,
  ResultData,
  Nullable
} from 'types';

export interface Options extends BaseAdapterOptions {
  provider: 'openstreetmap';
  language?: string;
  email?: string;
  apiKey?: string;
  osmServer?: string;
  zoom?: number;
}

type OSMSearchResult = {
  /**
   example: {
    "place_id": 6448281,
  "place_id": 6448281,
  "licence": "Data © OpenStreetMap contributors, ODbL 1.0. https://osm.org/copyright",
  "osm_type": "node",
  "osm_id": 821375156,
  "boundingbox": [
    "45.5209835",
    "45.5210835",
    "-73.6107149",
    "-73.6106149"
  ],
  "lat": "45.5210335",
  "lon": "-73.6106649",
  "display_name": "Galanga Bistro Thaï, 1231, Avenue Lajoie, Outremont, Montréal, Agglomération de Montréal, Montréal (région administrative), Québec, H2V 1P2, Canada",
  "class": "amenity",
  "type": "restaurant",
  "importance": 0.31001,
  "icon": "https://nominatim.openstreetmap.org/ui/mapicons/food_restaurant.p.20.png",
  "address": {
    "amenity": "Galanga Bistro Thaï",
    "house_number": "1231",
    "road": "Avenue Lajoie",
    "suburb": "Outremont",
    "city": "Montréal",
    "county": "Agglomération de Montréal",
    "region": "Montréal (région administrative)",
    "state": "Québec",
    "ISO3166-2-lvl4": "CA-QC",
    "postcode": "H2V 1P2",
    "country": "Canada",
    "country_code": "ca"
  }
  */

  'place_id': number;
  'licence': string;
  'osm_type': string;
  'osm_id': number;
  'boundingbox': [
    south: `${number}`, north: `${number}`, west: `${number}`, east: `${number}`
  ];
  'lat': `${number}`;
  'lon': `${number}`;
  'display_name': string;
  'class': string;
  'type': string;
  'importance': number;
  'icon': string;
  'address': {
    'amenity': string;
    'house_number': string;
    'road': string;
    'suburb': string;
    'city': string;
    'county': string;
    'region': string;
    'state': string;
    'ISO3166-2-lvl4': string;
    'postcode': string;
    'country': string;
    'country_code': string;
  }
}

class OpenStreetMapGeocoder extends BaseAbstractGeocoderAdapter<Options> {
  _endpoint: string;
  _endpoint_reverse: string;

  constructor(
    httpAdapter: HTTPAdapter,
    options: Omit<Options, 'provider'> = {}
  ) {
    super(httpAdapter, { ...options, provider: 'openstreetmap' });

    const osmServer = options.osmServer || 'http://nominatim.openstreetmap.org';
    this._endpoint = osmServer + '/search';
    this._endpoint_reverse = osmServer + '/reverse';
  }

  override _geocode(value: GeocodeValue, callback: ResultCallback) {
    let params = this._getCommonParams();
    params.addressdetails = 1;
    if (typeof value == 'string') {
      params.q = value;
    } else {
      const obj = value as Record<string, any>;
      for (const k in obj) {
        const v = obj[k];
        params[k] = v;
      }
    }

    params = this._forceParams(params);

    this.httpAdapter.get<OSMSearchResult[]>(this._endpoint, params, (err: any, result: Nullable<OSMSearchResult[]>) => {
      if (err || !result) {
        return callback(err, null);
      }
      // Do we need this check??
      if ((result as any).error) {
        return callback(new Error((result as any).error), null);
      }
      let results: ResultData[] = [];

      if (result instanceof Array) {
        results = result.map((data: any) => {
          return this._formatResult(data);
        });
      } else {
        results = [this._formatResult(result)];
      }

      callback(null, {
        raw: result,
        data: results
      });
    });
  }

  _formatResult(result: any): ResultData {
    let countryCode = result.address.country_code;
    if (countryCode) {
      countryCode = countryCode.toUpperCase();
    }

    let latitude = result.lat;
    if (latitude) {
      latitude = parseFloat(latitude);
    }

    let longitude = result.lon;
    if (longitude) {
      longitude = parseFloat(longitude);
    }

    return {
      latitude: latitude,
      longitude: longitude,
      formattedAddress: result.display_name,
      country: result.address.country,
      city:
        result.address.city ||
        result.address.town ||
        result.address.village ||
        result.address.hamlet,
      state: result.address.state,
      zipcode: result.address.postcode,
      streetName: result.address.road || result.address.cycleway,
      streetNumber: result.address.house_number,
      countryCode: countryCode,
      // Does this even exist for osm?
      // https://nominatim.org/release-docs/latest/api/Reverse/
      neighborhood: result.address.neighborhood
    };
  }

  override _reverse(
    query: Location & {
      format?: 'xml' | 'json';
      addressdetails?: number;
      zoom?: number;
    },
    callback: ResultCallback
  ) {
    let params = this._getCommonParams();
    const record = query as Record<string, any>;

    for (const k in query) {
      const v = record[k];
      params[k] = v;
    }
    params = this._forceParams(params);

    this.httpAdapter.get(
      this._endpoint_reverse,
      params,
      (err: any, result: any) => {
        if (err) {
          return callback(err, null);
        } else {
          if (result.error) {
            return callback(new Error(result.error), null);
          }

          let results: ResultData[] = [];
          if (result instanceof Array) {
            results = result.map((data: any) => {
              return this._formatResult(data);
            });
          } else {
            result = [this._formatResult(result)];
          }

          callback(null, {
            raw: result,
            data: results
          });
        }
      }
    );
  }

  /**
   * Prepare common params
   *
   * @return <Object> common params
   */
  _getCommonParams(): Record<string, any> {
    const params: Record<string, any> = {};
    const options = this.options as Record<string, any>;

    for (let k in options) {
      const v = options[k];
      if (!v) {
        continue;
      }
      if (k === 'language') {
        k = 'accept-language';
      }
      params[k] = v;
    }

    return params;
  }

  _forceParams(params: any): Record<string, any> {
    return {
      ...params,
      format: 'json',
      addressdetails: 1
    };
  }
}

export default OpenStreetMapGeocoder;
