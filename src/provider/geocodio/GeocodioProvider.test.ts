import ValueError from 'src/utils/error/ValueError';
import GeocodioProvider from 'src/provider/geocodio/GeocodioProvider';
import { buildHttpAdapter } from 'src/utils/test/mocks';
import { verifyHttpAdapter } from 'src/utils/test/helpers';
import { HTTPAdapter } from 'src/types';

const mockedHttpAdapter = buildHttpAdapter();
const defaultResponse = {
  results: []
};

describe('GeocodioProvider', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });
  describe('#constructor', () => {
    test('an http adapter must be set', () => {
      expect(() => {
        new GeocodioProvider('' as unknown as HTTPAdapter, { apiKey: '' });
      }).toThrow('GeocodioProvider need an httpAdapter');
    });

    test('an apiKey must be set', () => {
      expect(() => {
        new GeocodioProvider(mockedHttpAdapter, { apiKey: '' });
      }).toThrow('GeocodioProvider needs an apiKey');
    });

    test('Should be an instance of GeocodioProvider', () => {
      const adapter = new GeocodioProvider(mockedHttpAdapter, {
        apiKey: 'API_KEY'
      });

      expect(adapter).toBeInstanceOf(GeocodioProvider);
    });
  });

  describe('#geocode', () => {
    test('Should not accept IPv4', async () => {
      const adapter = new GeocodioProvider(mockedHttpAdapter, {
        apiKey: 'API_KEY'
      });

      await expect(
        adapter.geocode('127.0.0.1')
      ).rejects.toEqual(new ValueError('GeocodioProvider does not support geocoding IPv4'));
    });

    test('Should not accept IPv6', async () => {
      const adapter = new GeocodioProvider(mockedHttpAdapter, {
        apiKey: 'API_KEY'
      });

      await expect(
        adapter.geocode('2001:0db8:0000:85a3:0000:0000:ac1f:8001')
      ).rejects.toEqual(new ValueError('GeocodioProvider does not support geocoding IPv6'));
    });
  });

  describe('#reverse', () => {
    test('Should call httpAdapter get method', async () => {
      const adapter = new GeocodioProvider(mockedHttpAdapter, {
        apiKey: 'API_KEY'
      });

      await verifyHttpAdapter({
        adapter,
        async work() {
          await adapter.reverse({ lat: 10.0235, lon: -2.3662 })
        },
        callCount: 1,
        mockResponse: defaultResponse
      });
    });
  });
});
