import DataScienceToolkitGeocoder from 'lib/geocoder/datasciencetoolkitgeocoder';
import { buildHttpAdapter } from 'test/helpers/mocks';
import { verifyHttpAdapter } from 'test/helpers/utils';
import { HTTPAdapter } from 'types';

const mockedHttpAdapter = buildHttpAdapter();
const defaultResponse = {
  '127.0.0.1': {}
};

describe('DataScienceToolkitGeocoder', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('#constructor', () => {
    test('an http adapter must be set', () => {
      expect(() => {
        new DataScienceToolkitGeocoder('' as unknown as HTTPAdapter, {});
      }).toThrow('DataScienceToolkitGeocoder need an httpAdapter');
    });

    test('Should be an instance of DataScienceToolkitGeocoder', () => {
      const geocoder = new DataScienceToolkitGeocoder(mockedHttpAdapter, {});

      expect(geocoder).toBeInstanceOf(DataScienceToolkitGeocoder);
    });
  });

  describe('#geocode', () => {
    test('Should call httpAdapter get method', async () => {
      const adapter = new DataScienceToolkitGeocoder(mockedHttpAdapter, {});
      await verifyHttpAdapter({
        adapter,
        async work() {
          return adapter.geocode('127.0.0.1');
        },
        callCount: 1,
        mockResponse: defaultResponse
      });
    });

    test('Should call httpAdapter get method with specified host', async () => {
      const adapter = new DataScienceToolkitGeocoder(mockedHttpAdapter, {
        host: 'raoul.io'
      });

      await verifyHttpAdapter({
        adapter,
        async work() {
          return adapter.geocode('127.0.0.1');
        },
        expectedUrl: 'http://raoul.io/ip2coordinates/127.0.0.1',
        mockResponse: defaultResponse
      });
    });

    test('Should return a geocoded address', async () => {
      const response = {
        '67.169.73.113': {
          country_name: 'United States',
          area_code: 415,
          region: 'CA',
          postal_code: '94114',
          city: 'San Francisco',
          latitude: 37.7587013244629,
          country_code: 'US',
          longitude: -122.438102722168,
          country_code3: 'USA',
          dma_code: 807
        }
      };
      const adapter = new DataScienceToolkitGeocoder(mockedHttpAdapter, {});
      const results = await verifyHttpAdapter({
        adapter,
        async work() {
          return adapter.geocode('67.169.73.113');
        },
        mockResponse: response
      });

      expect(results.data[0]).toEqual({
        latitude: 37.7587013244629,
        longitude: -122.438102722168,
        country: 'United States',
        city: 'San Francisco',
        state: 'CA',
        zipcode: '94114',
        streetName: undefined,
        streetNumber: undefined,
        countryCode: 'US'
      });
    });

    test('Should return a geocoded address', async () => {
      const response = {
        '2543 Graystone Place, Simi Valley, CA 93065': {
          country_code3: 'USA',
          latitude: 34.280874,
          country_name: 'United States',
          longitude: -118.766282,
          street_address: '2543 Graystone Pl',
          region: 'CA',
          confidence: 1.0,
          street_number: '2543',
          locality: 'Simi Valley',
          street_name: 'Graystone Pl',
          fips_county: '06111',
          country_code: 'US'
        }
      }
      const adapter = new DataScienceToolkitGeocoder(mockedHttpAdapter, {});
      const results = await verifyHttpAdapter({
        adapter,
        async work() {
          return adapter.geocode('2543 Graystone Place, Simi Valley, CA 93065');
        },
        mockResponse: response
      });

      expect(results.data[0]).toEqual({
        latitude: 34.280874,
        longitude: -118.766282,
        country: 'United States',
        city: 'Simi Valley',
        state: 'CA',
        zipcode: undefined,
        streetName: 'Graystone Pl',
        streetNumber: '2543',
        countryCode: 'US'
      });
    });

    test('Should error for no result', async () => {
      const response = {
        '2543 Graystone Place, #123, Simi Valley, CA 93065': null
      }
      const adapter = new DataScienceToolkitGeocoder(mockedHttpAdapter, {});
      await verifyHttpAdapter({
        adapter,
        async work() {
          await expect(
            adapter.geocode('2543 Graystone Place, #123, Simi Valley, CA 93065')
          ).rejects.toThrow('Could not geocode "2543 Graystone Place, #123, Simi Valley, CA 93065".')
        },
        mockResponse: response
      });
    });
  });

  describe('#reverse', () => {
    test('Should throw a not supported error', async () => {
      const adapter = new DataScienceToolkitGeocoder(mockedHttpAdapter, {});
      await verifyHttpAdapter({
        adapter,
        async work() {
          await expect(
            adapter.reverse({ lat: 10.0235, lon: -2.3662 })
          ).rejects.toThrow('DataScienceToolkitGeocoder does not support reverse geocoding')
        },
        callCount: 0
      });
    });
  });
});
