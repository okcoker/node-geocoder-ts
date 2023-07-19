
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'BPromise'.
var BPromise = require('bluebird');

/**
* Constructor
* @param <object> geocoder  Geocoder Adapter
* @param <object> formatter Formatter adapter or null
*/
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'Geocoder'.
var Geocoder = function(this: any, geocoder: any, formatter: any) {
  this._geocoder = geocoder;
  this._formatter = formatter;
};

/**
* Geocode a value (address or ip)
* @param <string>   value    Value to geocoder (address or IP)
* @param <function> callback Callback method
*/
Geocoder.prototype.geocode = function (value: any, callback: any) {
  return BPromise.resolve()
    .bind(this)
    .then(function(this: any) {
      return BPromise.fromCallback(function(this: any, callback: any) {
        this._geocoder.geocode(value, callback);
      }.bind(this));
    })
    .then(function(this: any, data: any) {
      return this._filter(value, data);
    })
    .then(function(this: any, data: any) {
      return this._format(data);
    })
    .asCallback(callback);
};

/**
* Reverse geocoding
* @param {lat:<number>,lon:<number>}  lat: Latitude, lon: Longitude
* @param {function} callback Callback method
*/
Geocoder.prototype.reverse = function(query: any, callback: any) {
  return BPromise.resolve()
    .bind(this)
    .then(function(this: any) {
      return BPromise.fromCallback(function(this: any, callback: any) {
        this._geocoder.reverse(query, callback);
      }.bind(this));
    })
    .then(function(this: any, data: any) {
      return this._format(data);
    })
    .asCallback(callback);
};

/**
* Batch geocode
* @param <array>    values    array of Values to geocode (address or IP)
* @param <function> callback
*
* @return promise
*/
Geocoder.prototype.batchGeocode = function(values: any, callback: any) {
  return BPromise.resolve()
    .bind(this)
    .then(function(this: any) {
      return BPromise.fromCallback(function(this: any, callback: any) {
        this._geocoder.batchGeocode(values, callback);
      }.bind(this));
    })
    .asCallback(callback);
};

Geocoder.prototype._filter = function (value: any, data: any) {
  if (!data || !data.length) {
    return data;
  }

  if (value.minConfidence) {
    data = data.filter(function(geocodedAddress: any) {
      if (geocodedAddress.extra && geocodedAddress.extra.confidence) {
        return geocodedAddress.extra.confidence >= value.minConfidence;
      }
    });
  }

  return data;
};

Geocoder.prototype._format = function (data: any) {
  var _this = this;
  return BPromise.resolve()
    .bind(this)
    .then(function() {
      if (!data) {
        return data;
      }

      var _raw = data.raw;

      data = data.map(function(result: any) {
        result.provider = _this._geocoder.name;

        return result;
      });

      data.raw = _raw;
      Object.defineProperty(data,'raw',{configurable:false, enumerable:false, writable:false});

      return data;
    })
    .then(function(this: any, data: any) {
      var _data = data;
      if (this._formatter && this._formatter !== 'undefined') {
        _data = this._formatter.format(_data);
      }

      return _data;
    });
};

export default Geocoder;
