import ValueError from 'src/utils/error/ValueError';
import YandexProvider from 'src/provider/yandex/YandexProvider';
import { buildHttpAdapter } from 'src/utils/test/mocks';
import { verifyHttpAdapter } from 'src/utils/test/helpers';
import { HTTPAdapter } from 'src/types';

const mockedHttpAdapter = buildHttpAdapter();
const defaultResponse = {
  response: {
    GeoObjectCollection: {
      featureMember: []
    }
  }
};

describe('YandexProvider', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('#constructor', () => {
    test('an http adapter must be set', () => {
      expect(() => {
        new YandexProvider('' as unknown as HTTPAdapter);
      }).toThrow('YandexProvider need an httpAdapter');
    });
  });

  describe('#geocode', () => {
    test('Should not accept IPv4', async () => {
      const adapter = new YandexProvider(mockedHttpAdapter);
      await expect(adapter.geocode('127.0.0.1')).rejects.toEqual(
        new ValueError('YandexProvider does not support geocoding IPv4')
      );
    });

    test('Should not accept IPv6', async () => {
      const adapter = new YandexProvider(mockedHttpAdapter);
      await expect(
        adapter.geocode('2001:0db8:0000:85a3:0000:0000:ac1f:8001')
      ).rejects.toEqual(
        new ValueError('YandexProvider does not support geocoding IPv6')
      );
    });

    test('Should call httpAdapter get method', async () => {
      const adapter = new YandexProvider(mockedHttpAdapter);

      await verifyHttpAdapter({
        adapter,
        async work() {
          adapter.geocode('1 champs élysée Paris');
        },
        callCount: 1,
        mockResponse: defaultResponse
      });
    });

    test('Should return geocoded address', async () => {
      const response = {
        response: {
          GeoObjectCollection: {
            metaDataProperty: {
              GeocoderResponseMetaData: {
                request: '189 Bedford Ave Brooklyn',
                found: '167',
                results: '1'
              }
            },
            featureMember: [
              {
                GeoObject: {
                  metaDataProperty: {
                    GeocoderMetaData: {
                      kind: 'street',
                      text: 'United States, New York, Kings, Brooklyn Ave',
                      precision: 'street',
                      AddressDetails: {
                        Country: {
                          AddressLine: 'New York, Kings, Brooklyn Ave',
                          CountryNameCode: 'US',
                          CountryName: 'United States',
                          AdministrativeArea: {
                            AdministrativeAreaName: 'New York',
                            Locality: {
                              LocalityName: 'New York',
                              DependentLocality: {
                                DependentLocalityName: 'Kings',
                                Thoroughfare: {
                                  ThoroughfareName: 'Brooklyn Ave'
                                }
                              }
                            }
                          }
                        }
                      }
                    }
                  },
                  description: 'Kings, New York, United States',
                  name: 'Brooklyn Ave',
                  boundedBy: {
                    Envelope: {
                      lowerCorner: '-73.945613 40.626824',
                      upperCorner: '-73.941229 40.680079'
                    }
                  },
                  Point: { pos: '-73.944050 40.653388' }
                }
              }
            ]
          }
        }
      };

      const adapter = new YandexProvider(mockedHttpAdapter);
      const results = await verifyHttpAdapter({
        adapter,
        async work() {
          return adapter.geocode('Kabasakal Caddesi, Istanbul, Turkey');
        },
        mockResponse: response
      });

      expect(results.data[0]).toEqual({
        latitude: 40.653388,
        longitude: -73.94405,
        country: 'United States',
        city: 'New York',
        state: 'New York',
        streetName: 'Brooklyn Ave',
        countryCode: 'US',
        formattedAddress: 'New York, Kings, Brooklyn Ave'
      });
    });
  });

  describe('#reverse', () => {
    test('Should call httpAdapter get method', async () => {
      const adapter = new YandexProvider(mockedHttpAdapter);
      await verifyHttpAdapter({
        adapter,
        async work() {
          return adapter.reverse({ lat: 55.985074, lon: 40.018587 });
        },
        callCount: 1,
        mockResponse: defaultResponse
      });
    });

    test('Should return geocoded address', async () => {
      const response = {
        response: {
          GeoObjectCollection: {
            metaDataProperty: {
              GeocoderResponseMetaData: {
                request: '40.018587,55.985074',
                found: '8',
                results: '1',
                Point: {
                  pos: '40.018587 55.985074'
                }
              }
            },
            featureMember: [
              {
                GeoObject: {
                  metaDataProperty: {
                    GeocoderMetaData: {
                      kind: 'house',
                      text: 'Россия, Владимирская область, Собинка, Центральная улица, 15',
                      precision: 'exact',
                      Address: {
                        country_code: 'RU',
                        formatted:
                          'Владимирская область, Собинка, Центральная улица, 15',
                        Components: [
                          {
                            kind: 'country',
                            name: 'Россия'
                          },
                          {
                            kind: 'province',
                            name: 'Центральный федеральный округ'
                          },
                          {
                            kind: 'province',
                            name: 'Владимирская область'
                          },
                          {
                            kind: 'area',
                            name: 'Собинский район'
                          },
                          {
                            kind: 'area',
                            name: 'муниципальное образование город Собинка'
                          },
                          {
                            kind: 'locality',
                            name: 'Собинка'
                          },
                          {
                            kind: 'street',
                            name: 'Центральная улица'
                          },
                          {
                            kind: 'house',
                            name: '15'
                          }
                        ]
                      },
                      AddressDetails: {
                        Country: {
                          AddressLine:
                            'Владимирская область, Собинка, Центральная улица, 15',
                          CountryNameCode: 'RU',
                          CountryName: 'Россия',
                          AdministrativeArea: {
                            AdministrativeAreaName: 'Владимирская область',
                            SubAdministrativeArea: {
                              SubAdministrativeAreaName: 'Собинский район',
                              Locality: {
                                LocalityName: 'Собинка',
                                Thoroughfare: {
                                  ThoroughfareName: 'Центральная улица',
                                  Premise: {
                                    PremiseNumber: '15'
                                  }
                                }
                              }
                            }
                          }
                        }
                      }
                    }
                  },
                  description: 'Собинка, Владимирская область, Россия',
                  name: 'Центральная улица, 15',
                  boundedBy: {
                    Envelope: {
                      lowerCorner: '40.014466 55.982769',
                      upperCorner: '40.022677 55.987372'
                    }
                  },
                  Point: {
                    pos: '40.018571 55.98507'
                  }
                }
              }
            ]
          }
        }
      };
      const adapter = new YandexProvider(mockedHttpAdapter);
      const results = await verifyHttpAdapter({
        adapter,
        async work() {
          return adapter.reverse({ lat: 40.714232, lon: -73.9612889 });
        },
        mockResponse: response
      });

      expect(results.data[0]).toEqual({
        city: 'Собинка',
        country: 'Россия',
        countryCode: 'RU',
        latitude: 55.98507,
        longitude: 40.018571,
        state: 'Владимирская область',
        streetName: 'Центральная улица',
        streetNumber: '15',
        formattedAddress: 'Владимирская область, Собинка, Центральная улица, 15'
      });
    });
  });
});
