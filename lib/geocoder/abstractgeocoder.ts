import net from 'net';
import ValueError from 'lib/error/valueerror';
import type {
  HTTPAdapter,
  Location,
  AbstractGeocoderAdapter,
  ResultCallback,
  BatchResultCallback,
  GeocodeValue,
  MaybeResultMaybeError,
  BaseAdapterOptions,
  Result,
  BatchResult
} from 'types';

abstract class BaseAbstractGeocoderAdapter<T extends BaseAdapterOptions>
  implements AbstractGeocoderAdapter<T>
{
  name: T['provider'];
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

  reverse(query: Location): Promise<Result> {
    const customReverse = this._reverse?.bind(this);
    if (typeof customReverse !== 'function') {
      throw new ValueError(
        this.constructor.name + ' does not support reverse geocoding'
      );
    }

    return new Promise((resolve, reject) => {
      customReverse(query, (err, result) => {
        if (err) {
          reject(err);
          return;
        }

        // Have to cast here because the ResultCallback interface
        // isnt perfect
        resolve(result as Result);
      });
    });
  }

  geocode(value: GeocodeValue): Promise<Result> {
    const address = typeof value === 'string' ? value : `${value.address}`;
    const customGeocode = this._geocode?.bind(this);

    if (typeof customGeocode !== 'function') {
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

    return new Promise((resolve, reject) => {
      customGeocode(value, (err, result) => {
        if (err) {
          reject(err);
          return;
        }

        // Have to cast here because the ResultCallback interface
        // isnt perfect
        resolve(result as Result);
      });
    });
  }

  batchGeocode(values: GeocodeValue[]): Promise<BatchResult> {
    const customBatch = this._batchGeocode?.bind(this);

    if (typeof customBatch === 'function') {
      return new Promise((resolve, reject) => {
        customBatch(values, (error, result) => {
          if (error) {
            reject(error);
            return;
          }

          // Have to cast here because the BatchResultCallback interface
          // isnt perfect
          resolve(result as BatchResult);
        });
      })
    }

    const promises = values.map((value: any) => {
      return new Promise<MaybeResultMaybeError>(resolve => {
        this.geocode(value).then((result) => {
          resolve({
            error: null,
            data: result
          });
        }).catch((error) => {
          resolve({
            error,
            data: null
          })
        })
      });
    });

    return Promise.all(promises).then((data) => {
      return {
        data
      };
    });
  }
}

export default BaseAbstractGeocoderAdapter;
