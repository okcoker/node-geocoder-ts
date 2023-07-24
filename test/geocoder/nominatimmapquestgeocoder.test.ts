import ValueError from 'lib/error/valueerror';
import NominatimMapquestGeocoder from 'lib/geocoder/nominatimmapquestgeocoder';
import { buildHttpAdapter } from 'test/helpers/mocks';
import { verifyHttpAdapter } from 'test/helpers/utils';
import { HTTPAdapter } from 'types';

const mockedHttpAdapter = buildHttpAdapter();
const defaultResponse = {}

describe('NominatimMapquestGeocoder', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });
  describe('#constructor', () => {
    test('an http adapter must be set', () => {
      expect(() => {
        new NominatimMapquestGeocoder('' as unknown as HTTPAdapter, {
          apiKey: ''
        });
      }).toThrow('NominatimMapquestGeocoder need an httpAdapter');
    });

    test('an apiKey must be set', () => {
      expect(() => {
        new NominatimMapquestGeocoder(mockedHttpAdapter, { apiKey: '' });
      }).toThrow('NominatimMapquestGeocoder needs an apiKey');
    });

    test('Should be an instance of NominatimMapquestGeocoder', () => {
      const adapter = new NominatimMapquestGeocoder(mockedHttpAdapter, {
        apiKey: 'API_KEY'
      });

      expect(adapter).toBeInstanceOf(NominatimMapquestGeocoder);
    });
  });

  describe('#geocode', () => {
    test('Should not accept IPv4', async () => {
      const adapter = new NominatimMapquestGeocoder(mockedHttpAdapter, {
        apiKey: 'API_KEY'
      });

      await expect(
        adapter.geocode('127.0.0.1')
      ).rejects.toEqual(
        new ValueError('NominatimMapquestGeocoder does not support geocoding IPv4')
      );
    });

    test('Should not accept IPv6', async () => {
      const adapter = new NominatimMapquestGeocoder(mockedHttpAdapter, {
        apiKey: 'API_KEY'
      });

      await expect(
        adapter.geocode('2001:0db8:0000:85a3:0000:0000:ac1f:8001')
      ).rejects.toEqual(
        new ValueError(
          'NominatimMapquestGeocoder does not support geocoding IPv6'
        )
      );
    });

    test('Should call httpAdapter get method', async () => {
      const adapter = new NominatimMapquestGeocoder(mockedHttpAdapter, {
        apiKey: 'API_KEY'
      });

      await verifyHttpAdapter({
        adapter,
        async work() {
          await adapter.geocode('1 champs élysée Paris')
        },
        expectedUrl: 'http://open.mapquestapi.com/nominatim/v1/search',
        expectedParams: {
          key: 'API_KEY',
          addressdetails: 1,
          format: 'json',
          q: '1 champs élysée Paris'
        },
        mockResponse: defaultResponse
      });
    });

    test('Should return geocoded address', async () => {
      const response = [
        {
          place_id: '80515867',
          licence:
            'Data \u00a9 OpenStreetMap contributors, ODbL 1.0. http://www.openstreetmap.org/copyright',
          osm_type: 'way',
          osm_id: '90394480',
          boundingbox: [
            '52.5487473',
            '52.5488481',
            '-1.8165129',
            '-1.8163463'
          ],
          lat: '52.5487921',
          lon: '-1.8164307339635',
          display_name:
            '135, Pilkington Avenue, Castle Vale, Maney, Birmingham, West Midlands, England, B72 1LH, United Kingdom',
          class: 'place',
          type: 'house',
          importance: 0.411,
          address: {
            house_number: '135',
            road: 'Pilkington Avenue',
            suburb: 'Castle Vale',
            hamlet: 'Maney',
            city: 'Birmingham',
            state_district: 'West Midlands',
            state: 'England',
            postcode: 'B72 1LH',
            country: 'United Kingdom',
            country_code: 'gb'
          }
        }
      ];

      const adapter = new NominatimMapquestGeocoder(mockedHttpAdapter, {
        apiKey: 'API_KEY'
      });
      const results = await verifyHttpAdapter({
        adapter,
        async work() {
          return await adapter.geocode('135 pilkington avenue, birmingham')
        },
        expectedUrl: 'http://open.mapquestapi.com/nominatim/v1/search',
        mockResponse: response
      });

      expect(results.data[0]).toEqual({
        latitude: 52.5487921,
        longitude: -1.8164307339635,
        formattedAddress:
          '135, Pilkington Avenue, Castle Vale, Maney, Birmingham, West Midlands, England, B72 1LH, United Kingdom',
        country: 'United Kingdom',
        state: 'England',
        city: 'Birmingham',
        zipcode: 'B72 1LH',
        streetName: 'Pilkington Avenue',
        streetNumber: '135',
        countryCode: 'GB'
      });
    });
  });

  describe('#reverse', () => {
    test('Should return reverse geocoded address', async () => {
      const response = {
        place_id: '149160357',
        licence:
          'Data \u00a9 OpenStreetMap contributors, ODbL 1.0. http://www.openstreetmap.org/copyright',
        osm_type: 'way',
        osm_id: '279767984',
        lat: '40.714205',
        lon: '-73.9613150927476',
        display_name:
          '279, Bedford Avenue, Williamsburg, Kings County, NYC, New York, 11211, United States of America',
        address: {
          house_number: '279',
          road: 'Bedford Avenue',
          neighbourhood: 'Williamsburg',
          county: 'Kings County',
          city: 'NYC',
          state: 'New York',
          postcode: '11211',
          country: 'United States of America',
          country_code: 'us'
        }
      };
      const adapter = new NominatimMapquestGeocoder(mockedHttpAdapter, {
        apiKey: 'API_KEY'
      });
      const results = await verifyHttpAdapter({
        adapter,
        async work() {
          return await adapter.reverse({ lat: 40.714232, lon: -73.9612889 })
        },
        expectedUrl: 'http://open.mapquestapi.com/nominatim/v1/reverse',
        expectedParams: {
          key: 'API_KEY',
          addressdetails: 1,
          format: 'json',
          lat: 40.714232,
          lon: -73.9612889
        },
        mockResponse: response
      });

      expect(results.data[0]).toEqual({
        latitude: 40.714205,
        longitude: -73.9613150927476,
        formattedAddress:
          '279, Bedford Avenue, Williamsburg, Kings County, NYC, New York, 11211, United States of America',
        country: 'United States of America',
        city: 'NYC',
        state: 'New York',
        zipcode: '11211',
        streetName: 'Bedford Avenue',
        streetNumber: '279',
        countryCode: 'US',
        neighborhood: 'Williamsburg'
      });
    });
  });
});
