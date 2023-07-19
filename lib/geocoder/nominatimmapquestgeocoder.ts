var util                  = require('util'),
    // @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'OpenStreet... Remove this comment to see the full error message
    OpenStreetMapGeocoder = require('./openstreetmapgeocoder');

/**
 * Constructor
 */
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'NominatimM... Remove this comment to see the full error message
var NominatimMapquestGeocoder = function NominatimMapquestGeocoder(this: any, httpAdapter: any, options: any) {
    // @ts-expect-error TS(2339): Property 'super_' does not exist on type '(this: a... Remove this comment to see the full error message
    NominatimMapquestGeocoder.super_.call(this, httpAdapter, options);

    if (!this.options.apiKey || this.options.apiKey == 'undefined') {
      throw new Error(this.constructor.name + ' needs an apiKey');
    }
    this.options.key = this.options.apiKey;
    delete this.options.apiKey;
};

util.inherits(NominatimMapquestGeocoder, OpenStreetMapGeocoder);

NominatimMapquestGeocoder.prototype._endpoint = 'http://open.mapquestapi.com/nominatim/v1/search';
NominatimMapquestGeocoder.prototype._endpoint_reverse = 'http://open.mapquestapi.com/nominatim/v1/reverse';


export default NominatimMapquestGeocoder;
