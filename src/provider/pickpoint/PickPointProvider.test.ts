import PickPointProvider from 'src/provider/pickpoint/PickPointProvider';
import { buildHttpAdapter } from 'src/utils/test/mocks';
import { HTTPAdapter } from 'src/types';

const mockedHttpAdapter = buildHttpAdapter();

describe('PickPointProvider', () => {
  describe('#constructor', () => {
    test('should be an instance of PickPointProvider', () => {
      const adapter = new PickPointProvider(mockedHttpAdapter, {
        apiKey: 'API_KEY'
      });
      expect(adapter).toBeInstanceOf(PickPointProvider);
    });

    test('an http adapter must be set', () => {
      expect(() => {
        new PickPointProvider('' as unknown as HTTPAdapter);
      }).toThrow('PickPointProvider need an httpAdapter');
    });

    test('the adapter should support https', () => {
      expect(() => {
        new PickPointProvider(buildHttpAdapter({
          supportsHttps() { return false }
        }));
      }).toThrow('You must use https http adapter');
    });

    test('an apiKey must be set', () => {
      expect(() => {
        new PickPointProvider(mockedHttpAdapter);
      }).toThrow('PickPointProvider needs an apiKey');
    });
  });
});
