import ValueError from 'src/utils/error/ValueError';
import MapQuestProvider from 'src/provider/mapquest/MapQuestProvider';
import { buildHttpAdapter } from 'src/utils/test/mocks';
import { verifyHttpAdapter } from 'src/utils/test/helpers';
import { HTTPAdapter } from 'src/types';

const mockedHttpAdapter = buildHttpAdapter();
const defaultResponse = {
  results: []
};

describe('MapQuestProvider', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });
  describe('#constructor', () => {
    test('an http adapter must be set', () => {
      expect(() => {
        new MapQuestProvider('' as unknown as HTTPAdapter, { apiKey: '' });
      }).toThrow('MapQuestProvider need an httpAdapter');
    });

    test('an apiKey must be set', () => {
      expect(() => {
        new MapQuestProvider(mockedHttpAdapter, { apiKey: '' });
      }).toThrow('MapQuestProvider needs an apiKey');
    });

    test('Should be an instance of MapQuestProvider', () => {
      const adapter = new MapQuestProvider(mockedHttpAdapter, {
        apiKey: 'API_KEY'
      });

      expect(adapter).toBeInstanceOf(MapQuestProvider);
    });
  });

  describe('#geocode', () => {
    test('Should not accept IPv4', async () => {
      const adapter = new MapQuestProvider(mockedHttpAdapter, {
        apiKey: 'API_KEY'
      });

      await expect(
        adapter.geocode('127.0.0.1')
      ).rejects.toThrow(new ValueError('MapQuestProvider does not support geocoding IPv4'));
    });

    test('Should not accept IPv6', async () => {
      const adapter = new MapQuestProvider(mockedHttpAdapter, {
        apiKey: 'API_KEY'
      });

      await expect(
        adapter.geocode(
          '2001:0db8:0000:85a3:0000:0000:ac1f:8001'
        )
      ).rejects.toEqual(new ValueError('MapQuestProvider does not support geocoding IPv6'));
    });

    test('Should call httpAdapter get method', async () => {
      const adapter = new MapQuestProvider(mockedHttpAdapter, {
        apiKey: 'API_KEY'
      });

      await verifyHttpAdapter({
        adapter,
        async work() {
          await adapter.geocode('test')
        },
        expectedUrl: 'https://www.mapquestapi.com/geocoding/v1/address',
        expectedParams: {
          key: 'API_KEY',
          location: 'test'
        },
        mockResponse: defaultResponse
      });
    });
  });

  describe('#reverse', () => {
    test('Should call httpAdapter get method', async () => {
      const adapter = new MapQuestProvider(mockedHttpAdapter, {
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
