const readline = require('readline');
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'AbstractGe... Remove this comment to see the full error message
const AbstractGeocoder = require('./abstractgeocoder');
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'ValueError... Remove this comment to see the full error message
const ValueError = require('./../error/valueerror');

// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'OPTIONS'.
const OPTIONS = [
  'apiKey',
  'appId',
  'appCode',
  'language',
  'politicalView',
  'country',
  'state',
  'production'
];

/**
 * Constructor
 * @param <object> httpAdapter Http Adapter
 * @param <object> options     Options (appId, appCode, language, politicalView, country, state, production)
 */
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'HereGeocod... Remove this comment to see the full error message
class HereGeocoder extends AbstractGeocoder {
  constructor(httpAdapter: any, options: any) {
    super(httpAdapter, options);
    this.options = options;
    OPTIONS.forEach(option => {
      if (!options[option] || options[option] == 'undefined') {
        this.options[option] = null;
      }
    });

    if (!this.options.apiKey && !(this.options.appId && this.options.appCode)) {
      throw new Error('You must specify apiKey to use Here Geocoder');
    }
  }

  /**
   * Geocode
   * @param <string>   value    Value to geocode (Address)
   * @param <function> callback Callback method
   */
  _geocode(value: any, callback: any) {
    var _this = this;
    var params = this._prepareQueryString();

    if (value.address) {
      if (value.language) {
        // @ts-expect-error TS(2339): Property 'language' does not exist on type '{ addi... Remove this comment to see the full error message
        params.language = value.language;
      }
      if (value.politicalView) {
        // @ts-expect-error TS(2339): Property 'politicalview' does not exist on type '{... Remove this comment to see the full error message
        params.politicalview = value.politicalView;
      }
      if (value.country) {
        // @ts-expect-error TS(2339): Property 'country' does not exist on type '{ addit... Remove this comment to see the full error message
        params.country = value.country;
        if (value.state) {
          // @ts-expect-error TS(2339): Property 'state' does not exist on type '{ additio... Remove this comment to see the full error message
          params.state = value.state;
        } else {
          // @ts-expect-error TS(2339): Property 'state' does not exist on type '{ additio... Remove this comment to see the full error message
          delete params.state;
        }
      }
      if (value.zipcode) {
        // @ts-expect-error TS(2339): Property 'postalcode' does not exist on type '{ ad... Remove this comment to see the full error message
        params.postalcode = value.zipcode;
      }
      // @ts-expect-error TS(2339): Property 'searchtext' does not exist on type '{ ad... Remove this comment to see the full error message
      params.searchtext = value.address;
    } else {
      // @ts-expect-error TS(2339): Property 'searchtext' does not exist on type '{ ad... Remove this comment to see the full error message
      params.searchtext = value;
    }

    this.httpAdapter.get(this._geocodeEndpoint, params, function (err: any, result: any) {
      var results: any = [];
      results.raw = result;

      if (err) {
        return callback(err, results);
      } else {
        if (result.type === 'ApplicationError') {
          // @ts-expect-error TS(7009): 'new' expression, whose target lacks a construct s... Remove this comment to see the full error message
          return callback(new ValueError(result.Details), results);
        }
        if (result.error === 'Unauthorized') {
          // @ts-expect-error TS(7009): 'new' expression, whose target lacks a construct s... Remove this comment to see the full error message
          return callback(new ValueError(result.error_description), results);
        }
        var view = result.Response.View[0];
        if (!view) {
          return callback(false, results);
        }

        // Format each geocoding result
        results = view.Result.map(_this._formatResult);
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
    var lat = query.lat;
    var lng = query.lon;

    var _this = this;
    var params = this._prepareQueryString();
    // @ts-expect-error TS(2339): Property 'pos' does not exist on type '{ additiona... Remove this comment to see the full error message
    params.pos = lat + ',' + lng;
    // @ts-expect-error TS(2339): Property 'mode' does not exist on type '{ addition... Remove this comment to see the full error message
    params.mode = 'trackPosition';

    this.httpAdapter.get(this._reverseEndpoint, params, function (err: any, result: any) {
      var results: any = [];
      results.raw = result;

      if (err) {
        return callback(err, results);
      } else {
        var view = result.Response.View[0];
        if (!view) {
          return callback(false, results);
        }

        // Format each geocoding result
        results = view.Result.map(_this._formatResult);
        results.raw = result;

        callback(false, results);
      }
    });
  }

  _formatResult(result: any) {
    var location = result.Location || {};
    var address = location.Address || {};
    var i;

    var extractedObj = {
      formattedAddress: address.Label || null,
      latitude: location.DisplayPosition.Latitude,
      longitude: location.DisplayPosition.Longitude,
      country: null,
      countryCode: address.Country || null,
      state: address.State || null,
      county: address.County || null,
      city: address.City || null,
      zipcode: address.PostalCode || null,
      district: address.District || null,
      streetName: address.Street || null,
      streetNumber: address.HouseNumber || null,
      building: address.Building || null,
      extra: {
        herePlaceId: location.LocationId || null,
        confidence: result.Relevance || 0
      },
      administrativeLevels: {}
    };

    for (i = 0; i < address.AdditionalData.length; i++) {
      var additionalData = address.AdditionalData[i];
      switch (additionalData.key) {
        //Country 2-digit code
        case 'Country2':
          extractedObj.countryCode = additionalData.value;
          break;
        //Country name
        case 'CountryName':
          extractedObj.country = additionalData.value;
          break;
        //State name
        case 'StateName':
          // @ts-expect-error TS(2339): Property 'level1long' does not exist on type '{}'.
          extractedObj.administrativeLevels.level1long = additionalData.value;
          extractedObj.state = additionalData.value;
          break;
        //County name
        case 'CountyName':
          // @ts-expect-error TS(2339): Property 'level2long' does not exist on type '{}'.
          extractedObj.administrativeLevels.level2long = additionalData.value;
          extractedObj.county = additionalData.value;
      }
    }

    return extractedObj;
  }
  _prepareQueryString() {
    var params = {
      additionaldata: 'Country2,true',
      gen: 8
    };

    // Deprecated
    if (this.options.appId) {
      // @ts-expect-error TS(2339): Property 'app_id' does not exist on type '{ additi... Remove this comment to see the full error message
      params.app_id = this.options.appId;
    }
    // Deprecated
    if (this.options.appCode) {
      // @ts-expect-error TS(2339): Property 'app_code' does not exist on type '{ addi... Remove this comment to see the full error message
      params.app_code = this.options.appCode;
    }

    if (this.options.apiKey) {
      // @ts-expect-error TS(2339): Property 'apiKey' does not exist on type '{ additi... Remove this comment to see the full error message
      params.apiKey = this.options.apiKey;
    }
    if (this.options.language) {
      // @ts-expect-error TS(2339): Property 'language' does not exist on type '{ addi... Remove this comment to see the full error message
      params.language = this.options.language;
    }
    if (this.options.politicalView) {
      // @ts-expect-error TS(2339): Property 'politicalview' does not exist on type '{... Remove this comment to see the full error message
      params.politicalview = this.options.politicalView;
    }
    if (this.options.country) {
      // @ts-expect-error TS(2339): Property 'country' does not exist on type '{ addit... Remove this comment to see the full error message
      params.country = this.options.country;
    }
    if (this.options.state) {
      // @ts-expect-error TS(2339): Property 'state' does not exist on type '{ additio... Remove this comment to see the full error message
      params.state = this.options.state;
    }
    if (this.options.limit) {
      // @ts-expect-error TS(2339): Property 'maxresults' does not exist on type '{ ad... Remove this comment to see the full error message
      params.maxresults = this.options.limit;
    }

    return params;
  }

  async _batchGeocode(values: any, callback: any) {
    try {
      const jobId = await this.__createJob(values);
      await this.__pollJobStatus(jobId);
      const rawResults = await this._getJobResults(jobId);
      const results = this.__parseBatchResults(rawResults);
      callback(false, results);
    } catch (error) {
      callback(error, null);
    }
  }

  async __createJob(values: any) {
    const { country } = this.options;
    const body =
      `recId|searchText${country ? '|country' : ''}` +
      '\n' +
      values
        .map(
          (value: any, ix: any) => `${ix + 1}|"${value}"${country ? `|${country}` : ''}`
        )
        .join(' \n') +
      '\n';
    const params = {
      ...this._prepareQueryString(),
      action: 'run',
      outdelim: '|',
      indelim: '|',
      header: false,
      outputcombined: true,
      outcols:
        'latitude,longitude,locationLabel,houseNumber,street,district,city,postalCode,county,state,addressDetailsCountry,country,building,locationId'
    };
    const options = {
      body,
      headers: {
        'content-type': 'text/plain',
        accept: 'application/json'
      }
    };
    const creteJobReq = await new Promise((resolve, reject) => {
      this.httpAdapter.post(
        this._batchGeocodeEndpoint,
        params,
        options,
        (err: any, result: any) => {
          if (err) return reject(err);
          resolve(result);
        }
      );
    });
    // @ts-expect-error TS(2571): Object is of type 'unknown'.
    const jobRes = await creteJobReq.json();
    if (jobRes.type === 'ApplicationError') {
      throw new Error(jobRes.Details);
    }
    return jobRes.Response.MetaInfo.RequestId;
  }

  async __pollJobStatus(jobId: any) {
    let completed = false;
    let stalledResultsCount = 500;
    const url = `${this._batchGeocodeEndpoint}/${jobId}`;
    const params = {
      ...this._prepareQueryString(),
      action: 'status'
    };
    for (; !completed && stalledResultsCount > 0; stalledResultsCount--) {
      const jobStatus = await new Promise((resolve, reject) => {
        this.httpAdapter.get(url, params, (err: any, result: any) => {
          if (err) return reject(err);
          resolve(result);
        });
      });
      // @ts-expect-error TS(2571): Object is of type 'unknown'.
      if (jobStatus.Response.Status === 'completed') {
        completed = true;
        break;
      }
    }
    if (!completed) {
      throw new Error('Job timeout');
    }
  }

  async _getJobResults(jobId: any) {
    // fetch job results
    const params = {
      ...this._prepareQueryString(),
      outputcompressed: false
    };
    const jobResult = await new Promise((resolve, reject) => {
      this.httpAdapter.get(
        `${this._batchGeocodeEndpoint}/${jobId}/result`,
        params,
        (err: any, result: any) => {
          if (err) return reject(err);
          resolve(result);
        },
        true
      );
    });
    const jobResultLineReadeer = readline.createInterface({
      // @ts-expect-error TS(2571): Object is of type 'unknown'.
      input: jobResult.body,
      crlfDelay: Infinity
    });
    const res: any = [];
    for await (const line of jobResultLineReadeer) {
      const [
        recId,
        ,
        ,
        /*seqNumber*/ /*seqLength*/ latitude,
        longitude,
        locationLabel,
        houseNumber,
        street,
        district,
        city,
        postalCode,
        county,
        state,
        addressDetailsCountry,
        country,
        building,
        locationId
      ] = line.split('|');
      const index = Number(recId) - 1; // minus one because our index starts at 0 and theirs at 1
      res[index] = res[index] || { error: null, values: [] };
      res[index].values.push({
        latitude: Number(latitude),
        longitude: Number(longitude),
        houseNumber,
        street,
        locationLabel,
        district,
        city,
        postalCode,
        county,
        state,
        addressDetailsCountry, // country name. See formatting
        country, // contry code. See formatting
        building,
        locationId
      });
    }

    // fetch job erros sepparately
    const jobErrors = await new Promise((resolve, reject) => {
      this.httpAdapter.get(
        `${this._batchGeocodeEndpoint}/${jobId}/errors`,
        params,
        (err: any, result: any) => {
          if (err) return reject(err);
          resolve(result);
        },
        true
      );
    });
    const jobErrorsLineReader = readline.createInterface({
      // @ts-expect-error TS(2571): Object is of type 'unknown'.
      input: jobErrors.body,
      crlfDelay: Infinity
    });
    for await (const line of jobErrorsLineReader) {
      const matches = line.match(/Line Number:(?<index>\d+)\s+(?<line>.*)/);
      if (matches && matches.groups && matches.index) {
        const index = Number(matches.groups.index) - 2; // minus one because the first line is the header & one less because our index starts at 0 while theirs at 1
        res[index] = res[index] || { error: null, values: [] };
        res[index].error = matches.groups.line;
      } else {
        throw new Error(`Unexpected error line format: "${line}"`);
      }
    }
    return res;
  }

  __parseBatchResults(results: any) {
    return results.map((result: any) => {
      const { values, error } = result;
      return {
        error,
        value: values.map((value: any) => {
          const {
            latitude,
            longitude,
            district,
            city,
            county,
            state,
            addressDetailsCountry,
            country,
            building
          } = value;
          return {
            formattedAddress: value.locationLabel,
            latitude,
            longitude,
            country: addressDetailsCountry,
            countryCode: country,
            state,
            county,
            city,
            zipcode: value.postalCode,
            district,
            streetName: value.street,
            streetNumber: value.houseNumber,
            building,
            extra: {
              herePlaceId: value.locationId,
              confidence: null
            },
            provider: 'here'
          };
        })
      };
    });
  }
}

Object.defineProperties(HereGeocoder.prototype, {
  // Here geocoding API endpoint
  _geocodeEndpoint: {
    get: function () {
      return 'https://geocoder.ls.hereapi.com/6.2/geocode.json';
    }
  },

  // Here reverse geocoding API endpoint
  _reverseEndpoint: {
    get: function () {
      return 'https://reverse.geocoder.ls.hereapi.com/6.2/reversegeocode.json';
    }
  },

  // Here batch geocoding API endpoint
  _batchGeocodeEndpoint: {
    get: function () {
      return 'https://batch.geocoder.ls.hereapi.com/6.2/jobs';
    }
  }
});

export default HereGeocoder;
