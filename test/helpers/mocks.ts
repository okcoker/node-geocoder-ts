import { HTTPAdapter } from 'types';

export function buildHttpAdapter(overrides = {}): HTTPAdapter {
  return {
    supportsHttps() {
      return true
    },

    get() {

    },

    post() {

    },
    ...overrides
  }
};
