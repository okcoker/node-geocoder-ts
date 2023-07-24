import { AbstractGeocoderAdapter } from 'types';

class ResultError extends Error {
  constructor(adapter: AbstractGeocoderAdapter<any>) {
    const message = `No result returned from ${adapter.name}`;

    super(message);

    Error.captureStackTrace(this, this.constructor);

    this.name = 'ResultError';
    this.message = message;
  }
}

export default ResultError;
