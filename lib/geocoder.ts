import {
  Formatter,
  Result,
  Location,
  GeocodeValue,
  AbstractGeocoder,
  FormattedResult,
  ResultWithProvider,
  ResultDataWithProvider
} from '../types';

class Geocoder {
  _geocoder: typeof AbstractGeocoder;
  _formatter?: Formatter<any>;

  /**
   * Constructor
   * @param <object> geocoder  Geocoder Adapter
   * @param <object> formatter Formatter adapter or null
   */
  constructor(geocoder: AbstractGeocoder, formatter?: Formatter<any>) {
    this._geocoder = geocoder;
    this._formatter = formatter;
  }

  /**
   * Geocode a value (address or ip)
   */
  geocode(
    value: GeocodeValue
  ): Promise<ResultWithProvider | Result | FormattedResult> {
    return new Promise((resolve, reject) => {
      this._geocoder.geocode(value, (err, result) => {
        if (err) {
          reject(err);
          return;
        }

        const filtered = this._filter(value, result);
        const formatted = this._format(filtered);

        resolve(formatted);
      });
    });
  }

  reverse(
    query: Location
  ): Promise<ResultWithProvider | Result | FormattedResult> {
    return new Promise((resolve, reject) => {
      this._geocoder.reverse(query, (err, result) => {
        if (err) {
          reject(err);
          return;
        }

        const formatted = this._format(result);

        resolve(formatted);
      });
    });
  }

  /**
   * Batch geocode
   * @param <array>    values    array of Values to geocode (address or IP)
   * @param <function> callback
   *
   * @return promise
   */
  batchGeocode(
    values: GeocodeValue[]
  ): Promise<(ResultWithProvider | Result | FormattedResult)[]> {
    return new Promise((resolve, reject) => {
      this._geocoder.batchGeocode(values, (err, result) => {
        if (err) {
          reject(err);
          return;
        }

        const filtered = this._batchFilter(values, result);
        const formatted = this._batchFormat(filtered);

        resolve(formatted);
      });
    });
  }

  private _filter(value: GeocodeValue, result: Result): Result {
    if (!result.data || !result.data.length) {
      return result;
    }

    let data = result.data;
    if (typeof value !== 'string' && value.minConfidence) {
      const valueConfidence =
        typeof value.minConfidence === 'string'
          ? parseInt(value.minConfidence)
          : value.minConfidence;

      data = data.filter(geocodedAddress => {
        const confidence = geocodedAddress?.extra?.confidence;
        if (typeof confidence === 'number') {
          return confidence >= valueConfidence;
        }
        return true;
      });
    }

    return {
      ...result,
      data: data
    };
  }

  private _format(
    result: Result
  ): Result | ResultWithProvider | FormattedResult {
    if (!result.data) {
      return result;
    }

    const newData: ResultDataWithProvider[] = result.data.map(data => {
      return {
        ...data,
        provider: this._geocoder.name
      };
    });

    if (this._formatter) {
      return {
        data: this._formatter.format(newData),
        raw: result.raw
      };
    }

    const newResult = {
      raw: result.raw,
      data: newData
    };

    return newResult;
  }

  private _batchFormat(
    results: Result[]
  ): (Result | ResultWithProvider | FormattedResult)[] {
    return results.map(result => this._format(result));
  }

  private _batchFilter(values: GeocodeValue[], results: Result[]): Result[] {
    return results.map((result, i) => this._filter(values[i], result));
  }
}

export default Geocoder;
