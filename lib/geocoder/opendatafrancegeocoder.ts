var util             = require('util'),
    // @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'AbstractGe... Remove this comment to see the full error message
    AbstractGeocoder = require('./abstractgeocoder');

/**
 * Constructor
 */
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'OpendataFr... Remove this comment to see the full error message
var OpendataFranceGeocoder = function OpendataFranceGeocoder(this: any, httpAdapter: any, options: any) {
    this.options = ['language','email','apiKey'];

    // @ts-expect-error TS(2339): Property 'super_' does not exist on type '(this: a... Remove this comment to see the full error message
    OpendataFranceGeocoder.super_.call(this, httpAdapter, options);
};

util.inherits(OpendataFranceGeocoder, AbstractGeocoder);

OpendataFranceGeocoder.prototype._endpoint = 'https://api-adresse.data.gouv.fr/search';

OpendataFranceGeocoder.prototype._endpoint_reverse = 'https://api-adresse.data.gouv.fr/reverse';

/**
* Geocode
* @param <string|object>   value    Value to geocode (Address or parameters, as specified at https://opendatafrance/api/)
* @param <function> callback Callback method
*/
OpendataFranceGeocoder.prototype._geocode = function(value: any, callback: any) {
    var _this = this;

    var params = this._getCommonParams();

    if (typeof value == 'string') {
      params.q = value;
    } else {
      if (value.address) {
        params.q = value.address;
      }
      if (value.lat && value.lon) {
        params.lat = value.lat;
        params.lon = value.lon;
      }
      if (value.zipcode) {
        params.postcode = value.zipcode;
      }
      if (value.type) {
        params.type = value.type;
      }
      if (value.citycode) {
        params.citycode = value.citycode;
      }
      if (value.limit) {
        params.limit = value.limit;
      }
    }

    this.httpAdapter.get(this._endpoint, params, function(err: any, result: any) {
        if (err) {
            return callback(err);
        } else {

            if (result.error) {
              return callback(new Error(result.error));
            }

            var results = [];

            if (result.features) {
              for (var i = 0; i < result.features.length; i++) {
                results.push(_this._formatResult(result.features[i]));
              }
            }

            // @ts-expect-error TS(2339): Property 'raw' does not exist on type 'any[]'.
            results.raw = result;
            callback(false, results);
        }

    });

};

OpendataFranceGeocoder.prototype._formatResult = function(result: any) {

    var latitude = result.geometry.coordinates[1];
    if (latitude) {
      latitude = parseFloat(latitude);
    }

    var longitude = result.geometry.coordinates[0];
    if (longitude) {
      longitude = parseFloat(longitude);
    }

    var properties = result.properties;

    var formatedResult = {
        latitude : latitude,
        longitude : longitude,
        state : properties.context,
        city : properties.city,
        zipcode : properties.postcode,
        citycode : properties.citycode,
        countryCode : 'FR',
        country : 'France',
        type: properties.type,
        id: properties.id
    };

    if (properties.type === 'housenumber') {
      // @ts-expect-error TS(2339): Property 'streetName' does not exist on type '{ la... Remove this comment to see the full error message
      formatedResult.streetName = properties.street;
      // @ts-expect-error TS(2339): Property 'streetNumber' does not exist on type '{ ... Remove this comment to see the full error message
      formatedResult.streetNumber = properties.housenumber;
    } else if (properties.type === 'street') {
      // @ts-expect-error TS(2339): Property 'streetName' does not exist on type '{ la... Remove this comment to see the full error message
      formatedResult.streetName = properties.name;
    } else if (properties.type === 'city') {
      // @ts-expect-error TS(2339): Property 'population' does not exist on type '{ la... Remove this comment to see the full error message
      formatedResult.population = properties.population;
      // @ts-expect-error TS(2339): Property 'adm_weight' does not exist on type '{ la... Remove this comment to see the full error message
      formatedResult.adm_weight = properties.adm_weight;
    } else if (properties.type === 'village') {
      // @ts-expect-error TS(2339): Property 'population' does not exist on type '{ la... Remove this comment to see the full error message
      formatedResult.population = properties.population;
    } else if (properties.type === 'locality') {
      // @ts-expect-error TS(2339): Property 'streetName' does not exist on type '{ la... Remove this comment to see the full error message
      formatedResult.streetName = properties.name;
    }

    return formatedResult;
};

/**
* Reverse geocoding
* @param {lat:<number>,lon:<number>, ...}  lat: Latitude, lon: Longitude, ... see https://wiki.openstreetmap.org/wiki/Nominatim#Parameters_2
* @param <function> callback Callback method
*/
OpendataFranceGeocoder.prototype._reverse = function(query: any, callback: any) {

    var _this = this;

    var params = this._getCommonParams();
    for (var k in query) {
      var v = query[k];
      params[k] = v;
    }

    this.httpAdapter.get(this._endpoint_reverse , params, function(err: any, result: any) {
        if (err) {
            return callback(err);
        } else {

          if(result.error) {
            return callback(new Error(result.error));
          }

          var results = [];

          if (result.features) {
            for (var i = 0; i < result.features.length; i++) {
              results.push(_this._formatResult(result.features[i]));
            }
          }

          // @ts-expect-error TS(2339): Property 'raw' does not exist on type 'any[]'.
          results.raw = result;
          callback(false, results);
        }
    });
};

/**
* Prepare common params
*
* @return <Object> common params
*/
OpendataFranceGeocoder.prototype._getCommonParams = function(){
    var params = {};

    for (var k in this.options) {
      var v = this.options[k];
      if (!v) {
        continue;
      }
      if (k === 'language') {
        k = 'accept-language';
      }
      // @ts-expect-error TS(7053): Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
      params[k] = v;
    }

    return params;
};

export default OpendataFranceGeocoder;
