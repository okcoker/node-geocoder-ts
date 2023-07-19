// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'AbstractGe... Remove this comment to see the full error message
const AbstractGeocoder = require('./abstractgeocoder');

/**
 * available options
 * @see https://docs.mapbox.com/api/search/geocoding/
 */
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'OPTIONS'.
const OPTIONS = [
  'apiKey',
  'language',
  'country',
  'autocomplete',
  'bbox',
  'fuzzyMatch',
  'limit',
  'proximity',
  'routing'
];

const OPTIONS_MAP = {
  apiKey: 'access_token'
};

/**
 * Constructor
 * @param <object> httpAdapter Http Adapter
 * @param <object> options Options (apiKey, language, country, autocomplete, bbox, fuzzyMatch, limit, proximity, routing)
 */
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'MapBoxGeoc... Remove this comment to see the full error message
class MapBoxGeocoder extends AbstractGeocoder {
  constructor(httpAdapter: any, options: any) {
    super(httpAdapter, options);
    this.options = options || {};

    if (!this.options.apiKey) {
      throw new Error('You must specify apiKey to use MapBox Geocoder');
    }
  }

  /**
   * Geocode
   * @param <string>   value    Value to geocode (Address)
   * @param <function> callback Callback method
   */
  _geocode(value: any, callback: any) {
    let params = this._prepareQueryString({});
    let searchtext = value;

    if (value.address) {
      params = this._prepareQueryString(value);
      searchtext = value.address;
    }

    const endpoint = `${this._geocodeEndpoint}/${encodeURIComponent(
      searchtext
    )}.json`;

    this.httpAdapter.get(endpoint, params, (err: any, result: any) => {
      let results: any = [];
      results.raw = result;

      if (err) {
        return callback(err, results);
      } else {
        const view = result.features;
        if (!view) {
          return callback(false, results);
        }
        results = view.map(this._formatResult);
        results.raw = result;

        callback(false, results);
      }
    });
  }

  /**
   * Reverse geocoding
   * @param {lat:<number>,lon:<number>}  lat: Latitude, lon: Longitude
   * @param <function> callback Callback method
   */
  _reverse(query: any, callback: any) {
    const { lat, lon, ...other } = query;

    const params = this._prepareQueryString(other);
    const endpoint = `${this._geocodeEndpoint}/${encodeURIComponent(
      `${lon},${lat}`
    )}.json`;

    this.httpAdapter.get(endpoint, params, (err: any, result: any) => {
      let results: any = [];
      results.raw = result;

      if (err) {
        return callback(err, results);
      } else {
        const view = result.features;
        if (!view) {
          return callback(false, results);
        }
        results = view.map(this._formatResult);
        results.raw = result;

        callback(false, results);
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

  _prepareQueryString(params: any) {
    OPTIONS.forEach(key => {
      const val = this.options[key];
      if (val) {
        // @ts-expect-error TS(7053): Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
        const _key = OPTIONS_MAP[key] || key;
        params[_key] = val;
      }
    });

    return params;
  }
}

Object.defineProperties(MapBoxGeocoder.prototype, {
  _geocodeEndpoint: {
    get: function () {
      return 'https://api.mapbox.com/geocoding/v5/mapbox.places';
    }
  }
});

export default MapBoxGeocoder;
