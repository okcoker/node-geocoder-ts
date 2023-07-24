import ValueError from 'lib/error/valueerror';
import MapQuestGeocoder from 'lib/geocoder/openmapquestgeocoder';
import { buildHttpAdapter } from 'test/helpers/mocks';
import { verifyHttpAdapter } from 'test/helpers/utils';
import { HTTPAdapter } from 'types';

const mockedHttpAdapter = buildHttpAdapter();

describe('MapQuestGeocoder', () => {
  describe('#constructor', () => {
    test('an http adapter must be set', () => {
      expect(() => {
        new MapQuestGeocoder('' as unknown as HTTPAdapter);
      }).toThrow('OpenMapQuestGeocoder need an httpAdapter');
    });

    test('an apiKey must be set', () => {
      expect(() => {
        new MapQuestGeocoder(mockedHttpAdapter);
      }).toThrow('OpenMapQuestGeocoder needs an apiKey');
    });

    test('Should be an instance of MapQuestGeocoder', () => {
      const mapquestAdapter = new MapQuestGeocoder(mockedHttpAdapter, {
        apiKey: 'API_KEY'
      });

      expect(mapquestAdapter).toBeInstanceOf(MapQuestGeocoder);
    });
  });

  describe('#geocode', () => {
    test('Should not accept IPv4', async () => {
      const mapquestAdapter = new MapQuestGeocoder(mockedHttpAdapter, {
        apiKey: 'API_KEY'
      });

      await expect(
        mapquestAdapter.geocode('127.0.0.1')
      ).rejects.toEqual(
        new ValueError('OpenMapQuestGeocoder does not support geocoding IPv4')
      );
    });

    test('Should not accept IPv6', () => {
      const mapquestAdapter = new MapQuestGeocoder(mockedHttpAdapter, {
        apiKey: 'API_KEY'
      });

      expect(
        mapquestAdapter.geocode(
          '2001:0db8:0000:85a3:0000:0000:ac1f:8001'
        )
      ).rejects.toEqual(
        new ValueError('OpenMapQuestGeocoder does not support geocoding IPv6')
      );
    });
  });

  describe('#reverse', () => {
    test('Should call httpAdapter get method', async () => {
      const adapter = new MapQuestGeocoder(mockedHttpAdapter, {
        apiKey: 'API_KEY'
      });

      await verifyHttpAdapter({
        adapter,
        async work() {
          adapter.reverse({ lat: 10.0235, lon: -2.3662 });
        }
      });
    });
  });
});
