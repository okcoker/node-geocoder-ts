import net from 'net';
import ValueError from '../error/valueerror';
import type {
  HTTPAdapter,
  Location,
  AbstractGeocoder,
  ResultCallback,
  BatchResultCallback,
  GeocodeValue,
  BatchResult,
  BaseOptions
} from '../../types';

abstract class BaseAbstractGeocoder<T extends BaseOptions>
  implements AbstractGeocoder {
  name: string;
  httpAdapter: HTTPAdapter;
  supportIPv6: boolean;
  supportIPv4: boolean;
  supportAddress: boolean;
  options: T;

  _geocode?(value: GeocodeValue, callback: ResultCallback): void;
  _reverse?(value: Location, callback: ResultCallback): void;
  _batchGeocode?(values: GeocodeValue[], callback: BatchResultCallback): void;

  constructor(httpAdapter: HTTPAdapter, options: T) {
    if (!this.constructor.name) {
      throw new Error('The Constructor must be named');
    }

    this.name = options.provider;

    if (!httpAdapter) {
      throw new Error(this.constructor.name + ' need an httpAdapter');
    }

    this.httpAdapter = httpAdapter;

    this.supportIPv6 = false;
    this.supportIPv4 = false;
    this.supportAddress = true;
    this.options = options;
  }

  reverse(query: Location, callback: ResultCallback) {
    if (typeof this._reverse !== 'function') {
      throw new ValueError(
        this.constructor.name + ' does not support reverse geocoding'
      );
    }

    this._reverse(query, callback);
  }

  geocode(value: GeocodeValue, callback: ResultCallback) {
    const address = typeof value === 'string' ? value : `${value.address}`;

    if (typeof this._geocode !== 'function') {
      throw new ValueError(
        this.constructor.name + ' does not support geocoding'
      );
    }

    if (net.isIPv4(address) && !this.supportIPv4) {
      throw new ValueError(
        this.constructor.name + ' does not support geocoding IPv4'
      );
    }

    if (net.isIPv6(address) && !this.supportIPv6) {
      throw new ValueError(
        this.constructor.name + ' does not support geocoding IPv6'
      );
    }

    if (
      this.supportAddress === false &&
      !net.isIPv4(address) &&
      !net.isIPv6(address)
    ) {
      throw new ValueError(
        this.constructor.name + ' does not support geocoding address'
      );
    }

    return this._geocode(value, callback);
  }

  /**
   * Batch Geocode
   * @param <string[]>   values    Valueas to geocode
   * @param <function> callback Callback method
   */
  batchGeocode(values: GeocodeValue[], callback: BatchResultCallback) {
    if (typeof this._batchGeocode === 'function') {
      this._batchGeocode(values, callback);
    } else {
      const promises = values.map((value: any) => {
        return new Promise<BatchResult>(resolve => {
          this.geocode(value, (error, result) => {
            resolve({
              error,
              data: result
            } as BatchResult);
          });
        });
      });

      Promise.all(promises).then(data => callback(null, data));
    }
  }
}

export default BaseAbstractGeocoder;
