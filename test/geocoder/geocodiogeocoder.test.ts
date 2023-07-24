import ValueError from 'lib/error/valueerror';
import GeocodioGeocoder from 'lib/geocoder/geocodiogeocoder';
import { buildHttpAdapter } from 'test/helpers/mocks';
import { verifyHttpAdapter } from 'test/helpers/utils';
import { HTTPAdapter } from 'types';

const mockedHttpAdapter = buildHttpAdapter();
const defaultResponse = {
  results: []
};

describe('GeocodioGeocoder', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });
  describe('#constructor', () => {
    test('an http adapter must be set', () => {
      expect(() => {
        new GeocodioGeocoder('' as unknown as HTTPAdapter, { apiKey: '' });
      }).toThrow('GeocodioGeocoder need an httpAdapter');
    });

    test('an apiKey must be set', () => {
      expect(() => {
        new GeocodioGeocoder(mockedHttpAdapter, { apiKey: '' });
      }).toThrow('GeocodioGeocoder needs an apiKey');
    });

    test('Should be an instance of GeocodioGeocoder', () => {
      const adapter = new GeocodioGeocoder(mockedHttpAdapter, {
        apiKey: 'API_KEY'
      });

      expect(adapter).toBeInstanceOf(GeocodioGeocoder);
    });
  });

  describe('#geocode', () => {
    test('Should not accept IPv4', async () => {
      const adapter = new GeocodioGeocoder(mockedHttpAdapter, {
        apiKey: 'API_KEY'
      });

      await expect(
        adapter.geocode('127.0.0.1')
      ).rejects.toEqual(new ValueError('GeocodioGeocoder does not support geocoding IPv4'));
    });

    test('Should not accept IPv6', async () => {
      const adapter = new GeocodioGeocoder(mockedHttpAdapter, {
        apiKey: 'API_KEY'
      });

      await expect(
        adapter.geocode('2001:0db8:0000:85a3:0000:0000:ac1f:8001')
      ).rejects.toEqual(new ValueError('GeocodioGeocoder does not support geocoding IPv6'));
    });
  });

  describe('#reverse', () => {
    test('Should call httpAdapter get method', async () => {
      const adapter = new GeocodioGeocoder(mockedHttpAdapter, {
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
