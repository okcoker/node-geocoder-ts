import type { ResultData, Formatter, BaseFormatterOptions } from '../../types';

export interface Options extends BaseFormatterOptions {
  name: 'string';
  pattern: string;
}

class StringFormatter implements Formatter<Options> {
  options: Omit<Options, 'name'>;

  constructor(options: Omit<Options, 'name'>) {
    if (!options.pattern) {
      throw new Error('StringFormatter need a pattern');
    }

    this.options = options;
  }

  format(data: ResultData[]): string[] {
    return data.map(entry => {
      return this.options.pattern
        .replace(/%n/, entry.streetNumber || '')
        .replace(/%S/, entry.streetName || '')
        .replace(/%z/, entry.zipcode || '')
        .replace(/%P/, entry.country || '')
        .replace(/%p/, entry.countryCode || '')
        .replace(/%c/, entry.city || '')
        .replace(/%T/, entry.state || '')
        .replace(/%t/, entry.stateCode || '');
    });
  }
}

export default StringFormatter;
