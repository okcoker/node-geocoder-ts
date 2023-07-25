import net from 'net';
import ValueError from 'src/utils/error/ValueError';
import type {
  HTTPAdapter,
  ReverseQuery,
  AbstractGeocoderAdapter,
  GeocodeQuery,
  MaybeResultMaybeError,
  BaseAdapterOptions,
  Result,
  BatchResult
} from 'src/types';

abstract class BaseAbstractProviderAdapter<T extends BaseAdapterOptions>
  implements AbstractGeocoderAdapter<T>
{
  name: T['provider'];
  httpAdapter: HTTPAdapter;
  supportIPv6: boolean;
  supportIPv4: boolean;
  supportAddress: boolean;
  options: T;

  _geocode?(query: GeocodeQuery): Promise<Result>;
  _reverse?(query: ReverseQuery): Promise<Result>;
  _batchGeocode?(queries: GeocodeQuery[]): Promise<BatchResult>;

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

  async reverse(query: ReverseQuery): Promise<Result> {
    const customReverse = this._reverse?.bind(this);

    if (typeof customReverse !== 'function') {
      throw new Error(
        this.constructor.name + ' does not support reverse geocoding'
      );
    }

    return customReverse(query);
  }

  async geocode(query: GeocodeQuery): Promise<Result> {
    const address = typeof query === 'string' ? query : `${query.address}`;
    const customGeocode = this._geocode?.bind(this);

    if (typeof customGeocode !== 'function') {
      throw new Error(
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

    return customGeocode(query);
  }

  async batchGeocode(queries: GeocodeQuery[]): Promise<BatchResult> {
    const customBatch = this._batchGeocode?.bind(this);

    if (typeof customBatch === 'function') {
      return customBatch(queries);
    }

    const promises = queries.map((value: any) => {
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

    const allResults = await Promise.all(promises);

    return {
      data: allResults
    };
  }
}

export default BaseAbstractProviderAdapter;
