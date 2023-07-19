var util                  = require('util'),
  // @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'OpenStreet... Remove this comment to see the full error message
  OpenStreetMapGeocoder   = require('./openstreetmapgeocoder');

/**
 * Constructor
 */
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'PickPointG... Remove this comment to see the full error message
var PickPointGeocoder = function PickPointGeocoder(this: any, httpAdapter: any, options: any) {
  // @ts-expect-error TS(2339): Property 'super_' does not exist on type '(this: a... Remove this comment to see the full error message
  PickPointGeocoder.super_.call(this, httpAdapter, options);

  if (!httpAdapter.supportsHttps()) {
    throw new Error('You must use https http adapter');
  }

  if (!this.options.apiKey || this.options.apiKey == 'undefined') {
    throw new Error(this.constructor.name + ' needs an apiKey');
  }

  this.options.key = this.options.apiKey;
};

util.inherits(PickPointGeocoder, OpenStreetMapGeocoder);

PickPointGeocoder.prototype._endpoint = 'https://api.pickpoint.io/v1/forward';
PickPointGeocoder.prototype._endpoint_reverse = 'https://api.pickpoint.io/v1/reverse';

export default PickPointGeocoder;
