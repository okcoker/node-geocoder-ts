import type {
  Formatter,
  ReverseQuery,
  GeocodeQuery,
  AbstractGeocoder,
  ResultFormatted,
  Result,
  ResultWithProvider,
  ResultDataWithProvider,
  BatchResult,
  BatchResultWithProvider,
  BatchResultFormatted,
  AbstractGeocoderAdapter,
  AllResultTypes,
  AllBatchResultTypes
} from 'types';
import { Provider, providers } from 'lib/providers';
import { AllAdapterOptions } from './geocoderfactory';

class Geocoder<T extends Provider> implements AbstractGeocoder<T> {
  _adapter: AbstractGeocoderAdapter<
    Extract<AllAdapterOptions, { provider: T }>
  >;
  _formatter?: Formatter<any>;

  constructor(
    adapter: AbstractGeocoderAdapter<
      Extract<AllAdapterOptions, { provider: T }>
    >,
    formatter?: Formatter<any>
  ) {
    this._adapter = adapter;
    this._formatter = formatter;
  }

  /**
   * Geocode a value (address or ip)
   */
  async geocode(
    value: GeocodeQuery
  ): Promise<AllResultTypes> {
    const result = await this._adapter.geocode(value);
    const filtered = this._filter(value, result);
    const formatted = this._format(filtered);

    return formatted;
  }

  async reverse(
    query: ReverseQuery
  ): Promise<AllResultTypes> {
    const result = await this._adapter.reverse(query);
    const formatted = this._format(result);

    return formatted;
  }

  /**
   * Batch geocode
   */
  async batchGeocode(
    values: GeocodeQuery[]
  ): Promise<AllBatchResultTypes> {
    const result = await this._adapter.batchGeocode(
      values
    );
    const filtered = this._batchFilter(values, result);
    const formatted = this._batchFormat(filtered);

    return formatted;
  }

  private _filter(value: GeocodeQuery, result: Result): Result {
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
        // @todo make this better
        const extraAttrs = geocodedAddress?.extra as { confidence?: number };
        const confidence = extraAttrs.confidence;
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
    values: GeocodeQuery[],
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

export function isBatchResultFormatted(obj: any): obj is BatchResultFormatted {
  return (
    obj.data &&
    Array.isArray(obj.data) &&
    obj.data.some((result: any) => {
      return isResultFormatted(result);
    })
  );
}

export function isBatchResultWithProvider(obj: any): obj is BatchResultWithProvider {
  return (
    obj.data &&
    Array.isArray(obj.data) &&
    obj.data.some((result: any) => {
      return isResultWithProvider(result);
    })
  );
}

export function isResultFormatted(
  obj: Result | ResultWithProvider | ResultFormatted
): obj is ResultFormatted {
  return (
    Array.isArray(obj.data) &&
    (typeof obj.data[0] === 'string' ||
      (Array.isArray(obj.data[0]) && typeof obj.data[0][0] === 'string'))
  );
}

export function isResultWithProvider(
  obj: Result | ResultWithProvider | ResultFormatted
): obj is ResultWithProvider {
  return (
    Array.isArray(obj.data) &&
    typeof obj.data[0] !== 'string' &&
    isProvider(obj.data[0]?.provider)
  );
}

export function isProvider(obj: any): obj is Provider {
  return providers.includes(obj);
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
