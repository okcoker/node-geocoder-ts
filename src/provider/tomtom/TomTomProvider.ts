import BaseAbstractProviderAdapter from '../BaseAbstractProviderAdapter';
import type {
  HTTPAdapter,
  BatchResult,
  BaseAdapterOptions,
  ResultData,
  Result
} from 'src/types';

export interface Options extends BaseAdapterOptions {
  provider: 'tomtom';
  apiKey: string;
  language?: string;
  country?: string;
  limit?: number;
}

class TomTomProvider extends BaseAbstractProviderAdapter<Options> {
  _endpoint = 'https://api.tomtom.com/search/2/geocode';
  _batchGeocodingEndpoint = 'https://api.tomtom.com/search/2/batch.json';

  constructor(
    httpAdapter: HTTPAdapter,
    options: Omit<Options, 'provider'> = { apiKey: '' }
  ) {
    super(httpAdapter, { ...options, provider: 'tomtom' });
    if (!options.apiKey) {
      throw new Error('You must specify an apiKey');
    }
  }

  override async _geocode(query: string): Promise<Result> {
    const params: Record<string, string | number> = {
      key: this.options.apiKey
    };

    if (this.options.language) {
      params.language = this.options.language;
    }

    if (this.options.country) {
      params.countrySet = this.options.country;
    }

    if (this.options.limit) {
      params.limit = this.options.limit;
    }

    const url = this._endpoint + '/' + encodeURIComponent(query) + '.json';

    const result = await this.httpAdapter.get(url, params);

    const results = result.results.map((data: any) => {
      return this._formatResult(data);
    });

    return {
      data: results,
      raw: result
    };
  }

  _formatResult(result: any): ResultData {
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
  }

  override async _batchGeocode(queries: string[]): Promise<BatchResult> {
    const jobLocation = await this.__createJob(queries);
    const rawResults = await this.__pollJobStatusAndFetchResults(
      jobLocation,
      queries
    );
    const parsedResults = this.__parseBatchResults(rawResults);
    return parsedResults;
  }

  private async __createJob(addresses: string[]): Promise<string> {
    const body = {
      batchItems: addresses.map(address => {
        let query = `/geocode/${encodeURIComponent(address)}.json`;
        const queryString = new URLSearchParams();
        if (this.options.country) {
          queryString.append('countrySet', this.options.country);
        }
        if (this.options.limit) {
          queryString.append('limit', `${this.options.limit}`);
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
    const response = await this.httpAdapter.post<Response>(
      this._batchGeocodingEndpoint,
      params,
      {
        headers: {
          'content-type': 'application/json',
          accept: 'application/json'
        },
        redirect: 'manual',
        body: JSON.stringify(body)
      },
      true
    );

    if (response.status !== 303) {
      const responseContentType = response.headers.get('Content-Type');
      if (
        responseContentType &&
        responseContentType.includes('application/json')
      ) {
        const errorBody = await response.json();
        throw new Error(errorBody.error.description);
      } else {
        throw new Error(await response.text());
      }
    }
    const location = response.headers.get('Location');
    if (!location) {
      throw new Error('Location header not found');
    }
    return location;
  }

  private async __pollJobStatusAndFetchResults(
    location: string,
    addresses: string[],
    // Not sure why 84, but the original implementation seems like a mini ddos
    stalledResponsesLeft = 84
  ): Promise<any> {
    if (stalledResponsesLeft === 0) {
      throw new Error('Long poll ended without results after 14 minutes');
    }

    const response = await this.httpAdapter.get<Response>(
      location,
      {},
      undefined,
      true
    );

    if (response.status === 200) {
      const results = await response.json();

      if (
        !results.batchItems ||
        results.batchItems.length !== addresses.length
      ) {
        throw new Error('Batch items length mismatch');
      }

      return results;
    }

    if (response.status === 202) {
      const newLocation = response.headers.get('Location');
      if (!newLocation) {
        throw new Error('Location header not found');
      }

      return this.__pollJobStatusAndFetchResults(
        location,
        addresses,
        stalledResponsesLeft - 1
      );
    }

    if (response.status === 429) {
      throw new Error('Provider error: Too many requests');
    }

    throw new Error(`Unexpected status: ${response.status}`);
  }

  private __parseBatchResults(rawResults: any): BatchResult {
    return rawResults.batchItems.map((result: any) => {
      if (result.statusCode !== 200) {
        return {
          error: `statusCode: ${result.statusCode}`,
          value: []
        };
      }
      return {
        error: null,
        data: result.response.results.map((value: any) => {
          return {
            data: this._formatResult(value),
            raw: value
          };
        })
      };
    });
  }
}

export default TomTomProvider;
