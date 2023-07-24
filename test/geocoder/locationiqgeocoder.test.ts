import ValueError from 'lib/error/valueerror';
import LocationIQGeocoder from 'lib/geocoder/locationiqgeocoder';
import { buildHttpAdapter } from 'test/helpers/mocks';
import { verifyHttpAdapter } from 'test/helpers/utils';
import { HTTPAdapter } from 'types';

const mockedHttpAdapter = buildHttpAdapter();

describe('LocationIQGeocoder', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });
  describe('#constructor', () => {
    test('an http adapter must be set', () => {
      expect(() => {
        new LocationIQGeocoder('' as unknown as HTTPAdapter);
      }).toThrow('LocationIQGeocoder need an httpAdapter');
    });

    test('must have an api key as second argument', () => {
      expect(() => {
        new LocationIQGeocoder(mockedHttpAdapter);
      }).toThrow('LocationIQGeocoder needs an apiKey');
    });

    test('Should be an instance of LocationIQGeocoder', () => {
      const adapter = new LocationIQGeocoder(mockedHttpAdapter, {
        apiKey: 'API_KEY'
      });
      expect(adapter).toBeInstanceOf(LocationIQGeocoder);
    });
  });

  describe('#geocode', () => {
    test('Should not accept IPv4', async () => {
      const adapter = new LocationIQGeocoder(mockedHttpAdapter, {
        apiKey: 'API_KEY'
      });
      await expect(
        adapter.geocode('127.0.0.1')
      ).rejects.toEqual(new ValueError('LocationIQGeocoder does not support geocoding IPv4'));
    });

    test('Should not accept IPv6', () => {
      const adapter = new LocationIQGeocoder(mockedHttpAdapter, {
        apiKey: 'API_KEY'
      });
      expect(
        adapter.geocode('2001:0db8:0000:85a3:0000:0000:ac1f:8001')
      ).rejects.toEqual(new ValueError('LocationIQGeocoder does not support geocoding IPv6'));
    });

    test('Should call httpAdapter get method', async () => {
      const adapter = new LocationIQGeocoder(mockedHttpAdapter, {
        apiKey: 'API_KEY'
      });

      await verifyHttpAdapter({
        adapter,
        async work() {
          await adapter.geocode('Empire State Building')
        },
        callCount: 1
      });
    });

    test('Should return geocoded address', async () => {
      const rawResponse = [
        {
          place_id: '49220656',
          licence:
            'Data © OpenStreetMap contributors, ODbL 1.0. http://www.openstreetmap.org/copyright',
          osm_type: 'node',
          osm_id: '3674260525',
          boundingbox: [
            '40.7487227',
            '40.7488227',
            '-73.9849836',
            '-73.9848836'
          ],
          lat: '40.7487727',
          lon: '-73.9849336',
          display_name:
            'Empire State Building, 362, 5th Avenue, Diamond District, Manhattan, New York County, NYC, New York, 10035, United States of America',
          class: 'tourism',
          type: 'attraction',
          importance: 0.301,
          icon: 'http://158.69.3.42/nominatim/images/mapicons/poi_point_of_interest.p.20.png',
          address: {
            attraction: 'Empire State Building',
            house_number: '362',
            road: '5th Avenue',
            neighbourhood: 'Diamond District',
            suburb: 'Manhattan',
            county: 'New York County',
            city: 'NYC',
            state: 'New York',
            postcode: '10035',
            country: 'United States of America',
            country_code: 'us'
          }
        }
      ];

      const adapter = new LocationIQGeocoder(mockedHttpAdapter, {
        apiKey: 'API_KEY'
      });

      const results = await verifyHttpAdapter({
        adapter,
        async work() {
          return await adapter.geocode('Empire State Building')
        },
        callCount: 1,
        mockResponse: rawResponse
      });

      expect(results.raw).toEqual(rawResponse);

      expect(results.data[0]).toEqual({
        city: 'NYC',
        country: 'United States of America',
        countryCode: 'US',
        latitude: 40.7487727,
        longitude: -73.9849336,
        state: 'New York',
        streetName: '5th Avenue',
        streetNumber: '362',
        zipcode: '10035'
      });
    });

    test('Should return geocoded address when queried with an object', async () => {
      const rawResponse = [
        {
          place_id: '49220656',
          licence:
            'Data © OpenStreetMap contributors, ODbL 1.0. http://www.openstreetmap.org/copyright',
          osm_type: 'node',
          osm_id: '3674260525',
          boundingbox: [
            '40.7487227',
            '40.7488227',
            '-73.9849836',
            '-73.9848836'
          ],
          lat: '40.7487727',
          lon: '-73.9849336',
          display_name:
            'Empire State Building, 362, 5th Avenue, Diamond District, Manhattan, New York County, NYC, New York, 10035, United States of America',
          class: 'tourism',
          type: 'attraction',
          importance: 0.401,
          icon: 'http://158.69.3.42/nominatim/images/mapicons/poi_point_of_interest.p.20.png',
          address: {
            attraction: 'Empire State Building',
            house_number: '362',
            road: '5th Avenue',
            neighbourhood: 'Diamond District',
            suburb: 'Manhattan',
            county: 'New York County',
            city: 'NYC',
            state: 'New York',
            postcode: '10035',
            country: 'United States of America',
            country_code: 'us'
          }
        }
      ];

      const adapter = new LocationIQGeocoder(mockedHttpAdapter, {
        apiKey: 'API_KEY'
      });

      const results = await verifyHttpAdapter({
        adapter,
        async work() {
          return await adapter.geocode({
            street: '5th Avenue 263',
            city: 'New York'
          })
        },
        mockResponse: rawResponse
      });


      expect(results.data).toHaveLength(1);
      expect(results.data[0]).toEqual({
        city: 'NYC',
        country: 'United States of America',
        countryCode: 'US',
        latitude: 40.7487727,
        longitude: -73.9849336,
        state: 'New York',
        streetName: '5th Avenue',
        streetNumber: '362',
        zipcode: '10035'
      });

      expect(results.raw).toEqual(rawResponse);
    });

    test('should ignore "format" and "addressdetails" arguments', async () => {
      const adapter = new LocationIQGeocoder(mockedHttpAdapter, {
        apiKey: 'API_KEY'
      });
      const query = { q: 'Athens', format: 'xml', addressdetails: 0 };
      const results = await verifyHttpAdapter({
        adapter,
        async work() {
          return await adapter.geocode(query)
        },
        expectedParams: {
          addressdetails: '1',
          format: 'json',
          key: 'API_KEY',
          q: 'Athens'
        },
        expectedUrl: 'http://us1.locationiq.com/v1/search',
        mockResponse: []
      });

      expect(results.data).toHaveLength(0);
    });
  });

  describe('#reverse', () => {
    test('Should correctly set extra arguments', async () => {
      const adapter = new LocationIQGeocoder(mockedHttpAdapter, {
        apiKey: 'API_KEY'
      });

      const results = await verifyHttpAdapter({
        adapter,
        async work() {
          return await adapter.reverse({
            lat: 12,
            lon: 7,
            // @ts-expect-error @todo make adapter specific params
            zoom: 15
          })
        },
        mockResponse: [],
        expectedUrl: 'http://us1.locationiq.com/v1/reverse',
        expectedParams: {
          addressdetails: '1',
          format: 'json',
          key: 'API_KEY',
          lat: 12,
          lon: 7,
          zoom: 15 // <--- extra
        }
      });

      expect(results.data).toHaveLength(0);
    });

    test('should ignore "format" and "addressdetails" arguments', async () => {
      const adapter = new LocationIQGeocoder(mockedHttpAdapter, {
        apiKey: 'API_KEY'
      });
      const query = { lat: 12, lon: 7, format: 'xml', addressdetails: 0 };
      const results = await verifyHttpAdapter({
        adapter,
        async work() {
          return await adapter.reverse(query)
        },
        mockResponse: [],
        expectedUrl: 'http://us1.locationiq.com/v1/reverse',
        expectedParams: {
          addressdetails: '1',
          format: 'json',
          key: 'API_KEY',
          lat: 12,
          lon: 7
        }
      });

      expect(results.data).toHaveLength(0);
    });
  });
});
