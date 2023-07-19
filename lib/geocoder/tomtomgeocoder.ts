var util = require('util');
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'AbstractGe... Remove this comment to see the full error message
var AbstractGeocoder = require('./abstractgeocoder');

/**
 * Constructor
 * @param <object> httpAdapter Http Adapter
 * @param <object> options     Options (language, clientId, apiKey)
 */
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'TomTomGeoc... Remove this comment to see the full error message
var TomTomGeocoder = function TomTomGeocoder(this: any, httpAdapter: any, options: any) {
  // @ts-expect-error TS(2339): Property 'super_' does not exist on type '(this: a... Remove this comment to see the full error message
  TomTomGeocoder.super_.call(this, httpAdapter, options);

  if (!this.options.apiKey || this.options.apiKey == 'undefined') {
    throw new Error('You must specify an apiKey');
  }
};

util.inherits(TomTomGeocoder, AbstractGeocoder);

// TomTom geocoding API endpoint
TomTomGeocoder.prototype._endpoint = 'https://api.tomtom.com/search/2/geocode';
TomTomGeocoder.prototype._batchGeocodingEndpoint =
  'https://api.tomtom.com/search/2/batch.json';

/**
 * Geocode
 * @param <string>   value    Value to geocode (Address)
 * @param <function> callback Callback method
 */
TomTomGeocoder.prototype._geocode = function (value: any, callback: any) {
  var _this = this;

  var params = {
    key: this.options.apiKey
  };

  if (this.options.language) {
    // @ts-expect-error TS(2339): Property 'language' does not exist on type '{ key:... Remove this comment to see the full error message
    params.language = this.options.language;
  }

  if (this.options.country) {
    // @ts-expect-error TS(2339): Property 'countrySet' does not exist on type '{ ke... Remove this comment to see the full error message
    params.countrySet = this.options.country;
  }

  if (this.options.limit) {
    // @ts-expect-error TS(2339): Property 'limit' does not exist on type '{ key: an... Remove this comment to see the full error message
    params.limit = this.options.limit;
  }

  var url = this._endpoint + '/' + encodeURIComponent(value) + '.json';

  this.httpAdapter.get(url, params, function (err: any, result: any) {
    if (err) {
      return callback(err);
    } else {
      var results = [];

      for (var i = 0; i < result.results.length; i++) {
        results.push(_this._formatResult(result.results[i]));
      }

      // @ts-expect-error TS(2339): Property 'raw' does not exist on type 'any[]'.
      results.raw = result;
      callback(false, results);
    }
  });
};

TomTomGeocoder.prototype._formatResult = function (result: any) {
  return {
    latitude: result.position.lat,
    longitude: result.position.lon,
    country: result.address.country,
    city: result.address.localName,
    state: result.address.countrySubdivision,
    zipcode: result.address.postcode,
    streetName: result.address.streetName,
    streetNumber: result.address.streetNumber,
    countryCode: result.address.countryCode
  };
};

/**
 * Batch Geocode
 * @param <string[]>   values    Valueas to geocode
 * @param <function> callback Callback method
 */
TomTomGeocoder.prototype._batchGeocode = async function (values: any, callback: any) {
  try {
    const jobLocation = await this.__createJob(values);
    const rawResults = await this.__pollJobStatusAndFetchResults(
      jobLocation,
      values
    );
    const parsedResults = this.__parseBatchResults(rawResults);
    callback(false, parsedResults);
  } catch (e) {
    callback(e, null);
  }
};

TomTomGeocoder.prototype.__createJob = async function (addresses: any) {
  const body = {
    batchItems: addresses.map((address: any) => {
      let query = `/geocode/${encodeURIComponent(address)}.json`;
      const queryString = new URLSearchParams();
      if (this.options.country) {
        queryString.append('countrySet', this.options.country);
      }
      if (this.options.limit) {
        queryString.append('limit', this.options.limit);
      }
      if (queryString.toString()) {
        query += `?${queryString.toString()}`;
      }
      return { query };
    })
  };
  const params = {
    key: this.options.apiKey,
    waitTimeSeconds: 10
  };
  const options = {
    headers: {
      'content-type': 'application/json',
      accept: 'application/json'
    },
    redirect: 'manual',
    body: JSON.stringify(body)
  };
  const response = await new Promise((resolve, reject) => {
    this.httpAdapter.post(
      this._batchGeocodingEndpoint,
      params,
      options,
      function (err: any, result: any) {
        if (err) {
          return reject(err);
        }
        resolve(result);
      }
    );
  });
  // @ts-expect-error TS(2571): Object is of type 'unknown'.
  if (response.status !== 303) {
    // @ts-expect-error TS(2571): Object is of type 'unknown'.
    const responseContentType = response.headers.get('Content-Type');
    if (
      responseContentType &&
      responseContentType.includes('application/json')
    ) {
      // @ts-expect-error TS(2571): Object is of type 'unknown'.
      const errorBody = await response.json();
      throw new Error(errorBody.error.description);
    } else {
      // @ts-expect-error TS(2571): Object is of type 'unknown'.
      throw new Error(await response.text());
    }
  }
  // @ts-expect-error TS(2571): Object is of type 'unknown'.
  const location = response.headers.get('Location');
  if (!location) {
    throw new Error('Location header not found');
  }
  return location;
};

TomTomGeocoder.prototype.__pollJobStatusAndFetchResults = async function (
  location: any,
  addresses: any
) {
  let results;
  let stalledResponsesLeft = 84;
  for (; !results && stalledResponsesLeft > 0; stalledResponsesLeft -= 1) {
    let newLocation = location;
    const status = await new Promise((resolve, reject) => {
      this.httpAdapter.get(
        newLocation,
        {},
        function (err: any, res: any) {
          if (err) {
            return reject(err);
          }
          resolve(res);
        },
        true
      );
    });
    // @ts-expect-error TS(2571): Object is of type 'unknown'.
    if (status.status === 200) {
      // @ts-expect-error TS(2571): Object is of type 'unknown'.
      results = await status.json();
    // @ts-expect-error TS(2571): Object is of type 'unknown'.
    } else if (status.status === 202) {
      // @ts-expect-error TS(2571): Object is of type 'unknown'.
      newLocation = status.headers.get('Location');
      if (!newLocation) {
        throw new Error('Location header not found');
      }
    // @ts-expect-error TS(2571): Object is of type 'unknown'.
    } else if (status.status === 429) {
      throw new Error('Provider error: Too many requests');
    } else {
      // @ts-expect-error TS(2571): Object is of type 'unknown'.
      throw new Error(`Unexpected status: ${status.status}`);
    }
  }
  if (!results) {
    throw new Error('Long poll ended without results after 14 minutes');
  }
  if (!results.batchItems || results.batchItems.length !== addresses.length) {
    throw new Error('Batch items length mismatch');
  }
  return results;
};

TomTomGeocoder.prototype.__parseBatchResults = function (rawResults: any) {
  return rawResults.batchItems.map((result: any) => {
    if (result.statusCode !== 200) {
      return {
        error: `statusCode: ${result.statusCode}`,
        value: []
      };
    }
    return {
      error: null,
      value: result.response.results.map((value: any) => ({
        ...this._formatResult(value),
        provider: 'tomtom'
      }))
    };
  });
};

export default TomTomGeocoder;
