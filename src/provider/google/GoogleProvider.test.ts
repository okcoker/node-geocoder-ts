import GoogleProvider from 'src/provider/google/GoogleProvider';
import { buildHttpAdapter } from 'src/utils/test/mocks';
import { HTTPAdapter } from 'src/types';
import ValueError from 'src/utils/error/ValueError';
import { verifyHttpAdapter } from 'src/utils/test/helpers';

const mockedHttpAdapter = buildHttpAdapter();
const defaultResponse = {
  results: [],
  status: 'OK'
};
describe('GoogleProvider', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });
  describe('#constructor', () => {
    test('an http adapter must be set', () => {
      expect(() => {
        new GoogleProvider('' as unknown as HTTPAdapter, {});
      }).toThrow('GoogleProvider need an httpAdapter');
    });

    test('if a clientId is specified an apiKey must be set', () => {
      expect(() => {
        new GoogleProvider(mockedHttpAdapter, { clientId: 'CLIENT_ID' });
      }).toThrow('You must specify a apiKey (privateKey)');
    });

    test('Should be an instance of GoogleProvider if an http adapter is provided', () => {
      const adapter = new GoogleProvider(mockedHttpAdapter, {});

      expect(adapter).toBeInstanceOf(GoogleProvider);
    });

    test('Should be an instance of GoogleProvider if an http adapter, clientId, and apiKer are provided', () => {
      const adapter = new GoogleProvider(mockedHttpAdapter, {
        clientId: 'CLIENT_ID',
        apiKey: 'API_KEY'
      });

      expect(adapter).toBeInstanceOf(GoogleProvider);
    });
  });

  describe('#geocode', () => {
    test('Should not accept IPv4', async () => {
      const adapter = new GoogleProvider(mockedHttpAdapter, {});

      await expect(adapter.geocode('127.0.0.1')).rejects.toEqual(
        new ValueError('GoogleProvider does not support geocoding IPv4')
      );
    });

    test('Should not accept IPv6', async () => {
      const adapter = new GoogleProvider(mockedHttpAdapter, {});

      await expect(
        adapter.geocode('2001:0db8:0000:85a3:0000:0000:ac1f:8001')
      ).rejects.toEqual(
        new ValueError('GoogleProvider does not support geocoding IPv6')
      );
    });

    test('Should accept `language` and `region` as options', async () => {
      const adapter = new GoogleProvider(mockedHttpAdapter, {
        language: 'fr',
        region: '.ru'
      });
      await verifyHttpAdapter({
        adapter,
        work: async () => {
          await adapter.geocode({
            address: '1 champs élysée Paris',
            language: 'ru-RU',
            region: '.de'
          });
        },
        expectedUrl: 'https://maps.googleapis.com/maps/api/geocode/json',
        expectedParams: {
          address: '1 champs élysée Paris',
          language: 'ru-RU',
          region: '.de',
          components: '',
          sensor: false
        },
        mockResponse: defaultResponse
      });
    });

    test('Should call httpAdapter get method', async () => {
      const adapter = new GoogleProvider(mockedHttpAdapter, {});
      await verifyHttpAdapter({
        adapter,
        work: async () => {
          await adapter.geocode('1 champs élysée Paris');
        },
        expectedUrl: 'https://maps.googleapis.com/maps/api/geocode/json',
        expectedParams: {
          address: '1 champs élysée Paris',
          sensor: false
        },
        mockResponse: defaultResponse
      });
    });

    test('Should call httpAdapter get method with language if specified', async () => {
      const adapter = new GoogleProvider(mockedHttpAdapter, {
        language: 'fr'
      });
      await verifyHttpAdapter({
        adapter,
        work: async () => {
          adapter.geocode('1 champs élysée Paris');
        },
        expectedUrl: 'https://maps.googleapis.com/maps/api/geocode/json',
        expectedParams: {
          address: '1 champs élysée Paris',
          sensor: false,
          language: 'fr'
        },
        mockResponse: defaultResponse
      });
    });

    test('Should call httpAdapter get method with region if specified', async () => {
      const adapter = new GoogleProvider(mockedHttpAdapter, {
        region: 'fr'
      });
      await verifyHttpAdapter({
        adapter,
        work: () => {
          return adapter.geocode('1 champs élysée Paris');
        },
        expectedUrl: 'https://maps.googleapis.com/maps/api/geocode/json',
        expectedParams: {
          address: '1 champs élysée Paris',
          sensor: false,
          region: 'fr'
        },
        mockResponse: defaultResponse
      });
    });

    test('Should call httpAdapter get method with components if called with object', async () => {
      const adapter = new GoogleProvider(mockedHttpAdapter, {});
      await verifyHttpAdapter({
        adapter,
        work: () => {
          return adapter.geocode({
            address: '1 champs élysée Paris',
            zipcode: '75008',
            country: 'FR'
          });
        },
        expectedUrl: 'https://maps.googleapis.com/maps/api/geocode/json',
        expectedParams: {
          address: '1 champs élysée Paris',
          sensor: false,
          components: 'country:FR|postal_code:75008'
        },
        mockResponse: defaultResponse
      });
    });

    test('Should call httpAdapter get method with zipcode if country is missing', async () => {
      const adapter = new GoogleProvider(mockedHttpAdapter, {});
      await verifyHttpAdapter({
        adapter,
        work: async () => {
          await adapter.geocode({
            address: '1 champs élysée Paris',
            zipcode: '75008'
          });
        },
        expectedUrl: 'https://maps.googleapis.com/maps/api/geocode/json',
        expectedParams: {
          address: '1 champs élysée Paris',
          sensor: false,
          components: 'postal_code:75008'
        },
        mockResponse: defaultResponse
      });
    });

    test('Should call httpAdapter get method with key if specified', async () => {
      const adapter = new GoogleProvider(mockedHttpAdapter, {
        apiKey: 'hey-you-guys'
      });
      await verifyHttpAdapter({
        adapter,
        work: async () => {
          await adapter.geocode('1 champs élysée Paris');
        },
        expectedUrl: 'https://maps.googleapis.com/maps/api/geocode/json',
        expectedParams: {
          address: '1 champs élysée Paris',
          sensor: false,
          key: 'hey-you-guys'
        },
        mockResponse: defaultResponse
      });
    });

    test('Should return geocoded address', async () => {
      jest
        .spyOn(mockedHttpAdapter, 'get')
        .mockImplementation((_url, _params) => {
          return Promise.resolve({
            status: 'OK',
            results: [
              {
                geometry: {
                  location: {
                    lat: 37.386,
                    lng: -122.0838
                  }
                },
                address_components: [
                  { types: ['country'], long_name: 'France', short_name: 'Fr' },
                  { types: ['locality'], long_name: 'Paris' },
                  { types: ['postal_code'], long_name: '75008' },
                  { types: ['route'], long_name: 'Champs-Élysées' },
                  { types: ['street_number'], long_name: '1' },
                  {
                    types: ['administrative_area_level_1'],
                    long_name: 'Île-de-France',
                    short_name: 'IDF'
                  },
                  {
                    types: ['sublocality_level_1', 'sublocality', 'political'],
                    long_name: 'neighborhood'
                  }
                ],
                country_code: 'US',
                country_name: 'United States',
                locality: 'Mountain View'
              }
            ]
          });
        });

      const adapter = new GoogleProvider(mockedHttpAdapter, {});

      const results = await adapter.geocode('1 champs élysées Paris');
      expect(results.data[0]).toEqual({
        latitude: 37.386,
        longitude: -122.0838,
        country: 'France',
        city: 'Paris',
        zipcode: '75008',
        streetName: 'Champs-Élysées',
        streetNumber: '1',
        countryCode: 'Fr',
        administrativeLevels: {
          level1long: 'Île-de-France',
          level1short: 'IDF'
        },
        extra: {
          confidence: 0,
          premise: null,
          subpremise: null,
          neighborhood: 'neighborhood',
          establishment: null,
          googlePlaceId: null
        },
        formattedAddress: null
      });

      expect(results.raw).toEqual({
        status: 'OK',
        results: [
          {
            geometry: {
              location: {
                lat: 37.386,
                lng: -122.0838
              }
            },
            address_components: [
              { types: ['country'], long_name: 'France', short_name: 'Fr' },
              { types: ['locality'], long_name: 'Paris' },
              { types: ['postal_code'], long_name: '75008' },
              { types: ['route'], long_name: 'Champs-Élysées' },
              { types: ['street_number'], long_name: '1' },
              {
                types: ['administrative_area_level_1'],
                long_name: 'Île-de-France',
                short_name: 'IDF'
              },
              {
                types: ['sublocality_level_1', 'sublocality', 'political'],
                long_name: 'neighborhood'
              }
            ],
            country_code: 'US',
            country_name: 'United States',
            locality: 'Mountain View'
          }
        ]
      });
    });

    test('Should correctly match most specific neighborhood response value', async () => {
      const response = {
        results: [
          {
            address_components: [
              { long_name: '350', short_name: '350', types: ['street_number'] },
              {
                long_name: '5th Avenue',
                short_name: '5th Ave',
                types: ['route']
              },
              {
                long_name: 'Midtown',
                short_name: 'Midtown',
                types: ['neighborhood', 'political']
              },
              {
                long_name: 'Manhattan',
                short_name: 'Manhattan',
                types: ['sublocality_level_1', 'sublocality', 'political']
              },
              {
                long_name: 'New York',
                short_name: 'New York',
                types: ['locality', 'political']
              },
              {
                long_name: 'New York County',
                short_name: 'New York County',
                types: ['administrative_area_level_2', 'political']
              },
              {
                long_name: 'New York',
                short_name: 'NY',
                types: ['administrative_area_level_1', 'political']
              },
              {
                long_name: 'United States',
                short_name: 'US',
                types: ['country', 'political']
              },
              {
                long_name: '10118',
                short_name: '10118',
                types: ['postal_code']
              }
            ],
            formatted_address: '350 5th Ave, New York, NY 10118, USA',
            geometry: {
              location: {
                lat: 40.7484799,
                lng: -73.9854246
              },
              location_type: 'ROOFTOP',
              viewport: {
                northeast: { lat: 40.7498288802915, lng: -73.98407561970849 },
                southwest: { lat: 40.7471309197085, lng: -73.98677358029151 }
              }
            },
            place_id: 'ChIJn6wOs6lZwokRLKy1iqRcoKw',
            types: ['street_address']
          }
        ],
        status: 'OK'
      };

      const adapter = new GoogleProvider(mockedHttpAdapter, {});
      await verifyHttpAdapter({
        adapter,
        async work() {
          const results = await adapter.geocode(
            '350 5th Ave, New York, NY 10118'
          );

          expect(results.data[0]).toEqual(
            expect.objectContaining({
              extra: expect.objectContaining({
                neighborhood: 'Midtown'
              })
            })
          );
        },
        mockResponse: response
      });
    });

    test('Should handle a not "OK" status', async () => {
      const response = {
        status: 'OVER_QUERY_LIMIT',
        error_message: 'You have exceeded your rate-limit for this API.',
        results: []
      };

      const adapter = new GoogleProvider(mockedHttpAdapter, {});
      await verifyHttpAdapter({
        adapter,
        async work() {
          await expect(
            adapter.geocode('1 champs élysées Paris')
          ).rejects.toEqual(
            new Error(
              `Status is OVER_QUERY_LIMIT.\n${JSON.stringify(response)}`
            )
          );
        },
        mockResponse: response
      });
    });

    test('Should handle a not "OK" status and no error_message', async () => {
      const response = { status: 'INVALID_REQUEST', results: [] };

      const adapter = new GoogleProvider(mockedHttpAdapter, {});
      await verifyHttpAdapter({
        adapter,
        async work() {
          await expect(
            adapter.geocode('1 champs élysées Paris')
          ).rejects.toEqual(
            new Error(`Status is INVALID_REQUEST.\n${JSON.stringify(response)}`)
          );
        },
        mockResponse: response
      });
    });

    test('Should exclude partial match geocoded address if excludePartialMatches option is set to true', async () => {
      const response = {
        status: 'OK',
        results: [
          {
            geometry: {
              location: {
                lat: 37.386,
                lng: -122.0838
              }
            },
            address_components: [
              { types: ['country'], long_name: 'France', short_name: 'Fr' },
              { types: ['locality'], long_name: 'Paris' },
              { types: ['postal_code'], long_name: '75008' },
              { types: ['route'], long_name: 'Champs-Élysées' },
              { types: ['street_number'], long_name: '1' },
              {
                types: ['administrative_area_level_1'],
                long_name: 'Île-de-France',
                short_name: 'IDF'
              }
            ],
            country_code: 'US',
            country_name: 'United States',
            locality: 'Mountain View',
            partial_match: true
          }
        ]
      };
      const adapter = new GoogleProvider(mockedHttpAdapter, {
        clientId: 'clientId',
        apiKey: 'apiKey',
        excludePartialMatches: true
      });
      await verifyHttpAdapter({
        adapter,
        async work() {
          const results = await adapter.geocode('1 champs élysées Paris');
          expect(results.data).toHaveLength(0);
        },
        mockResponse: response
      });
    });

    test('Should include partial match geocoded address if excludePartialMatches option is set to false', async () => {
      const response = {
        status: 'OK',
        results: [
          {
            geometry: {
              location: {
                lat: 37.386,
                lng: -122.0838
              }
            },
            address_components: [
              { types: ['country'], long_name: 'France', short_name: 'Fr' },
              { types: ['locality'], long_name: 'Paris' },
              { types: ['postal_code'], long_name: '75008' },
              { types: ['route'], long_name: 'Champs-Élysées' },
              { types: ['street_number'], long_name: '1' },
              {
                types: ['administrative_area_level_1'],
                long_name: 'Île-de-France',
                short_name: 'IDF'
              }
            ],
            country_code: 'US',
            country_name: 'United States',
            locality: 'Mountain View',
            partial_match: true
          }
        ]
      };
      const adapter = new GoogleProvider(mockedHttpAdapter, {
        excludePartialMatches: false
      });

      const results = await verifyHttpAdapter({
        adapter,
        async work() {
          return await adapter.geocode('1 champs élysées Paris');
        },
        mockResponse: response
      });

      expect(results.data[0]).toEqual({
        latitude: 37.386,
        longitude: -122.0838,
        country: 'France',
        city: 'Paris',
        zipcode: '75008',
        streetName: 'Champs-Élysées',
        streetNumber: '1',
        countryCode: 'Fr',
        administrativeLevels: {
          level1long: 'Île-de-France',
          level1short: 'IDF'
        },
        extra: {
          confidence: 0,
          premise: null,
          subpremise: null,
          neighborhood: null,
          establishment: null,
          googlePlaceId: null
        },
        formattedAddress: null
      });

      expect(results.raw).toEqual({
        status: 'OK',
        results: [
          {
            geometry: {
              location: {
                lat: 37.386,
                lng: -122.0838
              }
            },
            address_components: [
              { types: ['country'], long_name: 'France', short_name: 'Fr' },
              { types: ['locality'], long_name: 'Paris' },
              { types: ['postal_code'], long_name: '75008' },
              { types: ['route'], long_name: 'Champs-Élysées' },
              { types: ['street_number'], long_name: '1' },
              {
                types: ['administrative_area_level_1'],
                long_name: 'Île-de-France',
                short_name: 'IDF'
              }
            ],
            country_code: 'US',
            country_name: 'United States',
            locality: 'Mountain View',
            partial_match: true
          }
        ]
      });
    });

    test('Should include partial match geocoded address if excludePartialMatches option is not set', async () => {
      const response = {
        status: 'OK',
        results: [
          {
            geometry: {
              location: {
                lat: 37.386,
                lng: -122.0838
              }
            },
            address_components: [
              { types: ['country'], long_name: 'France', short_name: 'Fr' },
              { types: ['locality'], long_name: 'Paris' },
              { types: ['postal_code'], long_name: '75008' },
              { types: ['route'], long_name: 'Champs-Élysées' },
              { types: ['street_number'], long_name: '1' },
              {
                types: ['administrative_area_level_1'],
                long_name: 'Île-de-France',
                short_name: 'IDF'
              }
            ],
            country_code: 'US',
            country_name: 'United States',
            locality: 'Mountain View',
            partial_match: true
          }
        ]
      };
      const adapter = new GoogleProvider(mockedHttpAdapter, {});

      const results = await verifyHttpAdapter({
        adapter,
        async work() {
          return await adapter.geocode('1 champs élysées Paris');
        },
        mockResponse: response
      });

      expect(results.data[0]).toEqual({
        latitude: 37.386,
        longitude: -122.0838,
        country: 'France',
        city: 'Paris',
        zipcode: '75008',
        streetName: 'Champs-Élysées',
        streetNumber: '1',
        countryCode: 'Fr',
        administrativeLevels: {
          level1long: 'Île-de-France',
          level1short: 'IDF'
        },
        extra: {
          confidence: 0,
          premise: null,
          subpremise: null,
          neighborhood: null,
          establishment: null,
          googlePlaceId: null
        },
        formattedAddress: null
      });

      expect(results.raw).toEqual({
        status: 'OK',
        results: [
          {
            geometry: {
              location: {
                lat: 37.386,
                lng: -122.0838
              }
            },
            address_components: [
              { types: ['country'], long_name: 'France', short_name: 'Fr' },
              { types: ['locality'], long_name: 'Paris' },
              { types: ['postal_code'], long_name: '75008' },
              { types: ['route'], long_name: 'Champs-Élysées' },
              { types: ['street_number'], long_name: '1' },
              {
                types: ['administrative_area_level_1'],
                long_name: 'Île-de-France',
                short_name: 'IDF'
              }
            ],
            country_code: 'US',
            country_name: 'United States',
            locality: 'Mountain View',
            partial_match: true
          }
        ]
      });
    });
  });

  describe('#reverse', () => {
    test('Should call httpAdapter get method', async () => {
      const adapter = new GoogleProvider(mockedHttpAdapter, {});

      await verifyHttpAdapter({
        adapter,
        async work() {
          return await adapter.reverse({ lat: 10.0235, lon: -2.3662 });
        },
        callCount: 1,
        mockResponse: defaultResponse
      });
    });

    test('Should return geocoded address', async () => {
      const response = {
        status: 'OK',
        results: [
          {
            geometry: {
              location: {
                lat: 40.714232,
                lng: -73.9612889
              }
            },
            address_components: [
              {
                types: ['country'],
                long_name: 'United States',
                short_name: 'US'
              },
              { types: ['locality'], long_name: 'Brooklyn' },
              { types: ['postal_code'], long_name: '11211' },
              { types: ['route'], long_name: 'Bedford Avenue' },
              { types: ['street_number'], long_name: '277' },
              {
                types: ['administrative_area_level_1'],
                long_name: 'État de New York',
                short_name: 'NY'
              }
            ],
            country_code: 'US',
            country_name: 'United States',
            locality: 'Mountain View'
          }
        ]
      };

      const adapter = new GoogleProvider(mockedHttpAdapter, {});
      const results = await verifyHttpAdapter({
        adapter,
        async work() {
          return await adapter.reverse({ lat: 40.714232, lon: -73.9612889 });
        },
        mockResponse: response
      });
      expect(results.data[0]).toEqual({
        latitude: 40.714232,
        longitude: -73.9612889,
        country: 'United States',
        city: 'Brooklyn',
        zipcode: '11211',
        streetName: 'Bedford Avenue',
        streetNumber: '277',
        countryCode: 'US',
        administrativeLevels: {
          level1long: 'État de New York',
          level1short: 'NY'
        },
        extra: {
          premise: null,
          subpremise: null,
          neighborhood: null,
          establishment: null,
          googlePlaceId: null,
          confidence: 0
        },
        formattedAddress: null
      });

      expect(results.raw).toEqual({
        status: 'OK',
        results: [
          {
            geometry: {
              location: {
                lat: 40.714232,
                lng: -73.9612889
              }
            },
            address_components: [
              {
                types: ['country'],
                long_name: 'United States',
                short_name: 'US'
              },
              { types: ['locality'], long_name: 'Brooklyn' },
              { types: ['postal_code'], long_name: '11211' },
              { types: ['route'], long_name: 'Bedford Avenue' },
              { types: ['street_number'], long_name: '277' },
              {
                types: ['administrative_area_level_1'],
                long_name: 'État de New York',
                short_name: 'NY'
              }
            ],
            country_code: 'US',
            country_name: 'United States',
            locality: 'Mountain View'
          }
        ]
      });
    });

    test('Should accept `language`, `result_type` and `location_type` as options', async () => {
      const adapter = new GoogleProvider(mockedHttpAdapter, {});
      await verifyHttpAdapter({
        adapter,
        async work() {
          return await adapter.reverse({
            lat: 40.714232,
            lon: -73.9612889,
            // @todo add adapter specific geocode and reverse
            // options similar to adpater options
            language: 'ru-RU',
            result_type: 'country',
            location_type: 'ROOFTOP'
          } as any);
        },
        expectedUrl: 'https://maps.googleapis.com/maps/api/geocode/json',
        expectedParams: {
          latlng: '40.714232,-73.9612889',
          language: 'ru-RU',
          sensor: false,
          result_type: 'country',
          location_type: 'ROOFTOP'
        },
        mockResponse: defaultResponse
      });
    });

    test('Should handle a not "OK" status', async () => {
      const response = {
        status: 'OVER_QUERY_LIMIT',
        error_message: 'You have exceeded your rate-limit for this API.',
        results: []
      };

      const adapter = new GoogleProvider(mockedHttpAdapter, {});
      await verifyHttpAdapter({
        adapter,
        async work() {
          await expect(
            adapter.reverse({ lat: 40.714232, lon: -73.9612889 })
          ).rejects.toEqual(
            new Error(
              `Status is OVER_QUERY_LIMIT.\n${JSON.stringify(response)}`
            )
          );
        },
        mockResponse: response
      });
    });

    test('Should handle a not "OK" status and no error_message', async () => {
      const response = { status: 'INVALID_REQUEST', results: [] };

      const adapter = new GoogleProvider(mockedHttpAdapter, {});
      await verifyHttpAdapter({
        adapter,
        async work() {
          await expect(
            adapter.reverse({ lat: 40.714232, lon: -73.9612889 })
          ).rejects.toEqual(
            new Error(`Status is INVALID_REQUEST.\n${JSON.stringify(response)}`)
          );
        },
        mockResponse: response
      });
    });

    test('Should call httpAdapter get method with signed url if clientId and apiKey specified', async () => {
      const adapter = new GoogleProvider(mockedHttpAdapter, {
        clientId: 'raoul',
        apiKey: 'foo'
      });
      await verifyHttpAdapter({
        adapter,
        async work() {
          await adapter.geocode('1 champs élysée Paris');
        },
        expectedUrl: 'https://maps.googleapis.com/maps/api/geocode/json',
        expectedParams: {
          address: '1 champs élysée Paris',
          client: 'raoul',
          sensor: false,
          signature: 'PW1yyLFH9lN16B-Iw7EXiAeMKX8='
        },
        mockResponse: defaultResponse
      });
    });

    test('Should generate signatures with all / characters replaced with _', () => {
      const adapter = new GoogleProvider(mockedHttpAdapter, {
        clientId: 'james',
        apiKey: 'foo'
      });
      const params: Record<string, any> = {
        sensor: false,
        client: 'james',
        address: 'qqslfzxytfr'
      };
      adapter._signedRequest(
        'https://maps.googleapis.com/maps/api/geocode/json',
        params
      );
      expect(params.signature).toEqual('ww_ja1wA8YBE_cfwmx9EQ_5y2pI=');
    });

    test('Should generate signatures with all + characters replaced with -', () => {
      const adapter = new GoogleProvider(mockedHttpAdapter, {
        clientId: 'james',
        apiKey: 'foo'
      });
      const params: Record<string, any> = {
        sensor: false,
        client: 'james',
        address: 'lomxcefgkxr'
      };
      adapter._signedRequest(
        'https://maps.googleapis.com/maps/api/geocode/json',
        params
      );
      expect(params.signature).toEqual('zLXE-mmcsjp2RobIXjMd9h3P-zM=');
    });
  });
});
