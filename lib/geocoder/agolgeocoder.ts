import net from 'net';
import BaseAbstractGeocoder from './abstractgeocoder';
import type {
  HTTPAdapter,
  Location,
  ResultCallback,
  BaseOptions,
  NodeCallback,
  ResultData
} from '../../types';

export interface Options extends BaseOptions {
  provider: 'agol';
  client_id: string;
  client_secret: string;
}

class AGOLGeocoder extends BaseAbstractGeocoder<Options> {
  cache: any;

  _authEndpoint = 'https://www.arcgis.com/sharing/oauth2/token';
  _endpoint =
    'http://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer/find';
  _reverseEndpoint =
    'http://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer/reverseGeocode';

  constructor(httpAdapter: HTTPAdapter, options: Options) {
    super(httpAdapter, options);

    if (!httpAdapter || typeof httpAdapter == 'undefined') {
      throw new Error(
        'ArcGis Online Geocoder requires a httpAdapter to be defined'
      );
    }

    this.cache = {};
  }

  //Cached vars

  _cachedToken = {
    now: function () {
      return new Date().getTime();
    },
    put: function (token: any, experation: any, cache: any) {
      cache.token = token;
      //Shave 30 secs off experation to ensure that we expire slightly before the actual expiration
      cache.tokenExp = this.now() + (experation - 30);
    },
    get: function (cache?: any) {
      if (!cache) {
        return null;
      }

      if (this.now() <= cache.tokenExp) {
        return cache.token;
      } else {
        return null;
      }
    }
  };

  _getToken(callback: NodeCallback<string>) {
    if (this._cachedToken.get(this.cache) !== null) {
      callback(this._cachedToken.get());
      return;
    }

    const params = {
      grant_type: 'client_credentials',
      client_id: this.options.client_id,
      client_secret: this.options.client_secret
    };

    this.httpAdapter.get(
      this._authEndpoint,
      params,
      (err: any, result: any) => {
        if (err) {
          return callback(err);
        } else {
          result = JSON.parse(result);
          const tokenExpiration = new Date().getTime() + result.expires_in;
          const token = `${result.access_token}`;
          this._cachedToken.put(token, tokenExpiration, this.cache);

          callback(null, token);
        }
      }
    );
  }

  /**
   * Geocode
   * @param {String}   value    Value to geocode (Address)
   * @param {Function} callback Callback method
   */
  geocode(value: any, callback: ResultCallback) {
    if (net.isIP(value)) {
      throw new Error('The AGOL geocoder does not support IP addresses');
    }

    if (value instanceof Array) {
      //As defined in http://resources.arcgis.com/en/help/arcgis-rest-api/#/Batch_geocoding/02r300000003000000/
      throw new Error(
        'An ArcGIS Online organizational account is required to use the batch geocoding functionality'
      );
    }

    const execute = (value: any, token: any, callback: ResultCallback) => {
      const params = {
        token: token,
        f: 'json',
        text: value,
        outFields: 'AddNum,StPreDir,StName,StType,City,Postal,Region,Country'
      };

      this.httpAdapter.get(this._endpoint, params, (err: any, result: any) => {
        result = JSON.parse(result);
        if (err) {
          return callback(err, null);
        } else {
          //This is to work around ESRI's habit of returning 200 OK for failures such as lack of authentication
          if (result.error) {
            callback(result.error, null);

            return null;
          }

          const results = result.locations.map((location: any) => {
            return this._formatResult(location);
          });

          results.raw = result;
          callback(null, results);
        }
      });
    };

    this._getToken(function (err: any, token: any) {
      if (err) {
        return callback(err, null);
      } else {
        execute(value, token, callback);
      }
    });
  }

  _formatResult(result: any): ResultData {
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

    const attributes = result.feature.attributes;
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
      latitude: result.feature.geometry.y,
      longitude: result.feature.geometry.x,
      country: country,
      city: city,
      state: state,
      stateCode: stateCode,
      zipcode: zipcode,
      streetName: streetPreDir + ' ' + streetName + ' ' + streetType,
      streetNumber: streetNumber,
      countryCode: countryCode
    };
  }

  /**
   * Reverse geocoding
   * @param {function} callback Callback method
   */
  reverse(query: Location, callback: ResultCallback) {
    const lat = query.lat;
    const long = query.lon;

    const execute = (
      lat: number,
      long: number,
      token: string,
      callback: ResultCallback
    ) => {
      const params = {
        token: token,
        f: 'json',
        location: long + ',' + lat,
        outFields: 'AddrNum,StPreDir,StName,StType,City,Postal,Region,Country'
      };

      this.httpAdapter.get(
        this._reverseEndpoint,
        params,
        (err: any, result: any) => {
          result = JSON.parse(result);
          if (err) {
            return callback(err, null);
          } else {
            //This is to work around ESRI's habit of returning 200 OK for failures such as lack of authentication
            if (result.error) {
              callback(result.error, null);
              return null;
            }

            const data = [this._formatResult(result)];

            callback(null, {
              data,
              raw: result
            });
          }
        }
      );
    };

    this._getToken((err, token) => {
      if (err) {
        return callback(err, null);
      } else {
        // probably need to check for empty token here?
        // leaving as is for backwards compatibility
        execute(lat, long, token || '', callback);
      }
    });
  }
}

export default AGOLGeocoder;
