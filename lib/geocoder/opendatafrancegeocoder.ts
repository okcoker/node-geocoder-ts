import BaseAbstractGeocoderAdapter from './abstractgeocoder';
import type {
  HTTPAdapter,

  BaseAdapterOptions,
  ReverseQuery,
  GeocodeQuery,
  ResultData,
  Result
} from '../../types';

export interface Options extends BaseAdapterOptions {
  provider: 'opendatafrance';
  language?: string;
  email?: string;
  apiKey?: string;
}

class OpendataFranceGeocoder extends BaseAbstractGeocoderAdapter<Options> {
  _endpoint = 'https://api-adresse.data.gouv.fr/search';
  _endpoint_reverse = 'https://api-adresse.data.gouv.fr/reverse';

  constructor(
    httpAdapter: HTTPAdapter,
    options: Omit<Options, 'provider'> = {}
  ) {
    super(httpAdapter, { ...options, provider: 'opendatafrance' });
  }

  override async _geocode(value: GeocodeQuery): Promise<Result> {
    const params = this._getCommonParams();

    if (typeof value === 'string') {
      params.q = value;
    } else {
      if (value.address) {
        params.q = value.address;
      }
      if (value.lat && value.lon) {
        params.lat = value.lat;
        params.lon = value.lon;
      }
      if (value.zipcode) {
        params.postcode = value.zipcode;
      }
      if (value.type) {
        params.type = value.type;
      }
      if (value.citycode) {
        params.citycode = value.citycode;
      }
      if (value.limit) {
        params.limit = value.limit;
      }
    }

    const result = await this.httpAdapter.get(this._endpoint, params)
    if (result.error) {
      throw new Error(result.error);
    }

    const results = (result.features || []).map((data: any) => {
      return this._formatResult(data);
    });

    return {
      data: results,
      raw: result
    };
  }

  _formatResult(result: any): ResultData {
    let latitude = result.geometry.coordinates[1];
    if (latitude) {
      latitude = parseFloat(latitude);
    }

    let longitude = result.geometry.coordinates[0];
    if (longitude) {
      longitude = parseFloat(longitude);
    }

    const properties = result.properties;
    const formatedResult: Record<string, any> = {
      latitude: latitude,
      longitude: longitude,
      state: properties.context,
      city: properties.city,
      zipcode: properties.postcode,
      citycode: properties.citycode,
      countryCode: 'FR',
      country: 'France',
      type: properties.type,
      id: properties.id
    };

    if (properties.type === 'housenumber') {
      formatedResult.streetName = properties.street;
      formatedResult.streetNumber = properties.housenumber;
    } else if (properties.type === 'street') {
      formatedResult.streetName = properties.name;
    } else if (properties.type === 'city') {
      formatedResult.population = properties.population;
      formatedResult.adm_weight = properties.adm_weight;
    } else if (properties.type === 'village') {
      formatedResult.population = properties.population;
    } else if (properties.type === 'locality') {
      formatedResult.streetName = properties.name;
    }

    return formatedResult;
  }

  override async _reverse(query: ReverseQuery): Promise<Result> {
    const params = this._getCommonParams();
    const record = query as Record<string, any>;

    for (const k in record) {
      const v = record[k];
      params[k] = v;
    }

    const result = await this.httpAdapter.get(
      this._endpoint_reverse,
      params
    );

    if (result.error) {
      throw new Error(result.error);
    }

    const results = (result.features || []).map((data: any) => {
      return this._formatResult(data);
    });

    return {
      data: results,
      raw: result
    };
  }

  /**
   * Prepare common params
   *
   * @return <Object> common params
   */
  _getCommonParams(): Record<string, any> {
    const params: Record<string, any> = {};
    const options: Record<string, any> = this.options;

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
}

export default OpendataFranceGeocoder;
