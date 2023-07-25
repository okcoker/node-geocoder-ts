import ValueError from 'src/utils/error/ValueError';
import AGOLProvider from 'src/provider/agol/AGOLProvider';
import { buildHttpAdapter } from 'src/utils/test/mocks';
import { verifyHttpAdapter } from 'src/utils/test/helpers';

const mockedRequestifyAdapter = buildHttpAdapter({
  requestify() {
    return {};
  }
});

const mockedAuthHttpAdapter = buildHttpAdapter({
  requestify: function () {
    return {};
  },
  get: function () {
    return {
      err: false,
      result: {
        access_token: 'ABCD',
        expires_in: 10000
      }
    };
  }
});

const mockedOptions = {
  client_id: 'CLIENT_ID',
  client_secret: 'CLIENT_SECRET'
};
const defaultResponse = '{"locations": []}';

describe('AGOLProvider', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });
  describe('#constructor', () => {
    test('client_id should be set', () => {
      expect(() => {
        new AGOLProvider(mockedRequestifyAdapter, {
          client_id: '',
          client_secret: 'CLIENT_SECRET'
        });
      }).toThrow(
        'You must specify the client_id and the client_secret'
      );
    });

    test('client_secret should be set', () => {
      expect(() => {
        new AGOLProvider(mockedRequestifyAdapter, {
          client_id: 'CLIENT_ID',
          client_secret: ''
        });
      }).toThrow(
        'You must specify the client_id and the client_secret'
      );
    });

    test('Should be an instance of AGOLProvider if an http adapter and proper options are supplied', () => {
      const adapter = new AGOLProvider(mockedRequestifyAdapter, mockedOptions);

      expect(adapter).toBeInstanceOf(AGOLProvider);
    });
  });

  describe('#geocode', () => {
    test('Should not accept IPv4', async () => {
      const adapter = new AGOLProvider(mockedRequestifyAdapter, mockedOptions);

      await expect(
        adapter.geocode('127.0.0.1')
      ).rejects.toEqual(new ValueError('AGOLProvider does not support geocoding IPv4'));
    });

    test('Should not accept IPv6', async () => {
      const adapter = new AGOLProvider(mockedRequestifyAdapter, mockedOptions);

      await expect(
        adapter.geocode('2001:0db8:0000:85a3:0000:0000:ac1f:8001')
      ).rejects.toEqual(new ValueError('AGOLProvider does not support geocoding IPv6'));
    });

    test('Should call out for authentication', async () => {
      const adapter = new AGOLProvider(mockedAuthHttpAdapter, mockedOptions);

      await verifyHttpAdapter({
        adapter,
        async work() {
          await adapter.geocode('1 champs élysée Paris')
        },
        expectedUrl: 'https://www.arcgis.com/sharing/oauth2/token',
        expectedParams: {
          client_id: mockedOptions.client_id,
          grant_type: 'client_credentials',
          client_secret: mockedOptions.client_secret
        },
        callCount: 2,
        mockResponse: defaultResponse
      });
    });

    test('Should return geocoded address', async () => {
      const adapter = new AGOLProvider(mockedRequestifyAdapter, mockedOptions);

      //Force valid tokens (this was tested separately)
      adapter._getToken = () => Promise.resolve('ABCD');

      const results = await verifyHttpAdapter({
        adapter,
        async work() {
          return await adapter.geocode('380 New York St, Redlands, CA 92373')
        },
        mockResponse: '{"spatialReference":{"wkid":4326,"latestWkid":4326},"locations":[{"name":"380 New York St, Redlands, California, 92373","extent":{"xmin":-117.196701,"ymin":34.055489999999999,"xmax":-117.19470099999999,"ymax":34.057490000000001},"feature":{"geometry":{"x":-117.19566584280369,"y":34.056490727765947},"attributes":{"AddNum":"380","StPreDir":"","StName":"New York","StType":"St","City":"Redlands","Postal":"92373","Region":"California","Country":"USA"}}}]}'
      });
      expect(results.data[0]).toEqual({
        latitude: 34.05649072776595,
        longitude: -117.19566584280369,
        country: 'USA',
        city: 'Redlands',
        state: 'California',
        stateCode: undefined,
        zipcode: '92373',
        streetName: 'New York St',
        streetNumber: '380',
        countryCode: 'USA'
      });
    });

    test('Should handle a not "OK" status', async () => {
      const adapter = new AGOLProvider(mockedAuthHttpAdapter, mockedOptions);
      //Force valid tokens (this was tested separately)
      adapter._getToken = () => Promise.resolve('ABCD');

      await verifyHttpAdapter({
        adapter,
        async work() {
          await expect(
            adapter.geocode('380 New York St, Redlands, CA 92373')
          ).rejects.toEqual({
            code: 498,
            message: 'Invalid Token',
            details: []
          })
        },
        mockResponse: '{"error":{"code":498,"message":"Invalid Token","details":[]}}'
      });
    });
  });

  describe('#reverse', () => {
    test('Should call httpAdapter get method', async () => {
      const adapter = new AGOLProvider(mockedAuthHttpAdapter, mockedOptions);

      await verifyHttpAdapter({
        adapter,
        async work() {
          await adapter.reverse({ lat: 10.0235, lon: -2.3662 })
        },
        callCount: 2,
        mockResponse: defaultResponse
      });
    });

    test('Should return a reverse geocoded address', async () => {
      const adapter = new AGOLProvider(mockedRequestifyAdapter, mockedOptions);
      //Force valid tokens (this was tested separately)
      adapter._getToken = () => Promise.resolve('ABCD');

      const results = await verifyHttpAdapter({
        adapter,
        async work() {
          return adapter.reverse({ lat: -104.98469734299971, lon: 39.739146640000456 });
        },
        mockResponse: '{"address":{"Address":"1190 E Kenyon Ave","Neighborhood":null,"City":"Englewood","Subregion":null,"Region":"Colorado","Postal":"80113","PostalExt":null,"CountryCode":"USA","Loc_name":"USA.PointAddress"},"location":{"x":-104.97389993455704,"y":39.649423090952013,"spatialReference":{"wkid":4326,"latestWkid":4326}}}'
      });

      expect(results.data[0]).toEqual({
        latitude: 39.64942309095201,
        longitude: -104.97389993455704,
        country: 'USA',
        city: 'Englewood',
        state: 'Colorado',
        zipcode: '80113',
        countryCode: 'USA',
        address: '1190 E Kenyon Ave',
        neighborhood: null,
        loc_name: 'USA.PointAddress'
      });
    });

    test('Should handle a not "OK" status', async () => {
      const adapter = new AGOLProvider(mockedRequestifyAdapter, mockedOptions);
      //Force valid tokens (this was tested separately)
      adapter._getToken = () => Promise.resolve('ABCD');

      await verifyHttpAdapter({
        adapter,
        async work() {
          await expect(
            adapter.reverse({ lat: 40.714232, lon: -73.9612889 })
          ).rejects.toEqual({
            code: 42,
            message: 'Random Error',
            details: []
          })
        },
        mockResponse: '{"error":{"code":42,"message":"Random Error","details":[]}}'
      });
    });
  });
});
