import OpenStreetMapProvider from 'src/provider/openstreetmap/OpenStreetMapProvider';
import { buildHttpAdapter } from 'src/utils/test/mocks';
import { verifyHttpAdapter } from 'src/utils/test/helpers';
import { HTTPAdapter } from 'src/types';

const mockedHttpAdapter = buildHttpAdapter();
const defaultResponse: unknown[] = [];

describe('OpenStreetMapProvider', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });
  describe('#constructor', () => {
    test('an http adapter must be set', () => {
      expect(() => {
        new OpenStreetMapProvider('' as unknown as HTTPAdapter);
      }).toThrow('OpenStreetMapProvider need an httpAdapter');
    });

    test('Should be an instance of OpenStreetMapProvider', () => {
      const adapter = new OpenStreetMapProvider(mockedHttpAdapter);

      expect(adapter).toBeInstanceOf(OpenStreetMapProvider);
    });
  });

  describe('#geocode', () => {
    test('Should not accept IPv4', async () => {
      const adapter = new OpenStreetMapProvider(mockedHttpAdapter);

      await verifyHttpAdapter({
        adapter,
        async work() {
          await expect(
            adapter.geocode('127.0.0.1')
          ).rejects.toThrow('OpenStreetMapProvider does not support geocoding IPv4')
        },
        callCount: 0,
        mockResponse: defaultResponse
      });
    });

    test('Should not accept IPv6', async () => {
      const adapter = new OpenStreetMapProvider(mockedHttpAdapter);
      await verifyHttpAdapter({
        adapter,
        async work() {
          await expect(
            adapter.geocode('2001:0db8:0000:85a3:0000:0000:ac1f:8001')
          ).rejects.toThrow('OpenStreetMapProvider does not support geocoding IPv6')
        },
        callCount: 0,
        mockResponse: defaultResponse
      });
    });

    test('Should call httpAdapter get method', async () => {
      const adapter = new OpenStreetMapProvider(mockedHttpAdapter);
      await verifyHttpAdapter({
        adapter,
        async work() {
          return adapter.geocode('1 champs élysée Paris')
        },
        callCount: 1,
        mockResponse: defaultResponse
      });
    });

    test('Should return geocoded address', async () => {
      const response = [
        {
          place_id: '73723099',
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
          class: 'building',
          type: 'yes',
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

      const adapter = new OpenStreetMapProvider(mockedHttpAdapter);
      const results = await verifyHttpAdapter({
        adapter,
        async work() {
          return adapter.geocode(
            '135 pilkington avenue, birmingham'
          );
        },
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

      expect(results.raw).toEqual([
        {
          place_id: '73723099',
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
          class: 'building',
          type: 'yes',
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
      ]);
    });

    test('Should return geocoded address when queried with object', async () => {
      const response = [
        {
          place_id: '7677374',
          licence:
            'Data \u00a9 OpenStreetMap contributors, ODbL 1.0. http://www.openstreetmap.org/copyright',
          osm_type: 'node',
          osm_id: '829071536',
          boundingbox: ['48.8712111', '48.8713111', '2.3017954', '2.3018954'],
          lat: '48.8712611',
          lon: '2.3018454',
          display_name:
            '93, Avenue des Champs-\u00c9lys\u00e9es, Champs-\u00c9lys\u00e9es, 8e, Paris, \u00cele-de-France, France m\u00e9tropolitaine, 75008, France',
          class: 'place',
          type: 'house',
          importance: 0.621,
          address: {
            house_number: '93',
            road: 'Avenue des Champs-\u00c9lys\u00e9es',
            suburb: 'Champs-\u00c9lys\u00e9es',
            city_district: '8e',
            city: 'Paris',
            county: 'Paris',
            state: '\u00cele-de-France',
            country: 'France',
            postcode: '75008',
            country_code: 'fr',
            neighbourhood: 'Williamsburg'
          }
        }
      ];

      const adapter = new OpenStreetMapProvider(mockedHttpAdapter);
      const results = await verifyHttpAdapter({
        adapter,
        async work() {
          return adapter.geocode(
            { street: '93 Champs-Élysèes', city: 'Paris', limit: 1 }
          )
        },
        expectedParams: {
          format: 'json',
          addressdetails: 1,
          city: 'Paris',
          limit: 1,
          street: '93 Champs-Élysèes'
        },
        expectedUrl: 'http://nominatim.openstreetmap.org/search',
        mockResponse: response
      });

      expect(results!.data[0]).toEqual({
        latitude: 48.8712611,
        longitude: 2.3018454,
        formattedAddress:
          '93, Avenue des Champs-\u00c9lys\u00e9es, Champs-\u00c9lys\u00e9es, 8e, Paris, \u00cele-de-France, France m\u00e9tropolitaine, 75008, France',
        country: 'France',
        state: '\u00cele-de-France',
        city: 'Paris',
        zipcode: '75008',
        streetName: 'Avenue des Champs-\u00c9lys\u00e9es',
        streetNumber: '93',
        countryCode: 'FR',
        neighborhood: 'Williamsburg'
      });
    });

    test('Should ignore format and addressdetails arguments', async () => {
      const adapter = new OpenStreetMapProvider(mockedHttpAdapter);
      await verifyHttpAdapter({
        adapter,
        async work() {
          return adapter.geocode(
            { q: 'Athens', format: 'xml', addressdetails: 0 }
          )
        },
        expectedParams: {
          format: 'json',
          addressdetails: 1,
          q: 'Athens'
        },
        expectedUrl: 'http://nominatim.openstreetmap.org/search',
        mockResponse: defaultResponse
      });
    });
  });

  describe('#reverse', () => {
    test('Should return geocoded address', async () => {
      const response = {
        place_id: '119109484',
        licence:
          'Data \u00a9 OpenStreetMap contributors, ODbL 1.0. http://www.openstreetmap.org/copyright',
        osm_type: 'way',
        osm_id: '279767984',
        lat: '40.714205',
        lon: '-73.9613150927476',
        display_name:
          '277, Bedford Avenue, Williamsburg, Kings County, NYC, New York, 11211, United States of America',
        address: {
          house_number: '277',
          road: 'Bedford Avenue',
          neighbourhood: 'Williamsburg',
          county: 'Kings County',
          city: 'NYC',
          state: 'New York',
          postcode: '11211',
          country: 'United States of America',
          country_code: 'us'
        }
      }
      const adapter = new OpenStreetMapProvider(mockedHttpAdapter);
      const results = await verifyHttpAdapter({
        adapter,
        async work() {
          return adapter.reverse(
            { lat: 40.714232, lon: -73.9612889 }
          )
        },
        mockResponse: response
      });

      expect(results.data[0]).toEqual({
        latitude: 40.714205,
        longitude: -73.9613150927476,
        formattedAddress:
          '277, Bedford Avenue, Williamsburg, Kings County, NYC, New York, 11211, United States of America',
        country: 'United States of America',
        state: 'New York',
        city: 'NYC',
        zipcode: '11211',
        streetName: 'Bedford Avenue',
        streetNumber: '277',
        countryCode: 'US',
        neighborhood: 'Williamsburg'
      });
      expect(results.raw).toEqual({
        place_id: '119109484',
        licence:
          'Data \u00a9 OpenStreetMap contributors, ODbL 1.0. http://www.openstreetmap.org/copyright',
        osm_type: 'way',
        osm_id: '279767984',
        lat: '40.714205',
        lon: '-73.9613150927476',
        display_name:
          '277, Bedford Avenue, Williamsburg, Kings County, NYC, New York, 11211, United States of America',
        address: {
          house_number: '277',
          road: 'Bedford Avenue',
          neighbourhood: 'Williamsburg',
          county: 'Kings County',
          city: 'NYC',
          state: 'New York',
          postcode: '11211',
          country: 'United States of America',
          country_code: 'us'
        }
      });
    });

    test('Should correctly set extra arguments', async () => {
      const adapter = new OpenStreetMapProvider(mockedHttpAdapter);
      await verifyHttpAdapter({
        adapter,
        async work() {
          // @todo type revserse params per adapter
          return adapter.reverse({
            lat: 12, lon: 7, zoom: 15
          } as any)
        },
        expectedParams: {
          format: 'json',
          addressdetails: 1,
          lat: 12,
          lon: 7,
          zoom: 15
        },
        expectedUrl: 'http://nominatim.openstreetmap.org/reverse',
        mockResponse: defaultResponse
      });
    });

    test('Should correctly set extra arguments from constructor extras', async () => {
      const adapter = new OpenStreetMapProvider(mockedHttpAdapter, {
        zoom: 9
      });
      await verifyHttpAdapter({
        adapter,
        async work() {
          return adapter.reverse({ lat: 12, lon: 7 })
        },
        expectedParams: {
          format: 'json',
          addressdetails: 1,
          lat: 12,
          lon: 7,
          zoom: 9
        },
        expectedUrl: 'http://nominatim.openstreetmap.org/reverse',
        mockResponse: defaultResponse
      });
    });

    test('Should ignore format and addressdetails arguments', async () => {
      const adapter = new OpenStreetMapProvider(mockedHttpAdapter);
      await verifyHttpAdapter({
        adapter,
        async work() {
          return adapter.reverse(
            // @todo type reverse params per adapter
            { lat: 12, lon: 7, format: 'xml', addressdetails: 0 } as any
          )
        },
        expectedParams: {
          format: 'json',
          addressdetails: 1,
          lat: 12,
          lon: 7
        },
        expectedUrl: 'http://nominatim.openstreetmap.org/reverse',
        mockResponse: defaultResponse
      });
    });
  });
});
