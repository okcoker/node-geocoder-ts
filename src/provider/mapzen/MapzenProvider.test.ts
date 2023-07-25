import MapzenProvider from './MapzenProvider';
import { buildHttpAdapter } from 'src/utils/test/mocks';
import { HTTPAdapter } from 'src/types';
import ValueError from 'src/utils/error/ValueError';
import { verifyHttpAdapter } from 'src/utils/test/helpers';

const mockedHttpAdapter = buildHttpAdapter();
const defaultResponse = {
  features: [],
  results: []
};

describe('MapzenProvider', () => {
  describe('#constructor', () => {
    test('an http adapter must be set', () => {
      expect(() => {
        new MapzenProvider('' as unknown as HTTPAdapter, { apiKey: '' });
      }).toThrow('MapzenProvider need an httpAdapter');
    });

    test('an apiKey must be set', () => {
      expect(() => {
        new MapzenProvider(mockedHttpAdapter, { apiKey: '' });
      }).toThrow('MapzenProvider needs an apiKey');
    });

    test('Should be an instance of MapzenProvider', () => {
      const mapzenAdapter = new MapzenProvider(mockedHttpAdapter, {
        apiKey: 'API_KEY'
      });

      expect(mapzenAdapter).toBeInstanceOf(MapzenProvider);
    });
  });

  describe('#geocode', () => {
    test('Should not accept IPv4', async () => {
      const mapzenAdapter = new MapzenProvider(mockedHttpAdapter, {
        apiKey: 'API_KEY'
      });

      await expect(
        mapzenAdapter.geocode('127.0.0.1')
      ).rejects.toEqual(new ValueError('MapzenProvider does not support geocoding IPv4'));
    });

    test('Should not accept IPv6', async () => {
      const mapzenAdapter = new MapzenProvider(mockedHttpAdapter, {
        apiKey: 'API_KEY'
      });

      await expect(
        mapzenAdapter.geocode(
          '2001:0db8:0000:85a3:0000:0000:ac1f:8001'
        )
      ).rejects.toEqual(new ValueError('MapzenProvider does not support geocoding IPv6'));
    });
  });

  describe('#reverse', () => {
    test('Should call httpAdapter get method', async () => {
      const apiKey = 'API_KEY';
      const query = { lat: 10.0235, lon: -2.3662 }
      const adapter = new MapzenProvider(mockedHttpAdapter, {
        apiKey
      });

      await verifyHttpAdapter({
        adapter,
        async work() {
          await adapter.reverse(query);
        },
        expectedParams: {
          'point.lat': query.lat,
          'point.lon': query.lon,
          api_key: apiKey
        },
        mockResponse: defaultResponse
      });
    });
  });
});
