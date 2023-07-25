class HttpError extends Error {
  constructor(message: any, options: any) {
    super(message);

    Error.captureStackTrace(this, this.constructor);

    this.name = 'HttpError';
    this.message = message;

    options = options || {};

    for (const k in options) {
      // @ts-expect-error ts(7053)
      this[k] = this[k] || options[k];
    }
  }
}

export default HttpError;
