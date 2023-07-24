import ValueError from 'lib/error/valueerror';
import FreegeoipGeocoder from 'lib/geocoder/freegeoipgeocoder';
import { buildHttpAdapter } from 'test/helpers/mocks';
import { verifyHttpAdapter } from 'test/helpers/utils';
import { HTTPAdapter } from 'types';

const mockedHttpAdapter = buildHttpAdapter();

describe('FreegeoipGeocoder', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });
  describe('#constructor', () => {
    test('an http adapter must be set', () => {
      expect(() => {
        new FreegeoipGeocoder('' as unknown as HTTPAdapter, {});
      }).toThrow('FreegeoipGeocoder need an httpAdapter');
    });
    test('Should be an instance of FreegeoipGeocoder', () => {
      const adapter = new FreegeoipGeocoder(mockedHttpAdapter, {});

      expect(adapter).toBeInstanceOf(FreegeoipGeocoder);
    });
  });
  describe('#geocode', () => {
    test('Should not accept address', async () => {
      const adapter = new FreegeoipGeocoder(mockedHttpAdapter, {});
      await expect(
        adapter.geocode('1 rue test')
      ).rejects.toEqual(
        new ValueError('FreegeoipGeocoder does not support geocoding address')
      );
    });
    test('Should call httpAdapter get method', async () => {
      const adapter = new FreegeoipGeocoder(mockedHttpAdapter, {});

      await verifyHttpAdapter({
        adapter,
        async work() {
          await adapter.geocode('127.0.0.1')
        },
        callCount: 1
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
      const adapter = new FreegeoipGeocoder(mockedHttpAdapter, {});
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
      const adapter = new FreegeoipGeocoder(mockedHttpAdapter, {});
      await expect(
        adapter.reverse({ lat: 10.0235, lon: -2.3662 })
      ).rejects.toEqual(
        new ValueError('FreegeoipGeocoder does not support reverse geocoding')
      );
    });
  });
});
