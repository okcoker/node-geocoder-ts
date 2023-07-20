import HttpError from '../error/httperror';
import nodeFetch from 'node-fetch';
import BPromise from 'bluebird';
import type { HTTPAdapter, NodeCallback } from '../../types';

export type FetchAdapterOptions = {
  fetch?: (url: RequestInfo, init?: RequestInit) => Promise<Response>;
  userAgent?: string;
};

class FetchAdapter implements HTTPAdapter {
  fetch: any;
  options: FetchAdapterOptions;

  constructor({ fetch, ...options }: FetchAdapterOptions | undefined = {}) {
    this.fetch = fetch || nodeFetch;
    this.options = options;
  }

  supportsHttps() {
    return true;
  }

  get<T>(
    url: string,
    params: Record<string, any>,
    callback: NodeCallback<T>,
    fullResponse = false
  ) {
    const options = {
      headers: {
        'user-agent':
          this.options.userAgent ||
          'Mozilla/5.0 (X11; Linux i586; rv:31.0) Gecko/20100101 Firefox/31.0',
        accept: 'application/json;q=0.9, */*;q=0.1'
      }
    };

    for (const k in this.options) {
      const v = (this.options as Record<string, any>)[k];
      if (!v) {
        continue;
      }
      // @ts-expect-error TS(7053): Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
      options[k] = v;
    }

    return BPromise.resolve()
      .then(async () => {
        const queryString = new URLSearchParams(params);
        if (queryString.toString()) {
          url += `?${queryString.toString()}`;
        }
        const res = await this.fetch(url, options);
        if (fullResponse) {
          return res;
        }
        try {
          return await res.json();
        } catch (e) {
          throw new HttpError(await res.text(), {
            code: res.statusCode
          });
        }
      })
      .catch(function (error: any) {
        if (error instanceof HttpError) {
          throw error;
        }
        const _error = error.cause ? error.cause : error;
        throw new HttpError(_error.message, {
          code: _error.code
        });
      })
      .asCallback(callback);
  }

  post<T>(
    url: string,
    params: Record<string, any>,
    options: any,
    callback: NodeCallback<T>
  ) {
    options.method = 'POST';
    options.headers = options.headers || {};
    options.headers['user-agent'] =
      this.options.userAgent ||
      'Mozilla/5.0 (X11; Linux i586; rv:31.0) Gecko/20100101 Firefox/31.0';

    for (const k in this.options) {
      const v = (this.options as Record<string, any>)[k];
      if (!v) {
        continue;
      }
      options[k] = v;
    }

    return BPromise.resolve()
      .then(async () => {
        const queryString = new URLSearchParams(params);
        if (queryString.toString()) {
          url += `?${queryString.toString()}`;
        }
        return await this.fetch(url, options);
      })
      .catch(function (error) {
        if (error instanceof HttpError) {
          throw error;
        }
        const _error = error.cause ? error.cause : error;
        throw new HttpError(_error.message, {
          code: _error.code
        });
      })
      .asCallback(callback);
  }
}

export default FetchAdapter;
