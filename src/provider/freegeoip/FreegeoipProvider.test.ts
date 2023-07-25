import ValueError from 'src/utils/error/ValueError';
import FreegeoipProvider from 'src/provider/freegeoip/FreegeoipProvider';
import { buildHttpAdapter } from 'src/utils/test/mocks';
import { verifyHttpAdapter } from 'src/utils/test/helpers';
import { HTTPAdapter } from 'src/types';

const mockedHttpAdapter = buildHttpAdapter();
const defaultResponse = {};

describe('FreegeoipProvider', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });
  describe('#constructor', () => {
    test('an http adapter must be set', () => {
      expect(() => {
        new FreegeoipProvider('' as unknown as HTTPAdapter, {});
      }).toThrow('FreegeoipProvider need an httpAdapter');
    });
    test('Should be an instance of FreegeoipProvider', () => {
      const adapter = new FreegeoipProvider(mockedHttpAdapter, {});

      expect(adapter).toBeInstanceOf(FreegeoipProvider);
    });
  });
  describe('#geocode', () => {
    test('Should not accept address', async () => {
      const adapter = new FreegeoipProvider(mockedHttpAdapter, {});
      await expect(
        adapter.geocode('1 rue test')
      ).rejects.toEqual(
        new ValueError('FreegeoipProvider does not support geocoding address')
      );
    });
    test('Should call httpAdapter get method', async () => {
      const adapter = new FreegeoipProvider(mockedHttpAdapter, {});

      await verifyHttpAdapter({
        adapter,
        async work() {
          await adapter.geocode('127.0.0.1')
        },
        callCount: 1,
        mockResponse: defaultResponse
      });
    });
    test('Should return a geocoded address', async () => {
      const response = {
        ip: '66.249.64.0',
        country_code: 'US',
        country_name: 'United States',
        region_code: 'CA',
        region_name: 'California',
        city: 'Mountain View',
        zip_code: '94040',
        time_zone: 'America/Los_Angeles',
        latitude: 37.386,
        longitude: -122.084,
        metro_code: 807
      };
      const adapter = new FreegeoipProvider(mockedHttpAdapter, {});
      const results = await verifyHttpAdapter({
        adapter,
        async work() {
          return await adapter.geocode('66.249.64.0')
        },
        mockResponse: response
      });

      expect(results.data[0]).toEqual({
        ip: '66.249.64.0',
        countryCode: 'US',
        country: 'United States',
        regionCode: 'CA',
        regionName: 'California',
        city: 'Mountain View',
        zipcode: '94040',
        timeZone: 'America/Los_Angeles',
        latitude: 37.386,
        longitude: -122.084,
        metroCode: 807
      });
    });
  });
  describe('#reverse', () => {
    test('Should throw an error', async () => {
      const adapter = new FreegeoipProvider(mockedHttpAdapter, {});
      await expect(
        adapter.reverse({ lat: 10.0235, lon: -2.3662 })
      ).rejects.toEqual(
        new ValueError('FreegeoipProvider does not support reverse geocoding')
      );
    });
  });
});
