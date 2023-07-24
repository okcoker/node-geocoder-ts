import PickPointGeocoder from 'lib/geocoder/pickpointgeocoder';
import { buildHttpAdapter } from 'test/helpers/mocks';
import { HTTPAdapter } from 'types';

const mockedHttpAdapter = buildHttpAdapter();

describe('PickPointGeocoder', () => {
  describe('#constructor', () => {
    test('should be an instance of PickPointGeocoder', () => {
      const adapter = new PickPointGeocoder(mockedHttpAdapter, {
        apiKey: 'API_KEY'
      });
      expect(adapter).toBeInstanceOf(PickPointGeocoder);
    });

    test('an http adapter must be set', () => {
      expect(() => {
        new PickPointGeocoder('' as unknown as HTTPAdapter);
      }).toThrow('PickPointGeocoder need an httpAdapter');
    });

    test('the adapter should support https', () => {
      expect(() => {
        new PickPointGeocoder(buildHttpAdapter({
          supportsHttps() { return false }
        }));
      }).toThrow('You must use https http adapter');
    });

    test('an apiKey must be set', () => {
      expect(() => {
        new PickPointGeocoder(mockedHttpAdapter);
      }).toThrow('PickPointGeocoder needs an apiKey');
    });
  });
});
