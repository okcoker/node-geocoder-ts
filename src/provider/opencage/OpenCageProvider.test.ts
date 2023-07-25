import OpenCageProvider from 'src/provider/opencage/OpenCageProvider';
import { buildHttpAdapter } from 'src/utils/test/mocks';
import { HTTPAdapter } from 'src/types';
import ValueError from 'src/utils/error/ValueError';
import { verifyHttpAdapter } from 'src/utils/test/helpers';

const mockedHttpAdapter = buildHttpAdapter();
const defaultResponse = {
  results: []
};

describe('OpenCageProvider', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });
  describe('#constructor', () => {
    test('an http adapter must be set', () => {
      expect(() => {
        new OpenCageProvider('' as unknown as HTTPAdapter, { apiKey: '' });
      }).toThrow('OpenCageProvider need an httpAdapter');
    });
    test('an apiKey must be set', () => {
      expect(() => {
        new OpenCageProvider(mockedHttpAdapter, { apiKey: '' });
      }).toThrow('OpenCageProvider needs an apiKey');
    });
    test('Should be an instance of OpenCageProvider', () => {
      const adapter = new OpenCageProvider(mockedHttpAdapter, {
        apiKey: 'API_KEY'
      });

      expect(adapter).toBeInstanceOf(OpenCageProvider);
    });
  });
  describe('#geocode', () => {
    test('Should not accept IPv4', async () => {
      const adapter = new OpenCageProvider(mockedHttpAdapter, {
        apiKey: 'API_KEY'
      });

      await expect(
        adapter.geocode('127.0.0.1')
      ).rejects.toThrow(new ValueError('OpenCageProvider does not support geocoding IPv4'));
    });
    test('Should not accept IPv6', async () => {
      const adapter = new OpenCageProvider(mockedHttpAdapter, {
        apiKey: 'API_KEY'
      });

      await expect(
        adapter.geocode('2001:0db8:0000:85a3:0000:0000:ac1f:8001')
      ).rejects.toEqual(new ValueError('OpenCageProvider does not support geocoding IPv6'));
    });
    test('Should call httpAdapter get method', async () => {
      const apiKey = 'API_KEY';
      const address = '1 champs élysée Paris';
      const adapter = new OpenCageProvider(mockedHttpAdapter, {
        apiKey
      });

      await verifyHttpAdapter({
        adapter,
        async work() {
          await adapter.geocode(address);
        },
        expectedParams: {
          q: address,
          key: apiKey
        },
        mockResponse: defaultResponse
      });
    });

    test('Should call httpAdapter get method with components if called with object', async () => {
      const apiKey = 'API_KEY';
      const query = {
        address: '1 champs élysée Paris',
        bounds: [2.01, 48.01, 3.01, 49.01],
        countryCode: 'fr',
        limit: 1,
        minConfidence: 4
      };
      const adapter = new OpenCageProvider(mockedHttpAdapter, {
        apiKey
      });

      await verifyHttpAdapter({
        adapter,
        async work() {
          await adapter.geocode(
            query
          )
        },
        expectedParams: {
          bounds: '2.01,48.01,3.01,49.01',
          countrycode: 'fr',
          key: apiKey,
          limit: 1,
          min_confidence: 4,
          q: '1 champs élysée Paris',
        },
        callCount: 1,
        expectedUrl: 'http://api.opencagedata.com/geocode/v1/json',
        mockResponse: defaultResponse
      });
    });

    test('Should return geocoded address', async () => {
      const response = {
        status: {
          code: 200,
          message: 'OK'
        },
        results: [
          {
            annotations: {
              geohash: '6gydn5nhb587vf642f07',
              timezone: {
                name: 'America/Sao_Paulo',
                now_in_dst: 0,
                offset_sec: -10800,
                offset_string: -300,
                short_name: 'BRT'
              }
            },
            bounds: {
              northeast: {
                lat: -23.5370283,
                lng: -46.8357228
              },
              southwest: {
                lat: -23.5373732,
                lng: -46.8374628
              }
            },
            components: {
              city: 'Carapicuíba',
              country: 'Brazil',
              country_code: 'BR',
              county: 'RMSP',
              road: 'Rua Cafelândia',
              state: 'SP'
            },
            confidence: 10,
            formatted: 'Rua Cafelândia, Carapicuíba, RMSP, SP, Brazil',
            geometry: {
              lat: -23.5373732,
              lng: -46.8374628
            }
          }
        ]
      };

      const adapter = new OpenCageProvider(mockedHttpAdapter, {
        apiKey: 'API_KEY'
      });

      const results = await verifyHttpAdapter({
        adapter,
        async work() {
          return await adapter.geocode(
            'Rua Cafelândia, Carapicuíba, Brasil'
          )
        },
        mockResponse: response
      });


      expect(results.data[0]).toEqual({
        latitude: -23.5373732,
        longitude: -46.8374628,
        country: 'Brazil',
        city: 'Carapicuíba',
        state: 'SP',
        streetName: 'Rua Cafelândia',
        countryCode: 'BR',
        zipcode: undefined,
        streetNumber: undefined,
        county: 'RMSP',
        extra: {
          confidence: 10,
          confidenceKM: 0.25
        }
      });

      expect(results.raw).toEqual({
        status: {
          code: 200,
          message: 'OK'
        },
        results: [
          {
            annotations: {
              geohash: '6gydn5nhb587vf642f07',
              timezone: {
                name: 'America/Sao_Paulo',
                now_in_dst: 0,
                offset_sec: -10800,
                offset_string: -300,
                short_name: 'BRT'
              }
            },
            bounds: {
              northeast: {
                lat: -23.5370283,
                lng: -46.8357228
              },
              southwest: {
                lat: -23.5373732,
                lng: -46.8374628
              }
            },
            components: {
              city: 'Carapicuíba',
              country: 'Brazil',
              country_code: 'BR',
              county: 'RMSP',
              road: 'Rua Cafelândia',
              state: 'SP'
            },
            confidence: 10,
            formatted: 'Rua Cafelândia, Carapicuíba, RMSP, SP, Brazil',
            geometry: {
              lat: -23.5373732,
              lng: -46.8374628
            }
          }
        ]
      });
    });
  });
  describe('#reverse', () => {
    test('Should return geocoded address', async () => {
      const response = {
        status: {
          code: 200,
          message: 'OK'
        },
        results: [
          {
            annotations: {
              geohash: 'u33db8bfx487rtu007b1',
              timezone: {
                name: 'Europe/Berlin',
                now_in_dst: 1,
                offset_sec: 7200,
                offset_string: 200,
                short_name: 'CEST'
              }
            },
            bounds: {
              northeast: {
                lat: 52.5193835,
                lng: 13.3831142
              },
              southwest: {
                lat: 52.5190883,
                lng: 13.3823801
              }
            },
            components: {
              city: 'Berlin',
              city_district: 'Mitte',
              country: 'Germany',
              country_code: 'de',
              house: 'Deutscher Bundestag',
              house_number: 10,
              postcode: 10117,
              road: 'Reichstagufer',
              state: 'Berlin',
              suburb: 'Mitte'
            },
            geometry: {
              lat: 52.51921145,
              lng: 13.3826786867678
            }
          }
        ]
      };
      const adapter = new OpenCageProvider(mockedHttpAdapter, {
        apiKey: 'API_KEY'
      });
      const results = await verifyHttpAdapter({
        adapter,
        async work() {
          return await adapter.reverse(
            { lat: 13.3826786867678, lon: 52.51921145 }
          );
        },
        mockResponse: response
      });

      expect(results.data[0]).toEqual({
        latitude: 52.51921145,
        longitude: 13.3826786867678,
        country: 'Germany',
        city: 'Berlin',
        state: 'Berlin',
        zipcode: 10117,
        streetName: 'Reichstagufer',
        streetNumber: 10,
        countryCode: 'de',
        county: undefined,
        extra: {
          confidence: 0,
          confidenceKM: Number.NaN
        }
      });
    });
  });
});
