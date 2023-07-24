import ValueError from 'lib/error/valueerror';
import TeleportGeocoder from 'lib/geocoder/teleportgeocoder';
import { buildHttpAdapter } from 'test/helpers/mocks';
import { verifyHttpAdapter } from 'test/helpers/utils';
import { HTTPAdapter } from 'types';

const mockedHttpAdapter = buildHttpAdapter();
const defaultResponse = {};

describe('TeleportGeocoder', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });
  describe('#constructor', () => {
    test('an http adapter must be set', () => {
      expect(() => {
        new TeleportGeocoder('' as unknown as HTTPAdapter);
      }).toThrow('TeleportGeocoder need an httpAdapter');
    });

    test('Should be an instance of TeleportGeocoder', () => {
      const adapter = new TeleportGeocoder(mockedHttpAdapter);

      expect(adapter).toBeInstanceOf(TeleportGeocoder);
    });
  });

  describe('#geocode', () => {
    test('Should not accept IPv4', async () => {
      const adapter = new TeleportGeocoder(mockedHttpAdapter);

      await expect(
        adapter.geocode('127.0.0.1')
      ).rejects.toEqual(new ValueError('TeleportGeocoder does not support geocoding IPv4'));
    });

    test('Should not accept IPv6', async () => {
      const adapter = new TeleportGeocoder(mockedHttpAdapter);

      await expect(
        adapter.geocode('2001:0db8:0000:85a3:0000:0000:ac1f:8001')
      ).rejects.toThrow('TeleportGeocoder does not support geocoding IPv6');
    });

    test('Should call mockedHttpAdapter get method', async () => {
      const adapter = new TeleportGeocoder(mockedHttpAdapter);
      await verifyHttpAdapter({
        adapter,
        async work() {
          return await adapter.geocode('New York, NY');
        },
        callCount: 1,
        mockResponse: defaultResponse
      });
    });

    test('Should return geocoded address', async () => {
      const response = {
        _embedded: {
          'city:search-results': [
            {
              _embedded: {
                'city:item': {
                  _embedded: {
                    'city:admin1_division': {
                      geonames_admin1_code: 'CA',
                      name: 'California'
                    },
                    'city:country': {
                      iso_alpha2: 'US',
                      name: 'United States'
                    },
                    'city:urban_area': {
                      _links: {
                        self: {
                          href: 'https://api.teleport.org/api/urban_areas/teleport:9q8yy/'
                        },
                        'ua:images': {
                          href: 'https://api.teleport.org/api/urban_areas/teleport:9q8yy/images/'
                        },
                        'ua:scores': {
                          href: 'https://api.teleport.org/api/urban_areas/teleport:9q8yy/scores/'
                        }
                      },
                      name: 'San Francisco Bay Area',
                      teleport_city_url:
                        'https://my.teleport.org/public/cities/9q8yy/San_Francisco_Bay_Area/',
                      ua_id: '9q8yy'
                    }
                  },
                  location: {
                    geohash: '9q9jh844v274h2gte8sk',
                    latlon: {
                      latitude: 37.44188,
                      longitude: -122.14302
                    }
                  },
                  name: 'Palo Alto',
                  population: 64403
                }
              },
              _links: {
                'city:item': {
                  href: 'https://api.teleport.org/api/cities/geonameid:5380748/'
                }
              },
              matching_full_name: 'Palo Alto, California, United States'
            }
          ]
        }
      };

      const adapter = new TeleportGeocoder(mockedHttpAdapter);
      const results = await verifyHttpAdapter({
        adapter,
        async work() {
          return adapter.geocode('Palo Alto, CA');
        },
        mockResponse: response
      });

      expect(results.data[0]).toEqual({
        latitude: 37.44188,
        longitude: -122.14302,
        city: 'Palo Alto',
        country: 'United States',
        countryCode: 'US',
        state: 'California',
        stateCode: 'CA',
        extra: {
          confidence: 10,
          urban_area: 'San Francisco Bay Area',
          urban_area_api_url:
            'https://api.teleport.org/api/urban_areas/teleport:9q8yy/',
          urban_area_web_url:
            'https://my.teleport.org/public/cities/9q8yy/San_Francisco_Bay_Area/',
          matching_full_name: 'Palo Alto, California, United States'
        }
      });

      expect(results.raw).toEqual(response);
    });
  });

  describe('#reverse', () => {
    test('Should return geocoded address', async () => {
      const response = {
        _embedded: {
          'location:nearest-cities': [
            {
              _embedded: {
                'location:nearest-city': {
                  _embedded: {
                    'city:admin1_division': {
                      _links: {
                        'a1:cities': {
                          href: 'https://api.teleport.org/api/countries/iso_alpha2:US/admin1_divisions/geonames:CA/cities/'
                        },
                        'a1:country': {
                          href: 'https://api.teleport.org/api/countries/iso_alpha2:US/'
                        },
                        self: {
                          href: 'https://api.teleport.org/api/countries/iso_alpha2:US/admin1_divisions/geonames:CA/'
                        }
                      },
                      geoname_id: 5332921,
                      geonames_admin1_code: 'CA',
                      name: 'California'
                    },
                    'city:country': {
                      _links: {
                        'country:admin1_divisions': {
                          href: 'https://api.teleport.org/api/countries/iso_alpha2:US/admin1_divisions/'
                        },
                        self: {
                          href: 'https://api.teleport.org/api/countries/iso_alpha2:US/'
                        }
                      },
                      geoname_id: 6252001,
                      iso_alpha2: 'US',
                      iso_alpha3: 'USA',
                      name: 'United States',
                      population: 310232863
                    },
                    'city:urban_area': {
                      _links: {
                        self: {
                          href: 'https://api.teleport.org/api/urban_areas/teleport:9q8yy/'
                        },
                        'ua:admin1-divisions': [
                          {
                            href: 'https://api.teleport.org/api/countries/iso_alpha2:US/admin1_divisions/geonames:CA/',
                            name: 'California'
                          }
                        ],
                        'ua:countries': [
                          {
                            href: 'https://api.teleport.org/api/countries/iso_alpha2:US/',
                            name: 'United States'
                          }
                        ],
                        'ua:images': {
                          href: 'https://api.teleport.org/api/urban_areas/teleport:9q8yy/images/'
                        },
                        'ua:primary-cities': [
                          {
                            href: 'https://api.teleport.org/api/cities/geonameid:5392171/',
                            name: 'San Jose'
                          },
                          {
                            href: 'https://api.teleport.org/api/cities/geonameid:5391959/',
                            name: 'San Francisco'
                          },
                          {
                            href: 'https://api.teleport.org/api/cities/geonameid:5389489/',
                            name: 'Sacramento'
                          },
                          {
                            href: 'https://api.teleport.org/api/cities/geonameid:5378538/',
                            name: 'Oakland'
                          }
                        ],
                        'ua:scores': {
                          href: 'https://api.teleport.org/api/urban_areas/teleport:9q8yy/scores/'
                        }
                      },
                      name: 'San Francisco Bay Area',
                      teleport_city_url:
                        'https://my.teleport.org/public/cities/9q8yy/San_Francisco_Bay_Area/',
                      ua_id: '9q8yy'
                    }
                  },
                  _links: {
                    'city:admin1_division': {
                      href: 'https://api.teleport.org/api/countries/iso_alpha2:US/admin1_divisions/geonames:CA/',
                      name: 'California'
                    },
                    'city:alternate-names': {
                      href: 'https://api.teleport.org/api/cities/geonameid:5380748/alternate_names/'
                    },
                    'city:country': {
                      href: 'https://api.teleport.org/api/countries/iso_alpha2:US/',
                      name: 'United States'
                    },
                    'city:timezone': {
                      href: 'https://api.teleport.org/api/timezones/iana:America%2FLos_Angeles/',
                      name: 'America/Los_Angeles'
                    },
                    'city:urban_area': {
                      href: 'https://api.teleport.org/api/urban_areas/teleport:9q8yy/',
                      name: 'San Francisco Bay Area'
                    },
                    self: {
                      href: 'https://api.teleport.org/api/cities/geonameid:5380748/'
                    }
                  },
                  full_name: 'Palo Alto, California, United States',
                  geoname_id: 5380748,
                  location: {
                    geohash: '9q9jh844v274h2gte8sk',
                    latlon: {
                      latitude: 37.44188,
                      longitude: -122.14302
                    }
                  },
                  name: 'Palo Alto',
                  population: 64403
                }
              },
              _links: {
                'location:nearest-city': {
                  href: 'https://api.teleport.org/api/cities/geonameid:5380748/',
                  name: 'Palo Alto'
                }
              },
              distance_km: 1.9742334
            }
          ],
          'location:nearest-urban-areas': [
            {
              _links: {
                'location:nearest-urban-area': {
                  href: 'https://api.teleport.org/api/urban_areas/teleport:9q8yy/',
                  name: 'San Francisco Bay Area'
                }
              },
              distance_km: 0
            }
          ]
        },
        _links: {
          curies: [
            {
              href: 'https://developers.teleport.org/api/',
              name: 'location'
            },
            {
              href: 'https://developers.teleport.org/api/',
              name: 'city'
            },
            {
              href: 'https://developers.teleport.org/api/',
              name: 'ua'
            },
            {
              href: 'https://developers.teleport.org/api/',
              name: 'country'
            },
            {
              href: 'https://developers.teleport.org/api/',
              name: 'a1'
            },
            {
              href: 'https://developers.teleport.org/api/',
              name: 'tz'
            }
          ],
          self: {
            href: 'https://api.teleport.org/api/locations/37.455056,-122.158009/'
          }
        },
        coordinates: {
          geohash: '',
          latlon: {
            latitude: 37.455056,
            longitude: -122.158009
          }
        }
      };

      const adapter = new TeleportGeocoder(mockedHttpAdapter);
      const results = await verifyHttpAdapter({
        adapter,
        async work() {
          return await adapter.reverse({
            lat: 37.455056,
            lon: -122.158009
          });
        },
        mockResponse: response
      });

      expect(results.data[0]).toEqual({
        latitude: 37.44188,
        longitude: -122.14302,
        city: 'Palo Alto',
        country: 'United States',
        countryCode: 'US',
        state: 'California',
        stateCode: 'CA',
        extra: {
          confidence: 9.21030664,
          urban_area: 'San Francisco Bay Area',
          urban_area_api_url:
            'https://api.teleport.org/api/urban_areas/teleport:9q8yy/',
          urban_area_web_url:
            'https://my.teleport.org/public/cities/9q8yy/San_Francisco_Bay_Area/',
          distance_km: 1.9742334
        }
      });

      expect(results.raw).toEqual(response);
    });
  });
});
