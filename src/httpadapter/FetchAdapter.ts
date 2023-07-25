import HttpError from 'src/utils/error/HttpError';
import nodeFetch from 'node-fetch';
import type {
  HTTPAdapter,
  HTTPAdapterBaseOptions,
  FetchImplementation
} from 'src/types';

class FetchAdapter implements HTTPAdapter {
  fetch: FetchImplementation;
  options: RequestInit;

  constructor({ fetch, ...options }: HTTPAdapterBaseOptions | undefined = {}) {
    this.fetch = fetch || (nodeFetch as unknown as FetchImplementation);
    this.options = options;
  }

  supportsHttps() {
    return true;
  }

  // @todo type this better so we get `Response` when `fullResponse` is true
  async get<T>(
    url: string,
    params: Record<string, any>,
    fullResponse?: boolean
  ): Promise<T> {
    const options: RequestInit = {
      headers: {
        'user-agent':
          'Mozilla/5.0 (X11; Linux i586; rv:31.0) Gecko/20100101 Firefox/31.0',
        accept: 'application/json;q=0.9, */*;q=0.1'
      },
      ...this.options
    };

    const queryString = new URLSearchParams(params);
    if (queryString.toString()) {
      url += `?${queryString.toString()}`;
    }

    try {
      const response = await this.fetch(url, options);

      if (fullResponse) {
        return response as T;
      }

      const rawResponseBody = await response.text();
      try {
        return JSON.parse(rawResponseBody);
      } catch (e) {
        throw new HttpError(rawResponseBody, {
          code: response.status
        });
      }
    } catch (error: any) {
      if (error instanceof HttpError) {
        throw error;
      }
      const err = error.cause ? error.cause : error;
      throw new HttpError(err.message, {
        code: err.code
      });
    }
  }

  async post<T>(
    url: string,
    params: Record<string, any>,
    fetchOptions?: RequestInit,
    fullResponse?: boolean
  ): Promise<T> {
    const options: RequestInit = {
      headers: {
        'user-agent':
          'Mozilla/5.0 (X11; Linux i586; rv:31.0) Gecko/20100101 Firefox/31.0'
      },
      ...fetchOptions,
      method: 'POST'
    };
    const queryString = new URLSearchParams(params);
    if (queryString.toString()) {
      url += `?${queryString.toString()}`;
    }

    try {
      const response = await this.fetch(url, options);
      if (fullResponse) {
        return response as T;
      }
      const rawResponseBody = await response.text();
      try {
        return JSON.parse(rawResponseBody);
      } catch (e) {
        throw new HttpError(rawResponseBody, {
          code: response.status
        });
      }
    } catch (error: any) {
      if (error instanceof HttpError) {
        throw error;
      }
      const _error = error.cause ? error.cause : error;
      throw new HttpError(_error.message, {
        code: _error.code
      });
    }
  }
}

export default FetchAdapter;
