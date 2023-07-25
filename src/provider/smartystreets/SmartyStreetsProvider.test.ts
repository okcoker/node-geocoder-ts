import SmartyStreetsProvider from 'src/provider/smartystreets/SmartyStreetsProvider';
import { buildHttpAdapter } from 'src/utils/test/mocks';
import { verifyHttpAdapter } from 'src/utils/test/helpers';
import { HTTPAdapter } from 'src/types';

const mockedHttpAdapter = buildHttpAdapter();
const defaultResponse: unknown[] = [];

describe('SmartyStreetsProvider', () => {
  describe('#constructor', () => {
    test('an http adapter must be set', () => {
      expect(() => {
        new SmartyStreetsProvider('' as unknown as HTTPAdapter);
      }).toThrow('SmartyStreetsProvider need an httpAdapter');
    });

    test('an auth-id and auth-token must be set', () => {
      expect(() => {
        new SmartyStreetsProvider(mockedHttpAdapter);
      }).toThrow('You must specify an auth-id and auth-token!');
    });

    test('Should be an instance of SmartyStreetsProvider', () => {
      const adapter = new SmartyStreetsProvider(mockedHttpAdapter, {
        auth_id: 'AUTH_ID',
        auth_token: 'AUTH_TOKEN'
      });

      expect(adapter).toBeInstanceOf(SmartyStreetsProvider);
    });
  });

  describe('#geocode', () => {
    test('Should call httpAdapter get method', async () => {
      const adapter = new SmartyStreetsProvider(mockedHttpAdapter, {
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
      const adapter = new SmartyStreetsProvider(mockedHttpAdapter, {
        auth_id: 'AUTH_ID',
        auth_token: 'AUTH_TOKEN'
      });

      await expect(
        adapter.reverse({ lat: 10.0235, lon: -2.3662 })
      ).rejects.toThrow('SmartyStreetsProvider does not support reverse geocoding');
    });
  });
});
