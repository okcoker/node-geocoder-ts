var chai = require('chai'),
    should = chai.should(),
    // @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'expect'.
    expect = chai.expect,
    sinon = require('sinon');

// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'YandexGeoc... Remove this comment to see the full error message
var YandexGeocoder = require('../../lib/geocoder/yandexgeocoder.js');

// @ts-expect-error TS(2403): Subsequent variable declarations must have the sam... Remove this comment to see the full error message
var mockedHttpAdapter = {
    get: function() {}
};

// @ts-expect-error TS(2582): Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe('YandexGeocoder', () => {

  // @ts-expect-error TS(2582): Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
  describe('#constructor' , () => {
    // @ts-expect-error TS(2582): Cannot find name 'test'. Do you need to install ty... Remove this comment to see the full error message
    test('an http adapter must be set', () => {
        expect(function() {new YandexGeocoder();}).to.throw(Error, 'YandexGeocoder need an httpAdapter');
    });
  });

  // @ts-expect-error TS(2582): Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
  describe('#geocode' , () => {

    // @ts-expect-error TS(2582): Cannot find name 'test'. Do you need to install ty... Remove this comment to see the full error message
    test('Should not accept IPv4', () => {
      var geocoder = new YandexGeocoder(mockedHttpAdapter);
      expect(function() {
        geocoder.geocode('127.0.0.1');
      }).to.throw(Error, 'YandexGeocoder does not support geocoding IPv4');

    });

    // @ts-expect-error TS(2582): Cannot find name 'test'. Do you need to install ty... Remove this comment to see the full error message
    test('Should not accept IPv6', () => {
      var geocoder = new YandexGeocoder(mockedHttpAdapter);
      expect(function() {
              geocoder.geocode('2001:0db8:0000:85a3:0000:0000:ac1f:8001');
      }).to.throw(Error, 'YandexGeocoder does not support geocoding IPv6');
    });

    // @ts-expect-error TS(2582): Cannot find name 'test'. Do you need to install ty... Remove this comment to see the full error message
    test('Should call httpAdapter get method', () => {
      var mock = sinon.mock(mockedHttpAdapter);
      mock.expects('get').once().returns({then: function() {}});

      var geocoder = new YandexGeocoder(mockedHttpAdapter);
      geocoder.geocode('1 champs élysée Paris');

      mock.verify();
    });

    // @ts-expect-error TS(2582): Cannot find name 'test'. Do you need to install ty... Remove this comment to see the full error message
    test('Should return geocoded address', (done: any) => {
        var mock = sinon.mock(mockedHttpAdapter);
        var jsonResult = {'response':{'GeoObjectCollection':{'metaDataProperty':{'GeocoderResponseMetaData':{'request':'189 Bedford Ave Brooklyn','found':'167','results':'1'}},'featureMember':[{'GeoObject':{'metaDataProperty':{'GeocoderMetaData':{'kind':'street','text':'United States, New York, Kings, Brooklyn Ave','precision':'street','AddressDetails':{'Country':{'AddressLine':'New York, Kings, Brooklyn Ave','CountryNameCode':'US','CountryName':'United States','AdministrativeArea':{'AdministrativeAreaName':'New York','Locality':{'LocalityName':'New York','DependentLocality':{'DependentLocalityName':'Kings','Thoroughfare':{'ThoroughfareName':'Brooklyn Ave'}}}}}}}},'description':'Kings, New York, United States','name':'Brooklyn Ave','boundedBy':{'Envelope':{'lowerCorner':'-73.945613 40.626824','upperCorner':'-73.941229 40.680079'}},'Point':{'pos':'-73.944050 40.653388'}}}]}}};
        mock.expects('get').once().callsArgWith(2, false, jsonResult);

        var geocoder = new YandexGeocoder(mockedHttpAdapter);

        geocoder.geocode('Kabasakal Caddesi, Istanbul, Turkey', function(err: any, results: any) {
            err.should.to.equal(false);

            results[0].should.to.deep.equal({
                'latitude': 40.653388,
                'longitude': -73.944050,
                'country': 'United States',
                'city': 'New York',
                'state' : 'New York',
                'streetName': 'Brooklyn Ave',
                'countryCode': 'US',
                'streetNumber': null,
                'formattedAddress': 'New York, Kings, Brooklyn Ave'
            });

            mock.verify();
            done();
        });
    });

  });

  // @ts-expect-error TS(2582): Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
  describe('#reverse' , () => {
    // @ts-expect-error TS(2582): Cannot find name 'test'. Do you need to install ty... Remove this comment to see the full error message
    test('Should call httpAdapter get method', () => {

      var mock = sinon.mock(mockedHttpAdapter);
      mock.expects('get').once().returns({then: function() {}});

      var googleAdapter = new YandexGeocoder(mockedHttpAdapter);

      googleAdapter.reverse({lat:55.985074,lon:40.018587});

      mock.verify();

    });

    // @ts-expect-error TS(2582): Cannot find name 'test'. Do you need to install ty... Remove this comment to see the full error message
    test('Should return geocoded address', (done: any) => {
      var mock = sinon.mock(mockedHttpAdapter);
      mock.expects('get').once().callsArgWith(2, false,
        {
          'response': {
            'GeoObjectCollection': {
              'metaDataProperty': {
                'GeocoderResponseMetaData': {
                  'request': '40.018587,55.985074',
                  'found': '8',
                  'results': '1',
                  'Point': {
                    'pos': '40.018587 55.985074'
                  }
                }
              },
              'featureMember': [
                {
                  'GeoObject': {
                    'metaDataProperty': {
                      'GeocoderMetaData': {
                        'kind': 'house',
                        'text': 'Россия, Владимирская область, Собинка, Центральная улица, 15',
                        'precision': 'exact',
                        'Address': {
                          'country_code': 'RU',
                          'formatted': 'Владимирская область, Собинка, Центральная улица, 15',
                          'Components': [
                            {
                              'kind': 'country',
                              'name': 'Россия'
                            },
                            {
                              'kind': 'province',
                              'name': 'Центральный федеральный округ'
                            },
                            {
                              'kind': 'province',
                              'name': 'Владимирская область'
                            },
                            {
                              'kind': 'area',
                              'name': 'Собинский район'
                            },
                            {
                              'kind': 'area',
                              'name': 'муниципальное образование город Собинка'
                            },
                            {
                              'kind': 'locality',
                              'name': 'Собинка'
                            },
                            {
                              'kind': 'street',
                              'name': 'Центральная улица'
                            },
                            {
                              'kind': 'house',
                              'name': '15'
                            }
                          ]
                        },
                        'AddressDetails': {
                          'Country': {
                            'AddressLine': 'Владимирская область, Собинка, Центральная улица, 15',
                            'CountryNameCode': 'RU',
                            'CountryName': 'Россия',
                            'AdministrativeArea': {
                              'AdministrativeAreaName': 'Владимирская область',
                              'SubAdministrativeArea': {
                                'SubAdministrativeAreaName': 'Собинский район',
                                'Locality': {
                                  'LocalityName': 'Собинка',
                                  'Thoroughfare': {
                                    'ThoroughfareName': 'Центральная улица',
                                    'Premise': {
                                      'PremiseNumber': '15'
                                    }
                                  }
                                }
                              }
                            }
                          }
                        }
                      }
                    },
                    'description': 'Собинка, Владимирская область, Россия',
                    'name': 'Центральная улица, 15',
                    'boundedBy': {
                      'Envelope': {
                        'lowerCorner': '40.014466 55.982769',
                        'upperCorner': '40.022677 55.987372'
                      }
                    },
                    'Point': {
                      'pos': '40.018571 55.98507'
                    }
                  }
                }
              ]
            }
          }
        }
      );
      var yandexAdapter = new YandexGeocoder(mockedHttpAdapter);
      yandexAdapter.reverse({lat:40.714232,lon:-73.9612889}, function(err: any, results: any) {
        err.should.to.equal(false);
        results[0].should.to.deep.equal({
          'city': 'Собинка',
          'country': 'Россия',
          'countryCode': 'RU',
          'latitude': 55.98507,
          'longitude': 40.018571,
          'state': 'Владимирская область',
          'streetName': 'Центральная улица',
          'streetNumber': '15',
          'formattedAddress': 'Владимирская область, Собинка, Центральная улица, 15'
        });

        mock.verify();
        done();
      });
    });
  });

});
