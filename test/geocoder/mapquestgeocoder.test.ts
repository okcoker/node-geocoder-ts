import ValueError from 'lib/error/valueerror';
import MapQuestGeocoder from 'lib/geocoder/mapquestgeocoder';
import { buildHttpAdapter } from 'test/helpers/mocks';
import { verifyHttpAdapter } from 'test/helpers/utils';
import { HTTPAdapter } from 'types';

const mockedHttpAdapter = buildHttpAdapter();

describe('MapQuestGeocoder', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });
  describe('#constructor', () => {
    test('an http adapter must be set', () => {
      expect(() => {
        new MapQuestGeocoder('' as unknown as HTTPAdapter, { apiKey: '' });
      }).toThrow('MapQuestGeocoder need an httpAdapter');
    });

    test('an apiKey must be set', () => {
      expect(() => {
        new MapQuestGeocoder(mockedHttpAdapter, { apiKey: '' });
      }).toThrow('MapQuestGeocoder needs an apiKey');
    });

    test('Should be an instance of MapQuestGeocoder', () => {
      const adapter = new MapQuestGeocoder(mockedHttpAdapter, {
        apiKey: 'API_KEY'
      });

      expect(adapter).toBeInstanceOf(MapQuestGeocoder);
    });
  });

  describe('#geocode', () => {
    test('Should not accept IPv4', async () => {
      const adapter = new MapQuestGeocoder(mockedHttpAdapter, {
        apiKey: 'API_KEY'
      });

      await expect(
        adapter.geocode('127.0.0.1')
      ).rejects.toThrow(new ValueError('MapQuestGeocoder does not support geocoding IPv4'));
    });

    test('Should not accept IPv6', async () => {
      const adapter = new MapQuestGeocoder(mockedHttpAdapter, {
        apiKey: 'API_KEY'
      });

      await expect(
        adapter.geocode(
          '2001:0db8:0000:85a3:0000:0000:ac1f:8001'
        )
      ).rejects.toEqual(new ValueError('MapQuestGeocoder does not support geocoding IPv6'));
    });

    test('Should call httpAdapter get method', async () => {
      const adapter = new MapQuestGeocoder(mockedHttpAdapter, {
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
        }
      });
    });
  });

  describe('#reverse', () => {
    test('Should call httpAdapter get method', async () => {
      const adapter = new MapQuestGeocoder(mockedHttpAdapter, {
        apiKey: 'API_KEY'
      });

      await verifyHttpAdapter({
        adapter,
        async work() {
          await adapter.reverse({ lat: 10.0235, lon: -2.3662 })
        },
        callCount: 1
      });
    });
  });
});
