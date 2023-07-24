import SmartyStreets from 'lib/geocoder/smartystreetsgeocoder';
import { buildHttpAdapter } from 'test/helpers/mocks';
import { verifyHttpAdapter } from 'test/helpers/utils';
import { HTTPAdapter } from 'types';

const mockedHttpAdapter = buildHttpAdapter();
const defaultResponse: unknown[] = [];

describe('SmartyStreets', () => {
  describe('#constructor', () => {
    test('an http adapter must be set', () => {
      expect(() => {
        new SmartyStreets('' as unknown as HTTPAdapter);
      }).toThrow('SmartyStreets need an httpAdapter');
    });

    test('an auth-id and auth-token must be set', () => {
      expect(() => {
        new SmartyStreets(mockedHttpAdapter);
      }).toThrow('You must specify an auth-id and auth-token!');
    });

    test('Should be an instance of SmartyStreets', () => {
      const adapter = new SmartyStreets(mockedHttpAdapter, {
        auth_id: 'AUTH_ID',
        auth_token: 'AUTH_TOKEN'
      });

      expect(adapter).toBeInstanceOf(SmartyStreets);
    });
  });

  describe('#geocode', () => {
    test('Should call httpAdapter get method', async () => {
      const adapter = new SmartyStreets(mockedHttpAdapter, {
        auth_id: 'AUTH_ID',
        auth_token: 'AUTH_TOKEN'
      });

      await verifyHttpAdapter({
        adapter,
        async work() {
          await adapter.geocode('1 Infinite Loop, Cupertino, CA')
        },
        expectedUrl: 'https://api.smartystreets.com/street-address',
        expectedParams: {
          street: '1 Infinite Loop, Cupertino, CA',
          'auth-id': 'AUTH_ID',
          'auth-token': 'AUTH_TOKEN',
          format: 'json'
        },
        mockResponse: defaultResponse
      });
    });
  });

  describe('#reverse', () => {
    test('Should throw expection', async () => {
      const adapter = new SmartyStreets(mockedHttpAdapter, {
        auth_id: 'AUTH_ID',
        auth_token: 'AUTH_TOKEN'
      });

      await expect(
        adapter.reverse({ lat: 10.0235, lon: -2.3662 })
      ).rejects.toThrow('SmartyStreets does not support reverse geocoding');
    });
  });
});
