
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'HttpError'... Remove this comment to see the full error message
const HttpError = require('../error/httperror.js');
const nodeFetch = require('node-fetch');
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'BPromise'.
const BPromise = require('bluebird');

// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'FetchAdapt... Remove this comment to see the full error message
class FetchAdapter {
  fetch: any;
  options: any;
  constructor(options = {}) {
    // @ts-expect-error TS(2339): Property 'fetch' does not exist on type '{}'.
    this.fetch = options.fetch || nodeFetch;
    this.options = { ...options };
    delete this.options.fetch;
  }

  supportsHttps() {
    return true;
  }

  get(url: any, params: any, callback: any, fullResponse = false) {
    var options = {
      headers: {
        'user-agent': 'Mozilla/5.0 (X11; Linux i586; rv:31.0) Gecko/20100101 Firefox/31.0',
        'accept': 'application/json;q=0.9, */*;q=0.1'
      }
    };

    if (this.options) {
      for (var k in this.options) {
        var v = this.options[k];
        if (!v) {
          continue;
        }
        // @ts-expect-error TS(7053): Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
        options[k] = v;
      }
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
          // @ts-expect-error TS(7009): 'new' expression, whose target lacks a construct s... Remove this comment to see the full error message
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
        // @ts-expect-error TS(7009): 'new' expression, whose target lacks a construct s... Remove this comment to see the full error message
        throw new HttpError(_error.message, {
          code: _error.code
        });
      })
      .asCallback(callback);
  }

  post(url: any, params: any, options: any, callback: any) {
    options.method = 'POST';
    options.headers = options.headers || {};
    options.headers['user-agent'] = 'Mozilla/5.0 (X11; Linux i586; rv:31.0) Gecko/20100101 Firefox/31.0';
    if (this.options) {
      for (var k in this.options) {
        var v = this.options[k];
        if (!v) {
          continue;
        }
        options[k] = v;
      }
    }
    return BPromise.resolve()
      .then(async () => {
        const queryString = new URLSearchParams(params);
        if (queryString.toString()) {
          url += `?${queryString.toString()}`;
        }
        return await this.fetch(
          url,
          options
        );
      })
      .catch(function(error: any) {
        if (error instanceof HttpError) {
          throw error;
        }
        const _error = error.cause ? error.cause : error;
        // @ts-expect-error TS(7009): 'new' expression, whose target lacks a construct s... Remove this comment to see the full error message
        throw new HttpError(_error.message, {
          code: _error.code
        });
      })
      .asCallback(callback);
  }
}

export default FetchAdapter;
