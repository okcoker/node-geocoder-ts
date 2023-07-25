import ValueError from 'src/utils/error/ValueError';
import OpenMapQuestProvider from 'src/provider/openmapquest/OpenMapQuestProvider';
import { buildHttpAdapter } from 'src/utils/test/mocks';
import { verifyHttpAdapter } from 'src/utils/test/helpers';
import { HTTPAdapter } from 'src/types';

const mockedHttpAdapter = buildHttpAdapter();
const defaultResponse = {
  results: []
};

describe('OpenMapQuestProvider', () => {
  describe('#constructor', () => {
    test('an http adapter must be set', () => {
      expect(() => {
        new OpenMapQuestProvider('' as unknown as HTTPAdapter);
      }).toThrow('OpenMapQuestProvider need an httpAdapter');
    });

    test('an apiKey must be set', () => {
      expect(() => {
        new OpenMapQuestProvider(mockedHttpAdapter);
      }).toThrow('OpenMapQuestProvider needs an apiKey');
    });

    test('Should be an instance of OpenMapQuestProvider', () => {
      const mapquestAdapter = new OpenMapQuestProvider(mockedHttpAdapter, {
        apiKey: 'API_KEY'
      });

      expect(mapquestAdapter).toBeInstanceOf(OpenMapQuestProvider);
    });
  });

  describe('#geocode', () => {
    test('Should not accept IPv4', async () => {
      const mapquestAdapter = new OpenMapQuestProvider(mockedHttpAdapter, {
        apiKey: 'API_KEY'
      });

      await expect(mapquestAdapter.geocode('127.0.0.1')).rejects.toEqual(
        new ValueError('OpenMapQuestProvider does not support geocoding IPv4')
      );
    });

    test('Should not accept IPv6', () => {
      const mapquestAdapter = new OpenMapQuestProvider(mockedHttpAdapter, {
        apiKey: 'API_KEY'
      });

      expect(
        mapquestAdapter.geocode('2001:0db8:0000:85a3:0000:0000:ac1f:8001')
      ).rejects.toEqual(
        new ValueError('OpenMapQuestProvider does not support geocoding IPv6')
      );
    });
  });

  describe('#reverse', () => {
    test('Should call httpAdapter get method', async () => {
      const adapter = new OpenMapQuestProvider(mockedHttpAdapter, {
        apiKey: 'API_KEY'
      });

      await verifyHttpAdapter({
        adapter,
        async work() {
          adapter.reverse({ lat: 10.0235, lon: -2.3662 });
        },
        mockResponse: defaultResponse
      });
    });
  });
});
