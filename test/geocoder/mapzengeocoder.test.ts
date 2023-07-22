import sinon from 'sinon';
import MapzenGeocoder from 'lib/geocoder/mapzengeocoder';
import { buildHttpAdapter } from 'test/helpers/mocks';
import { HTTPAdapter } from 'types';

const mockedHttpAdapter = buildHttpAdapter();

describe('MapzenGeocoder', () => {
  describe('#constructor', () => {
    test('an http adapter must be set', () => {
      expect(() => {
        new MapzenGeocoder('' as unknown as HTTPAdapter, { apiKey: '' });
      }).toThrow('MapzenGeocoder need an httpAdapter');
    });

    test('an apiKey must be set', () => {
      expect(() => {
        new MapzenGeocoder(mockedHttpAdapter, { apiKey: '' });
      }).toThrow('MapzenGeocoder needs an apiKey');
    });

    test('Should be an instance of MapzenGeocoder', () => {
      const mapzenAdapter = new MapzenGeocoder(mockedHttpAdapter, {
        apiKey: 'API_KEY'
      });

      expect(mapzenAdapter).toBeInstanceOf(MapzenGeocoder);
    });
  });

  describe('#geocode', () => {
    test('Should not accept IPv4', async () => {
      const mapzenAdapter = new MapzenGeocoder(mockedHttpAdapter, {
        apiKey: 'API_KEY'
      });

      await expect(
        mapzenAdapter.geocode('127.0.0.1')
      ).rejects.toEqual('MapzenGeocoder does not support geocoding IPv4');
    });

    test('Should not accept IPv6', async () => {
      const mapzenAdapter = new MapzenGeocoder(mockedHttpAdapter, {
        apiKey: 'API_KEY'
      });

      await expect(
        mapzenAdapter.geocode(
          '2001:0db8:0000:85a3:0000:0000:ac1f:8001'
        )
      ).rejects.toEqual('MapzenGeocoder does not support geocoding IPv6');
    });
  });

  describe('#reverse', () => {
    test('Should call httpAdapter get method', async () => {
      const mock = sinon.mock(mockedHttpAdapter);
      mock
        .expects('get')
        .once()
        .returns({ then: function () { } });

      const mapzenAdapter = new MapzenGeocoder(mockedHttpAdapter, {
        apiKey: 'API_KEY'
      });

      await mapzenAdapter.reverse({ lat: 10.0235, lon: -2.3662 });

      mock.verify();
    });
  });
});
