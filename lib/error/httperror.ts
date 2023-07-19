var util = require('util');

// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'HttpError'... Remove this comment to see the full error message
var HttpError = function(this: any, message: any, options: any) {
    Error.call(this);
    Error.captureStackTrace(this, this.constructor);

    this.name = 'HttpError';
    this.message = message;

    options = options || {};

    for(var k in options) {
      this[k] = this[k] || options[k];
    }
};

util.inherits(HttpError, Error);

export default HttpError;
