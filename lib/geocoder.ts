import type {
  Formatter,
  Location,
  GeocodeValue,
  AbstractGeocoder,
  ResultFormatted,
  Result,
  ResultWithProvider,
  ResultDataWithProvider,
  BatchResult,
  BatchResultWithProvider,
  BatchResultFormatted,
  AbstractGeocoderAdapter
} from 'types';
import { Provider, providers } from 'lib/providers';

class Geocoder implements AbstractGeocoder {
  _adapter: AbstractGeocoderAdapter;
  _formatter?: Formatter<any>;

  /**
   * Constructor
   * @param <object> geocoder  Geocoder Adapter
   * @param <object> formatter Formatter adapter or null
   */
  constructor(adapter: AbstractGeocoderAdapter, formatter?: Formatter<any>) {
    this._adapter = adapter;
    this._formatter = formatter;
  }

  /**
   * Geocode a value (address or ip)
   */
  geocode(
    value: GeocodeValue
  ): Promise<ResultWithProvider | Result | ResultFormatted> {
    return new Promise((resolve, reject) => {
      this._adapter.geocode(value, (err: any, result: Result | null) => {
        if (err) {
          reject(err);
          return;
        }

        // This shouldnt happen but the ResultCallback interface type isn't perfect
        if (!result) {
          reject(new Error('Unexpected error with the result'));
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
  ): Promise<ResultWithProvider | Result | ResultFormatted> {
    return new Promise((resolve, reject) => {
      this._adapter.reverse(query, (err: any, result: Result | null) => {
        if (err) {
          reject(err);
          return;
        }

        // This shouldnt happen but the ResultCallback interface type isn't perfect
        if (!result) {
          reject(new Error('Unexpected error with the result'));
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
  ): Promise<BatchResultWithProvider | BatchResult | BatchResultFormatted> {
    return new Promise((resolve, reject) => {
      this._adapter.batchGeocode(
        values,
        (err: any, result: BatchResult | null) => {
          if (err) {
            reject(err);
            return;
          }

          // This shouldnt happen but the BatchResultCallback interface type isn't perfect
          if (!result) {
            reject(new Error('Unexpected error with the result'));
            return;
          }

          const filtered = this._batchFilter(values, result);
          const formatted = this._batchFormat(filtered);

          resolve(formatted);
        }
      );
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
        if (
          typeof confidence === 'number' &&
          typeof valueConfidence === 'number'
        ) {
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
  ): Result | ResultWithProvider | ResultFormatted {
    if (!result.data) {
      return result;
    }

    const newData: ResultDataWithProvider[] = result.data.map(data => {
      return {
        ...data,
        provider: this._adapter.name
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

  // There's probably a better way to type this
  private _batchFormat(
    batchResult: BatchResult
  ): BatchResult | BatchResultWithProvider | BatchResultFormatted {
    if (batchResult.data === null) {
      return batchResult;
    }

    const formatted = batchResult.data.map(result => {
      if (result.data) {
        const formattedData = this._format(result.data);

        return {
          data: formattedData,
          error: null
        };
      }

      return {
        data: null,
        error: result.error
      };
    });

    if (isBatchResultFormatted(formatted)) {
      return formatted;
    }

    if (isBatchResultWithProvider(formatted)) {
      return formatted;
    }

    return batchResult;
  }

  private _batchFilter(
    values: GeocodeValue[],
    batchResult: BatchResult
  ): BatchResult {
    if (batchResult.data === null) {
      return batchResult;
    }

    const results = batchResult.data.map((batchResult, i) => {
      return {
        data: batchResult.data
          ? this._filter(values[i], batchResult.data)
          : null,
        error: batchResult.error
      };
    });

    return {
      data: results
    };
  }
}

function isBatchResultFormatted(obj: any): obj is BatchResultFormatted {
  return (
    obj.data &&
    Array.isArray(obj.data) &&
    obj.data.some((result: any) => {
      return isResultFormatted(result);
    })
  );
}

function isBatchResultWithProvider(obj: any): obj is BatchResultWithProvider {
  return (
    obj.data &&
    Array.isArray(obj.data) &&
    obj.data.some((result: any) => {
      return isResultWithProvider(result);
    })
  );
}

function isResultFormatted(
  obj: Result | ResultWithProvider | ResultFormatted
): obj is ResultFormatted {
  return (
    Array.isArray(obj.data) &&
    (typeof obj.data[0] === 'string' ||
      (Array.isArray(obj.data[0]) && typeof obj.data[0][0] === 'string'))
  );
}

function isProvider(obj: any): obj is Provider {
  return providers.includes(obj);
}

function isResultWithProvider(
  obj: Result | ResultWithProvider | ResultFormatted
): obj is ResultWithProvider {
  return (
    Array.isArray(obj.data) &&
    typeof obj.data[0] !== 'string' &&
    isProvider(obj.data[0]?.provider)
  );
}

// function isResultFormattedArray(
//   obj: (Result | ResultWithProvider | ResultFormatted)[]
// ): obj is ResultFormatted[] {
//   return obj[0] && isResultFormatted(obj[0]);
// }

// function isResultWithProviderArray(
//   obj: (Result | ResultWithProvider | ResultFormatted)[]
// ): obj is ResultWithProvider[] {
//   return obj[0] && isResultWithProvider(obj[0]);
// }

export default Geocoder;
