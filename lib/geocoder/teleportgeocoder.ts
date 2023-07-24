import BaseAbstractGeocoderAdapter from './abstractgeocoder';
import type {
  HTTPAdapter,
  ResultCallback,
  BaseAdapterOptions,
  ReverseQuery,
  GeocodeQuery,
  ResultData
} from '../../types';

export interface Options extends BaseAdapterOptions {
  provider: 'teleport';
}

class TeleportGeocoder extends BaseAbstractGeocoderAdapter<Options> {
  _cities_endpoint: string;
  _locations_endpoint: string;

  constructor(
    httpAdapter: HTTPAdapter,
    options: Omit<Options, 'provider'> = {}
  ) {
    super(httpAdapter, { ...options, provider: 'teleport' });

    const base = 'https://api.teleport.org/api';
    this._cities_endpoint = base + '/cities/';
    this._locations_endpoint = base + '/locations/';
  }

  override _geocode(value: GeocodeQuery, callback: ResultCallback) {
    const params: Record<string, any> = {};
    params.search = value;
    params.embed =
      'city:search-results/city:item/{city:country,city:admin1_division,city:urban_area}';

    this.httpAdapter.get(
      this._cities_endpoint,
      params,
      (err: any, result: any) => {
        if (err || !result) {
          return callback(err, null);
        }
        let results: ResultData[] = [];


        const searchResults =
          getEmbeddedPath(result, 'city:search-results') || [];
        results = searchResults.map((data: any, index: number) => {
          const confidence = ((25 - index) / 25.0) * 10;
          return this._formatResult(
            data,
            'city:item',
            confidence
          );
        });

        callback(null, {
          data: results,
          raw: result
        });
      });
  }

  _formatResult(
    result: any,
    cityRelationName: string,
    confidence: number
  ): ResultData {
    const city = getEmbeddedPath(result, cityRelationName);
    const admin1 = getEmbeddedPath(city, 'city:admin1_division') || {};
    const country = getEmbeddedPath(city, 'city:country') || {};
    const urban_area = getEmbeddedPath(city, 'city:urban_area') || {};
    const urban_area_links = urban_area._links || {};
    const extra: Record<string, any> = {
      confidence: confidence,
      urban_area: urban_area.name,
      urban_area_api_url: (urban_area_links.self || {}).href,
      urban_area_web_url: urban_area.teleport_city_url
    };
    if (result.distance_km) {
      extra.distance_km = result.distance_km;
    }
    if (result.matching_full_name) {
      extra.matching_full_name = result.matching_full_name;
    }

    return {
      latitude: city.location.latlon.latitude,
      longitude: city.location.latlon.longitude,
      city: city.name,
      country: country.name,
      countryCode: country.iso_alpha2,
      state: admin1.name,
      stateCode: admin1.geonames_admin1_code,
      extra: extra
    };
  }

  override _reverse(query: ReverseQuery, callback: ResultCallback) {
    const lat = query.lat;
    const lng = query.lon;
    const suffix = lat + ',' + lng;

    const params: Record<string, string> = {};
    params.embed =
      'location:nearest-cities/location:nearest-city/{city:country,city:admin1_division,city:urban_area}';

    this.httpAdapter.get(
      this._locations_endpoint + suffix,
      params,
      (err: any, result: any) => {
        if (err || !result) {
          throw err;
        }
        const results: ResultData[] = [];
        const searchResults =
          getEmbeddedPath(result, 'location:nearest-cities') || [];

        searchResults.forEach((data: any) => {
          const confidence =
            (Math.max(0, 25 - data.distance_km) / 25) * 10;
          results.push(
            this._formatResult(
              data,
              'location:nearest-city',
              confidence
            )
          );
        });

        callback(null, {
          raw: result,
          data: results
        });
      });
  }
}

function getEmbeddedPath(parent: any, path: string) {
  const elements = path.split('/');
  for (const element of elements) {
    const embedded = parent._embedded;
    if (!embedded) {
      return;
    }

    const child = embedded[element];
    if (!child) {
      return;
    }

    parent = child;
  }

  return parent;
}

export default TeleportGeocoder;
