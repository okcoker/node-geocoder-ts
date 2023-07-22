import readline from 'readline';
import ValueError from './../error/valueerror';
import BaseAbstractGeocoderAdapter from './abstractgeocoder';
import type {
  HTTPAdapter,
  ResultCallback,
  BatchResult,
  BatchResultCallback,
  BaseAdapterOptions,
  Location,
  GeocodeValue,
  ResultData
} from '../../types';

export interface Options extends BaseAdapterOptions {
  provider: 'here';
  /**
   * If apiKey is not specified, this assumes you're using the `appId` & `appCode` combo
   */
  apiKey?: string;
  /** @deprecated use `apiKey` instead */
  appId?: string;
  /** @deprecated use `apiKey` instead */
  appCode?: string;
  limit?: number;
  language?: string;
  politicalView?: string;
  country?: string;
  state?: string;
  production?: boolean;
}

class HereGeocoder extends BaseAbstractGeocoderAdapter<Options> {
  // Here geocoding API endpoint
  _geocodeEndpoint = 'https://geocoder.ls.hereapi.com/6.2/geocode.json';

  // Here reverse geocoding API endpoint
  _reverseEndpoint =
    'https://reverse.geocoder.ls.hereapi.com/6.2/reversegeocode.json';

  // Here batch geocoding API endpoint
  _batchGeocodeEndpoint = 'https://batch.geocoder.ls.hereapi.com/6.2/jobs';

  constructor(
    httpAdapter: HTTPAdapter,
    options: Omit<Options, 'provider'> = {}
  ) {
    super(httpAdapter, { ...options, provider: 'here' } as Options);

    if (!options.apiKey && !(options.appId && options.appCode)) {
      throw new Error('You must specify apiKey to use Here Geocoder');
    }
  }

  override _geocode(
    value: GeocodeValue & {
      address?: string;
      language?: string;
      politicalView?: string;
      country?: string;
      state?: string;
      zipcode?: string;
    },
    callback: ResultCallback
  ) {
    const params = this._prepareQueryString();

    if (value.address) {
      if (value.language) {
        params.language = value.language;
      }
      if (value.politicalView) {
        params.politicalview = value.politicalView;
      }
      if (value.country) {
        params.country = value.country;
        if (value.state) {
          params.state = value.state;
        } else {
          delete params.state;
        }
      }
      if (value.zipcode) {
        params.postalcode = value.zipcode;
      }
      params.searchtext = value.address;
    } else {
      params.searchtext = value;
    }

    this.httpAdapter.get(
      this._geocodeEndpoint,
      params,
      (err: any, result: any) => {
        if (err) {
          return callback(err, null);
        } else {
          if (result.type === 'ApplicationError') {
            return callback(new ValueError(result.Details), null);
          }
          if (result.error === 'Unauthorized') {
            return callback(new ValueError(result.error_description), null);
          }
          const view = result.Response.View[0];
          if (!view) {
            return callback(null, {
              raw: result,
              data: []
            });
          }

          // Format each geocoding result
          const results = view.Result.map((data: any) => {
            return this._formatResult(data);
          });

          callback(null, {
            data: results,
            raw: result
          });
        }
      }
    );
  }

  override _reverse(query: Location, callback: ResultCallback) {
    const lat = query.lat;
    const lng = query.lon;
    const params = this._prepareQueryString();

    params.pos = lat + ',' + lng;
    params.mode = 'trackPosition';

    this.httpAdapter.get(
      this._reverseEndpoint,
      params,
      (err: any, result: any) => {
        if (err) {
          return callback(err, null);
        } else {
          const view = result.Response.View[0];
          if (!view) {
            return callback(null, {
              raw: result,
              data: []
            });
          }

          // Format each geocoding result
          const results = view.Result.map((data: any) => {
            return this._formatResult(data);
          });

          callback(null, {
            data: results,
            raw: result
          });
        }
      }
    );
  }

  _formatResult(result: any): ResultData {
    const location = result.Location || {};
    const address = location.Address || {};
    const extractedObj: Record<string, any> = {
      formattedAddress: address.Label,
      latitude: location.DisplayPosition.Latitude,
      longitude: location.DisplayPosition.Longitude,
      // country: null,
      countryCode: address.Country,
      state: address.State,
      county: address.County,
      city: address.City,
      zipcode: address.PostalCode,
      district: address.District,
      streetName: address.Street,
      streetNumber: address.HouseNumber,
      building: address.Building,
      extra: {
        herePlaceId: location.LocationId,
        confidence: result.Relevance || 0
      },
      administrativeLevels: {
        level1long: undefined,
        level2long: undefined
      }
    };

    for (let i = 0; i < address.AdditionalData.length; i++) {
      const additionalData = address.AdditionalData[i];
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
          extractedObj.administrativeLevels.level1long = additionalData.value;
          extractedObj.state = additionalData.value;
          break;
        //County name
        case 'CountyName':
          extractedObj.administrativeLevels.level2long = additionalData.value;
          extractedObj.county = additionalData.value;
      }
    }

    return extractedObj;
  }

  _prepareQueryString(): Record<string, any> {
    const params: Record<string, any> = {
      additionaldata: 'Country2,true',
      gen: 8
    };

    // Deprecated
    if (this.options.appId) {
      params.app_id = this.options.appId;
    }
    // Deprecated
    if (this.options.appCode) {
      params.app_code = this.options.appCode;
    }

    if (this.options.apiKey) {
      params.apiKey = this.options.apiKey;
    }

    if (this.options.language) {
      params.language = this.options.language;
    }
    if (this.options.politicalView) {
      params.politicalview = this.options.politicalView;
    }
    if (this.options.country) {
      params.country = this.options.country;
    }
    if (this.options.state) {
      params.state = this.options.state;
    }
    if (this.options.limit) {
      params.maxresults = this.options.limit;
    }

    return params;
  }

  override async _batchGeocode(values: GeocodeValue[], callback: BatchResultCallback) {
    try {
      const jobId = await this.__createJob(values);
      await this.__pollJobStatus(jobId);
      const rawResults = await this._getJobResults(jobId);
      const results = this.__parseBatchResults(rawResults);
      callback(null, results);
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
          (value: any, ix: any) =>
            `${ix + 1}|"${value}"${country ? `|${country}` : ''}`
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
    const creteJobReq = await new Promise<Response>((resolve, reject) => {
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
      const jobStatus = await new Promise<any>((resolve, reject) => {
        this.httpAdapter.get(url, params, (err: any, result: any) => {
          if (err) return reject(err);
          resolve(result);
        });
      });
      if (jobStatus.Response.Status === 'completed') {
        completed = true;
        break;
      }
    }
    if (!completed) {
      throw new Error('Job timeout');
    }
  }

  private async _getJobResults(jobId: any) {
    // fetch job results
    const params = {
      ...this._prepareQueryString(),
      outputcompressed: false
    };
    const jobResult = await new Promise<any>((resolve, reject) => {
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
    const jobErrors = await new Promise<any>((resolve, reject) => {
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

  private __parseBatchResults(results: any): BatchResult {
    return results.map((result: any) => {
      const { values, error } = result;
      return {
        error,
        data: values.map((value: any) => {
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

export default HereGeocoder;
