import SmartyStreets from 'lib/geocoder/smartystreetsgeocoder';
import { buildHttpAdapter } from 'test/helpers/mocks';
import { HTTPAdapter } from 'types';

const mockedHttpAdapter = buildHttpAdapter();

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
      const smartyStreetsAdapter = new SmartyStreets(mockedHttpAdapter, {
        auth_id: 'AUTH_ID',
        auth_token: 'AUTH_TOKEN'
      });

      expect(smartyStreetsAdapter).toBeInstanceOf(SmartyStreets);
    });
  });

  describe('#geocode', () => {
    test('Should call httpAdapter get method', async () => {
      const adapterSpy = jest.spyOn(mockedHttpAdapter, 'get');
      const smartyStreetsAdapter = new SmartyStreets(mockedHttpAdapter, {
        auth_id: 'AUTH_ID',
        auth_token: 'AUTH_TOKEN'
      });

      const promise = smartyStreetsAdapter.geocode('1 Infinite Loop, Cupertino, CA');
      expect(adapterSpy).toHaveBeenCalledTimes(1);
      expect(adapterSpy.mock.calls[0][0]).toEqual('https://api.smartystreets.com/street-address')
      expect(adapterSpy.mock.calls[0][1]).toEqual({
        street: '1 Infinite Loop, Cupertino, CA',
        'auth-id': 'AUTH_ID',
        'auth-token': 'AUTH_TOKEN',
        format: 'json'
      });

      // We dont care about the response, but the promise hangs
      // since we're mocking out the http adapter
      await Promise.reject(promise).catch(() => { });
    });
  });

  describe('#reverse', () => {
    test('Should throw expection', async () => {
      const smartyStreetsAdapter = new SmartyStreets(mockedHttpAdapter, {
        auth_id: 'AUTH_ID',
        auth_token: 'AUTH_TOKEN'
      });

      await expect(
        smartyStreetsAdapter.reverse({ lat: 10.0235, lon: -2.3662 })
      ).rejects.toThrow('SmartyStreets does not support reverse geocoding');
    });
  });
});
