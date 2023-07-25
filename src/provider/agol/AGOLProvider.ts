import net from 'net';
import BaseAbstractProviderAdapter from '../BaseAbstractProviderAdapter';
import type {
  HTTPAdapter,
  ReverseQuery,
  BaseAdapterOptions,
  ResultData,
  GeocodeQuery,
  Nullable,
  Result
} from 'src/types';
import ResultError from 'src/utils/error/ResultError';
import TokenCache, { Cache } from 'src/utils/TokenCache';

export interface Options extends BaseAdapterOptions {
  provider: 'agol';
  client_id: string;
  client_secret: string;
}

class AGOLProvider extends BaseAbstractProviderAdapter<Options> {
  cache: Cache;

  _authEndpoint = 'https://www.arcgis.com/sharing/oauth2/token';
  _endpoint =
    'http://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer/find';
  _reverseEndpoint =
    'http://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer/reverseGeocode';

  constructor(
    httpAdapter: HTTPAdapter,
    options: Omit<Options, 'provider'> = { client_id: '', client_secret: '' },
    cache: Cache = new TokenCache()
  ) {
    super(httpAdapter, { ...options, provider: 'agol' });

    if (!httpAdapter) {
      throw new Error(
        'ArcGis Online Geocoder requires a httpAdapter to be defined'
      );
    }

    if (!options.client_secret || !options.client_id) {
      throw new Error('You must specify the client_id and the client_secret');
    }

    this.cache = cache;
  }

  override async _geocode(query: GeocodeQuery): Promise<Result> {
    if (typeof query === 'string' && net.isIP(query)) {
      throw new Error('The AGOL geocoder does not support IP addresses');
    }

    if (query instanceof Array) {
      //As defined in http://resources.arcgis.com/en/help/arcgis-rest-api/#/Batch_geocoding/02r300000003000000/
      throw new Error(
        'An ArcGIS Online organizational account is required to use the batch geocoding functionality'
      );
    }

    const token = await this._getToken();
    const params = {
      token: token,
      f: 'json',
      text: query,
      outFields: 'AddNum,StPreDir,StName,StType,City,Postal,Region,Country'
    };

    const json = await this.httpAdapter.get(this._endpoint, params)

    if (!json) {
      throw new ResultError(this);
    }

    // This is to work around ESRI's habit of returning 200 OK for failures such as lack of authentication
    if (json.error) {
      throw json.error;
    }

    const results = json.locations.map((location: any) => {
      return this._formatResult(location);
    });

    return {
      data: results,
      raw: json
    };
  }


  override async _reverse(query: ReverseQuery): Promise<Result> {
    const lat = query.lat;
    const long = query.lon;

    const token = await this._getToken();

    const params = {
      token: token,
      f: 'json',
      location: long + ',' + lat,
      outFields: 'AddrNum,StPreDir,StName,StType,City,Postal,Region,Country'
    };

    const json = await this.httpAdapter.get(
      this._reverseEndpoint,
      params
    );

    if (json.error) {
      throw json.error;
    }

    const data = [this._formatResult(json)];

    return {
      data,
      raw: json
    };
  }

  //Cached vars
  // Leaving this non-private since it was a part of the tests
  // @todo make this private
  async _getToken(): Promise<Nullable<string>> {
    const cachedToken = this.cache.get();
    if (cachedToken !== null) {
      return cachedToken;
    }

    const params = {
      grant_type: 'client_credentials',
      client_id: this.options.client_id,
      client_secret: this.options.client_secret
    };

    const result = await this.httpAdapter.get<{ expires_in: number; access_token: string }>(
      this._authEndpoint,
      params
    );

    if (!result) {
      return null;
    }

    const tokenExpiration = new Date().getTime() + result.expires_in;
    const token = `${result.access_token}`;
    this.cache.put(token, tokenExpiration);

    return token
  }

  private _formatResult(result: any): ResultData {
    if (result.address) {
      return {
        latitude: result.location.y,
        longitude: result.location.x,
        country: result.address.CountryCode,
        city: result.address.City,
        state: result.address.Region,
        zipcode: result.address.Postal,
        countryCode: result.address.CountryCode,
        address: result.address.Address,
        neighborhood: result.address.Neighborhood,
        loc_name: result.address.Loc_name
      };
    }

    let country: string | undefined = undefined;
    let countryCode: string | undefined = undefined;
    let city: string | undefined = undefined;
    let state: string | undefined = undefined;
    const stateCode: string | undefined = undefined;
    let zipcode: string | undefined = undefined;
    let streetPreDir: string | undefined = undefined;
    let streetType: string | undefined = undefined;
    let streetName: string | undefined = undefined;
    let streetNumber: string | undefined = undefined;

    const attributes = result.feature?.attributes || {};
    for (const property in attributes) {
      if (attributes[property]) {
        if (property == 'City') {
          city = attributes[property];
        }
        if (property == 'Postal') {
          zipcode = attributes[property];
        }
        if (property == 'Region') {
          state = attributes[property];
        }
        if (property == 'StPreDir') {
          streetPreDir = attributes[property];
        }
        if (property == 'AddNum') {
          streetNumber = attributes[property];
        }
        if (property == 'StName') {
          streetName = attributes[property];
        }
        if (property == 'StType') {
          streetType = attributes[property];
        }
        if (property == 'Country') {
          countryCode = attributes[property];
          country = attributes[property];
        }
      }
    }

    return {
      latitude: result.feature?.geometry?.y,
      longitude: result.feature?.geometry?.x,
      country: country,
      city: city,
      state: state,
      stateCode: stateCode,
      zipcode: zipcode,
      streetName: [streetPreDir, streetName, streetType]
        .filter(Boolean)
        .join(' '),
      streetNumber: streetNumber,
      countryCode: countryCode
    };
  }
}

export default AGOLProvider;
