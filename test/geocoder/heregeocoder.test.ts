import ValueError from 'lib/error/valueerror';
import HereGeocoder from 'lib/geocoder/heregeocoder';
import { buildHttpAdapter } from 'test/helpers/mocks';
import { verifyHttpAdapter } from 'test/helpers/utils';
import { HTTPAdapter } from 'types';

const mockedHttpAdapter = buildHttpAdapter();

describe('HereGeocoder', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });
  describe('#constructor', () => {
    test('an http adapter must be set', () => {
      expect(() => {
        new HereGeocoder('' as unknown as HTTPAdapter, { apiKey: '' });
      }).toThrow('HereGeocoder need an httpAdapter');
    });

    test('requires appId and appCode to be specified', () => {
      expect(() => {
        new HereGeocoder(mockedHttpAdapter, { apiKey: '' });
      }).toThrow('You must specify apiKey to use Here Geocoder');
      expect(() => {
        new HereGeocoder(mockedHttpAdapter, {
          appId: 'APP_ID',
          appCode: ''
        });
      }).toThrow(
        'You must specify apiKey to use Here Geocoder'
      );
      expect(() => {
        new HereGeocoder(mockedHttpAdapter, {
          appId: '',
          appCode: 'APP_CODE'
        });
      }).toThrow('You must specify apiKey to use Here Geocoder');
    });

    test('Should be an instance of HereGeocoder if an http adapter, appId, and appCode are provided', () => {
      const hereAdapter = new HereGeocoder(mockedHttpAdapter, {
        appId: 'APP_ID',
        appCode: 'APP_CODE'
      });

      expect(hereAdapter).toBeInstanceOf(HereGeocoder);
    });

    test('Should use CIT endpoint, if production is not provided', () => {
      const hereAdapter = new HereGeocoder(mockedHttpAdapter, {
        appId: 'APP_ID',
        appCode: 'APP_CODE'
      });

      expect(hereAdapter._geocodeEndpoint).toEqual(
        'https://geocoder.ls.hereapi.com/6.2/geocode.json'
      );
      expect(hereAdapter._reverseEndpoint).toEqual(
        'https://reverse.geocoder.ls.hereapi.com/6.2/reversegeocode.json'
      );
    });

    test('Should use production endpoint, if production is provided', () => {
      const hereAdapter = new HereGeocoder(mockedHttpAdapter, {
        appId: 'APP_ID',
        appCode: 'APP_CODE',
        production: true
      });

      expect(hereAdapter._geocodeEndpoint).toEqual(
        'https://geocoder.ls.hereapi.com/6.2/geocode.json'
      );
      expect(hereAdapter._reverseEndpoint).toEqual(
        'https://reverse.geocoder.ls.hereapi.com/6.2/reversegeocode.json'
      );
    });
  });

  describe('#geocode', () => {
    test('Should not accept IPv4', async () => {
      const hereAdapter = new HereGeocoder(mockedHttpAdapter, {
        appId: 'APP_ID',
        appCode: 'APP_CODE'
      });

      await expect(
        hereAdapter.geocode('127.0.0.1')
      ).rejects.toEqual(new ValueError('HereGeocoder does not support geocoding IPv4'));
    });

    test('Should not accept IPv6', async () => {
      const hereAdapter = new HereGeocoder(mockedHttpAdapter, {
        appId: 'APP_ID',
        appCode: 'APP_CODE'
      });

      await expect(
        hereAdapter.geocode(
          '2001:0db8:0000:85a3:0000:0000:ac1f:8001'
        )
      ).rejects.toEqual(new ValueError('HereGeocoder does not support geocoding IPv6'));
    });

    test('Should call httpAdapter get method', async () => {
      const adapter = new HereGeocoder(mockedHttpAdapter, {
        appId: 'APP_ID',
        appCode: 'APP_CODE'
      });
      await verifyHttpAdapter({
        adapter,
        async work() {
          return adapter.geocode('1 champs élysée Paris')
        },
        expectedParams: {
          searchtext: '1 champs élysée Paris',
          app_code: 'APP_CODE',
          app_id: 'APP_ID',
          additionaldata: 'Country2,true',
          gen: 8
        },
        expectedUrl: 'https://geocoder.ls.hereapi.com/6.2/geocode.json',
        callCount: 1
      });
    });

    test('Should call httpAdapter get method with language if specified', async () => {
      const adapter = new HereGeocoder(mockedHttpAdapter, {
        appId: 'APP_ID',
        appCode: 'APP_CODE',
        language: 'en'
      });
      await verifyHttpAdapter({
        adapter,
        async work() {
          return adapter.geocode('1 champs élysée Paris')
        },
        expectedParams: {
          searchtext: '1 champs élysée Paris',
          language: 'en',
          app_code: 'APP_CODE',
          app_id: 'APP_ID',
          additionaldata: 'Country2,true',
          gen: 8
        },
        expectedUrl: 'https://geocoder.ls.hereapi.com/6.2/geocode.json'
      });
    });

    test('Should call httpAdapter get method with politicalView if specified', async () => {
      const adapter = new HereGeocoder(mockedHttpAdapter, {
        appId: 'APP_ID',
        appCode: 'APP_CODE',
        politicalView: 'GRE'
      });
      await verifyHttpAdapter({
        adapter,
        async work() {
          return adapter.geocode('1 champs élysée Paris')
        },
        expectedParams: {
          searchtext: '1 champs élysée Paris',
          politicalview: 'GRE',
          app_code: 'APP_CODE',
          app_id: 'APP_ID',
          additionaldata: 'Country2,true',
          gen: 8
        },
        expectedUrl: 'https://geocoder.ls.hereapi.com/6.2/geocode.json'
      });
    });

    test('Should call httpAdapter get method with country if specified', async () => {
      const adapter = new HereGeocoder(mockedHttpAdapter, {
        appId: 'APP_ID',
        appCode: 'APP_CODE',
        country: 'FR'
      });
      await verifyHttpAdapter({
        adapter,
        async work() {
          return adapter.geocode('1 champs élysée Paris')
        },
        expectedParams: {
          searchtext: '1 champs élysée Paris',
          country: 'FR',
          app_code: 'APP_CODE',
          app_id: 'APP_ID',
          additionaldata: 'Country2,true',
          gen: 8
        },
        expectedUrl: 'https://geocoder.ls.hereapi.com/6.2/geocode.json'
      });
    });

    test('Should call httpAdapter get method with state if specified', async () => {
      const adapter = new HereGeocoder(mockedHttpAdapter, {
        appId: 'APP_ID',
        appCode: 'APP_CODE',
        state: 'Île-de-France'
      });
      await verifyHttpAdapter({
        adapter,
        async work() {
          return adapter.geocode('1 champs élysée Paris')
        },
        expectedParams: {
          searchtext: '1 champs élysée Paris',
          state: 'Île-de-France',
          app_code: 'APP_CODE',
          app_id: 'APP_ID',
          additionaldata: 'Country2,true',
          gen: 8
        },
        expectedUrl: 'https://geocoder.ls.hereapi.com/6.2/geocode.json'
      });
    });

    test('Should call httpAdapter get method with components if called with object', async () => {
      const adapter = new HereGeocoder(mockedHttpAdapter, {
        appId: 'APP_ID',
        appCode: 'APP_CODE'
      });
      await verifyHttpAdapter({
        adapter,
        async work() {
          return adapter.geocode({
            address: '1 champs élysée Paris',
            zipcode: '75008',
            country: 'FR'
          })
        },
        expectedParams: {
          searchtext: '1 champs élysée Paris',
          country: 'FR',
          postalcode: '75008',
          app_code: 'APP_CODE',
          app_id: 'APP_ID',
          additionaldata: 'Country2,true',
          gen: 8
        },
        expectedUrl: 'https://geocoder.ls.hereapi.com/6.2/geocode.json'
      });
    });

    test('Should call httpAdapter get method without default state if called with object containing country', async () => {
      const adapter = new HereGeocoder(mockedHttpAdapter, {
        appId: 'APP_ID',
        appCode: 'APP_CODE',
        country: 'FR',
        state: 'Île-de-France'
      });
      await verifyHttpAdapter({
        adapter,
        async work() {
          return adapter.geocode({
            address: 'Kaiserswerther Str 10, Berlin',
            country: 'DE'
          })
        },
        expectedParams: {
          searchtext: 'Kaiserswerther Str 10, Berlin',
          country: 'DE',
          app_code: 'APP_CODE',
          app_id: 'APP_ID',
          additionaldata: 'Country2,true',
          gen: 8
        },
        expectedUrl: 'https://geocoder.ls.hereapi.com/6.2/geocode.json'
      });
    });

    test('Should return geocoded address', async () => {
      const response = {
        Response: {
          MetaInfo: { Timestamp: '2015-08-21T07:53:51.042+0000' },
          View: [
            {
              _type: 'SearchResultsViewType',
              ViewId: 0,
              Result: [
                {
                  Relevance: 1,
                  MatchLevel: 'houseNumber',
                  MatchQuality: { City: 1, Street: [1], HouseNumber: 1 },
                  MatchType: 'pointAddress',
                  Location: {
                    LocationId: 'NT_l-pW8M-6wY8Ylp8zHdjc7C_xAD',
                    LocationType: 'address',
                    DisplayPosition: {
                      Latitude: 52.44841,
                      Longitude: 13.28755
                    },
                    NavigationPosition: [
                      { Latitude: 52.44854, Longitude: 13.2874 }
                    ],
                    MapView: {
                      TopLeft: {
                        Latitude: 52.4495342,
                        Longitude: 13.2857055
                      },
                      BottomRight: {
                        Latitude: 52.4472858,
                        Longitude: 13.2893945
                      }
                    },
                    Address: {
                      Label:
                        'Kaiserswerther Straße 10, 14195 Berlin, Deutschland',
                      Country: 'DEU',
                      State: 'Berlin',
                      County: 'Berlin',
                      City: 'Berlin',
                      District: 'Dahlem',
                      Street: 'Kaiserswerther Straße',
                      HouseNumber: '10',
                      PostalCode: '14195',
                      AdditionalData: [
                        { value: 'DE', key: 'Country2' },
                        { value: 'Deutschland', key: 'CountryName' },
                        { value: 'Berlin', key: 'StateName' },
                        { value: 'Berlin', key: 'CountyName' }
                      ]
                    }
                  }
                }
              ]
            }
          ]
        }
      };
      const adapter = new HereGeocoder(mockedHttpAdapter, {
        appId: 'APP_ID',
        appCode: 'APP_CODE'
      });
      const results = await verifyHttpAdapter({
        adapter,
        async work() {
          return adapter.geocode(
            'Kaiserswerther Str 10, Berlin'
          )
        },
        mockResponse: response
      });

      expect(results.data[0]).toEqual({
        formattedAddress:
          'Kaiserswerther Straße 10, 14195 Berlin, Deutschland',
        latitude: 52.44841,
        longitude: 13.28755,
        country: 'Deutschland',
        countryCode: 'DE',
        state: 'Berlin',
        county: 'Berlin',
        city: 'Berlin',
        zipcode: '14195',
        district: 'Dahlem',
        streetName: 'Kaiserswerther Straße',
        streetNumber: '10',
        extra: {
          herePlaceId: 'NT_l-pW8M-6wY8Ylp8zHdjc7C_xAD',
          confidence: 1
        },
        administrativeLevels: {
          level1long: 'Berlin',
          level2long: 'Berlin'
        }
      });

      expect(results.raw).toEqual(response);
    });

    test('Should handle a not "OK" status', async () => {
      const adapter = new HereGeocoder(mockedHttpAdapter, {
        appId: 'APP_ID',
        appCode: 'APP_CODE'
      });
      await verifyHttpAdapter({
        adapter,
        async work() {
          await expect(
            adapter.geocode(
              '1 champs élysées Paris'
            )
          ).rejects.toEqual(new Error('Response status code is 401'))
        },
        mockError: new Error('Response status code is 401'),
        mockResponse: {
          details: 'invalid credentials for APP_ID',
          additionalData: [],
          type: 'PermissionError',
          subtype: 'InvalidCredentials'
        }
      });
    });

    test('Should handle an empty response', async () => {
      const adapter = new HereGeocoder(mockedHttpAdapter, {
        appId: 'APP_ID',
        appCode: 'APP_CODE'
      });
      const results = await verifyHttpAdapter({
        adapter,
        async work() {
          return adapter.geocode(
            '1 champs élysées Paris'
          )
        },
        mockResponse: {
          Response: {
            MetaInfo: { Timestamp: '2015-08-21T07:53:52.120+0000' },
            View: [{ _type: 'SearchResultsViewType', ViewId: 0, Result: [] }]
          }
        }
      });

      expect(results.data).toHaveLength(0);

      expect(results.raw).toEqual({
        Response: {
          MetaInfo: { Timestamp: '2015-08-21T07:53:52.120+0000' },
          View: [{ _type: 'SearchResultsViewType', ViewId: 0, Result: [] }]
        }
      });
    });

    test('Should handle an unauthorized response', async () => {
      const adapter = new HereGeocoder(mockedHttpAdapter, {
        apiKey: 'API_KEY'
      });
      await verifyHttpAdapter({
        adapter,
        async work() {
          await expect(
            adapter.geocode(
              '1 champs élysées Paris'
            )
          ).rejects.toEqual(new ValueError('apiKey invalid. apiKey not found.'))
        },
        mockResponse: {
          error: 'Unauthorized',
          error_description: 'apiKey invalid. apiKey not found.'
        }
      });
    });
  });

  describe('#reverse', () => {
    test('Should call httpAdapter get method', async () => {
      const adapter = new HereGeocoder(mockedHttpAdapter, {
        appId: 'APP_ID',
        appCode: 'APP_CODE'
      });
      await verifyHttpAdapter({
        adapter,
        async work() {
          return adapter.reverse({ lat: 10.0235, lon: -2.3662 });
        },
        callCount: 1
      });
    });

    test('Should return geocoded address', async () => {
      const response = {
        Response: {
          MetaInfo: { Timestamp: '2015-08-21T08:06:54.108+0000' },
          View: [
            {
              _type: 'SearchResultsViewType',
              ViewId: 0,
              Result: [
                {
                  Relevance: 0.86,
                  Distance: 14,
                  MatchLevel: 'street',
                  MatchQuality: {
                    Country: 1,
                    State: 1,
                    County: 1,
                    City: 1,
                    District: 1,
                    Street: [1],
                    PostalCode: 1
                  },
                  Location: {
                    LocationId: 'NT_mlPPLwmK3VpdUm-Z9Dq0GD_l_21619568_R',
                    LocationType: 'address',
                    DisplayPosition: {
                      Latitude: 40.7143119,
                      Longitude: -73.9614172
                    },
                    NavigationPosition: [
                      { Latitude: 40.7143119, Longitude: -73.9614172 }
                    ],
                    MapView: {
                      TopLeft: { Latitude: 40.71489, Longitude: -73.96168 },
                      BottomRight: {
                        Latitude: 40.71389,
                        Longitude: -73.9609
                      }
                    },
                    Address: {
                      Label: 'Bedford Ave, Brooklyn, NY 11211, United States',
                      Country: 'USA',
                      State: 'NY',
                      County: 'Kings',
                      City: 'Brooklyn',
                      District: 'Williamsburg',
                      Street: 'Bedford Ave',
                      PostalCode: '11211',
                      AdditionalData: [
                        { value: 'US', key: 'Country2' },
                        { value: 'United States', key: 'CountryName' },
                        { value: 'New York', key: 'StateName' },
                        { value: 'Kings', key: 'CountyName' },
                        { value: 'N', key: 'PostalCodeType' }
                      ]
                    },
                    MapReference: {
                      ReferenceId: '21619568',
                      MapId: 'NAAM15134',
                      MapVersion: 'Q1/2015',
                      Spot: 0.69,
                      SideOfStreet: 'right',
                      CountryId: '21000001',
                      StateId: '21010819',
                      CountyId: '21019046'
                    }
                  }
                }
              ]
            }
          ]
        }
      };

      const adapter = new HereGeocoder(mockedHttpAdapter, {
        appId: 'APP_ID',
        appCode: 'APP_CODE'
      });
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
        formattedAddress: 'Bedford Ave, Brooklyn, NY 11211, United States',
        latitude: 40.7143119,
        longitude: -73.9614172,
        country: 'United States',
        countryCode: 'US',
        state: 'New York',
        county: 'Kings',
        city: 'Brooklyn',
        zipcode: '11211',
        district: 'Williamsburg',
        streetName: 'Bedford Ave',
        extra: {
          herePlaceId: 'NT_mlPPLwmK3VpdUm-Z9Dq0GD_l_21619568_R',
          confidence: 0.86
        },
        administrativeLevels: {
          level1long: 'New York',
          level2long: 'Kings'
        }
      });

      expect(results.raw).toEqual({
        Response: {
          MetaInfo: { Timestamp: '2015-08-21T08:06:54.108+0000' },
          View: [
            {
              _type: 'SearchResultsViewType',
              ViewId: 0,
              Result: [
                {
                  Relevance: 0.86,
                  Distance: 14,
                  MatchLevel: 'street',
                  MatchQuality: {
                    Country: 1,
                    State: 1,
                    County: 1,
                    City: 1,
                    District: 1,
                    Street: [1],
                    PostalCode: 1
                  },
                  Location: {
                    LocationId: 'NT_mlPPLwmK3VpdUm-Z9Dq0GD_l_21619568_R',
                    LocationType: 'address',
                    DisplayPosition: {
                      Latitude: 40.7143119,
                      Longitude: -73.9614172
                    },
                    NavigationPosition: [
                      { Latitude: 40.7143119, Longitude: -73.9614172 }
                    ],
                    MapView: {
                      TopLeft: {
                        Latitude: 40.71489,
                        Longitude: -73.96168
                      },
                      BottomRight: {
                        Latitude: 40.71389,
                        Longitude: -73.9609
                      }
                    },
                    Address: {
                      Label:
                        'Bedford Ave, Brooklyn, NY 11211, United States',
                      Country: 'USA',
                      State: 'NY',
                      County: 'Kings',
                      City: 'Brooklyn',
                      District: 'Williamsburg',
                      Street: 'Bedford Ave',
                      PostalCode: '11211',
                      AdditionalData: [
                        { value: 'US', key: 'Country2' },
                        { value: 'United States', key: 'CountryName' },
                        { value: 'New York', key: 'StateName' },
                        { value: 'Kings', key: 'CountyName' },
                        { value: 'N', key: 'PostalCodeType' }
                      ]
                    },
                    MapReference: {
                      ReferenceId: '21619568',
                      MapId: 'NAAM15134',
                      MapVersion: 'Q1/2015',
                      Spot: 0.69,
                      SideOfStreet: 'right',
                      CountryId: '21000001',
                      StateId: '21010819',
                      CountyId: '21019046'
                    }
                  }
                }
              ]
            }
          ]
        }
      });
    });

    test('Should handle a not "OK" status', async () => {
      const adapter = new HereGeocoder(mockedHttpAdapter, {
        appId: 'APP_ID',
        appCode: 'APP_CODE'
      });
      await verifyHttpAdapter({
        adapter,
        async work() {
          await expect(
            adapter.reverse(
              { lat: 40.714232, lon: -73.9612889 }
            )
          ).rejects.toEqual(new Error('Response status code is 401'))
        },
        mockResponse: {
          details: 'invalid credentials for APP_ID',
          additionalData: [],
          type: 'PermissionError',
          subtype: 'InvalidCredentials'
        },
        mockError: new Error('Response status code is 401')
      });
      // @todo Do we still want to send raw responses when there's an error?
      // expect(results.raw).toEqual({
      //   details: 'invalid credentials for APP_ID',
      //   additionalData: [],
      //   type: 'PermissionError',
      //   subtype: 'InvalidCredentials'
      // });

    });

    test('Should handle an empty response', async () => {
      const response = {
        Response: {
          MetaInfo: { Timestamp: '2015-08-21T07:54:07.908+0000' },
          View: [{ _type: 'SearchResultsViewType', ViewId: 0, Result: [] }]
        }
      };

      const adapter = new HereGeocoder(mockedHttpAdapter, {
        appId: 'APP_ID',
        appCode: 'APP_CODE'
      });
      const results = await verifyHttpAdapter({
        adapter,
        async work() {
          return adapter.reverse(
            { lat: 40.714232, lon: -73.9612889 }
          )
        },
        mockResponse: response
      });

      expect(results.data).toHaveLength(0);

      expect(results.raw).toEqual({
        Response: {
          MetaInfo: { Timestamp: '2015-08-21T07:54:07.908+0000' },
          View: [{ _type: 'SearchResultsViewType', ViewId: 0, Result: [] }]
        }
      });
    });

    //     it('Should handle a not "OK" status', function(done) {
    //         const mock = sinon.mock(mockedHttpAdapter);
    //         mock.expects('get').once().callsArgWith(2, false, { status: "OVER_QUERY_LIMIT", error_message: "You have exceeded your rate-limit for this API.", results: [] });

    //         const hereAdapter = new HereGeocoder(mockedHttpAdapter);

    //         hereAdapter.reverse({lat:40.714232,lon:-73.9612889}, function(err, results) {
    //             err.message.should.to.equal("Status is OVER_QUERY_LIMIT. You have exceeded your rate-limit for this API.");
    //             mock.verify();
    //             done();
    //         });
    //     });

    //     it('Should handle a not "OK" status and no error_message', function(done) {
    //         const mock = sinon.mock(mockedHttpAdapter);
    //         mock.expects('get').once().callsArgWith(2, false, { status: "INVALID_REQUEST", results: [] });

    //         const hereAdapter = new HereGeocoder(mockedHttpAdapter);

    //         hereAdapter.reverse({lat:40.714232,lon:-73.9612889}, function(err, results) {
    //             err.message.should.to.equal("Status is INVALID_REQUEST.");
    //             mock.verify();
    //             done();
    //         });
    //     });

    //     it('Should call httpAdapter get method with signed url if appId and appCode specified', function() {
    //         const mock = sinon.mock(mockedHttpAdapter);
    //         mock.expects('get').withArgs('https://maps.hereapis.com/maps/api/geocode/json', {
    //             address: "1 champs élysée Paris",
    //             client: "raoul",
    //             sensor: false,
    //             signature: "PW1yyLFH9lN16B-Iw7EXiAeMKX8="
    //         }).once().returns({then: function() {}});

    //         const hereAdapter = new HereGeocoder(mockedHttpAdapter, {appId: 'raoul', appCode: 'foo'});

    //         hereAdapter.geocode('1 champs élysée Paris');

    //         mock.verify();
    //     });

    //     it('Should generate signatures with all / characters replaced with _', function() {
    //         const hereAdapter = new HereGeocoder(mockedHttpAdapter, {appId: 'james', appCode: 'foo'});
    //         const params = {
    //           sensor: false,
    //           client: 'james',
    //           address:  'qqslfzxytfr'
    //         };
    //         hereAdapter._signedRequest('https://maps.hereapis.com/maps/api/geocode/json', params);
    //         expect(params.signature).to.equal('ww_ja1wA8YBE_cfwmx9EQ_5y2pI=');
    //     });

    //     it('Should generate signatures with all + characters replaced with -', function() {
    //         const hereAdapter = new HereGeocoder(mockedHttpAdapter, {appId: 'james', appCode: 'foo'});
    //         const params = {
    //           sensor: false,
    //           client: 'james',
    //           address: 'lomxcefgkxr'
    //         };
    //         hereAdapter._signedRequest('https://maps.hereapis.com/maps/api/geocode/json', params);
    //         expect(params.signature).to.equal('zLXE-mmcsjp2RobIXjMd9h3P-zM=');
    //     });
  });
});
