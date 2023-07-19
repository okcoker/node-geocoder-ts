var util = require('util');

// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'ValueError... Remove this comment to see the full error message
var ValueError = function(this: any, message: any) {
    Error.call(this);
    Error.captureStackTrace(this, this.constructor);

    this.name = 'ValueError';
    this.message = message;
};

util.inherits(ValueError, Error);

export default ValueError;
