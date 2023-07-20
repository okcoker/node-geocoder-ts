import chai from 'chai';
import sinon from 'sinon';
import OpenStreetMapGeocoder from 'lib/geocoder/openstreetmapgeocoder';
import { buildHttpAdapter } from 'test/helpers/mocks';
import { HTTPAdapter } from 'types';

chai.should();
const expect = chai.expect;
const mockedHttpAdapter = buildHttpAdapter();

describe('OpenStreetMapGeocoder', () => {
  describe('#constructor', () => {
    test('an http adapter must be set', () => {
      expect(() => {
        new OpenStreetMapGeocoder('' as unknown as HTTPAdapter);
      }).to.throw(Error, 'OpenStreetMapGeocoder need an httpAdapter');
    });

    test('Should be an instance of OpenStreetMapGeocoder', () => {
      const osmAdapter = new OpenStreetMapGeocoder(mockedHttpAdapter);

      osmAdapter.should.be.instanceof(OpenStreetMapGeocoder);
    });
  });

  describe('#geocode', () => {
    test('Should not accept IPv4', () => {
      const osmAdapter = new OpenStreetMapGeocoder(mockedHttpAdapter);

      expect(function () {
        osmAdapter.geocode('127.0.0.1', () => {});
      }).to.throw(
        Error,
        'OpenStreetMapGeocoder does not support geocoding IPv4'
      );
    });

    test('Should not accept IPv6', () => {
      const osmAdapter = new OpenStreetMapGeocoder(mockedHttpAdapter);

      expect(function () {
        osmAdapter.geocode('2001:0db8:0000:85a3:0000:0000:ac1f:8001', () => {});
      }).to.throw(
        Error,
        'OpenStreetMapGeocoder does not support geocoding IPv6'
      );
    });

    test('Should call httpAdapter get method', () => {
      const mock = sinon.mock(mockedHttpAdapter);
      mock
        .expects('get')
        .once()
        .returns({ then: function () {} });

      const osmAdapter = new OpenStreetMapGeocoder(mockedHttpAdapter);

      osmAdapter.geocode('1 champs élysée Paris', () => {});

      mock.verify();
    });

    test('Should return geocoded address', (done: any) => {
      const mock = sinon.mock(mockedHttpAdapter);
      mock
        .expects('get')
        .once()
        .callsArgWith(2, false, [
          {
            place_id: '73723099',
            licence:
              'Data \u00a9 OpenStreetMap contributors, ODbL 1.0. http://www.openstreetmap.org/copyright',
            osm_type: 'way',
            osm_id: '90394480',
            boundingbox: [
              '52.5487473',
              '52.5488481',
              '-1.8165129',
              '-1.8163463'
            ],
            lat: '52.5487921',
            lon: '-1.8164307339635',
            display_name:
              '135, Pilkington Avenue, Castle Vale, Maney, Birmingham, West Midlands, England, B72 1LH, United Kingdom',
            class: 'building',
            type: 'yes',
            importance: 0.411,
            address: {
              house_number: '135',
              road: 'Pilkington Avenue',
              suburb: 'Castle Vale',
              hamlet: 'Maney',
              city: 'Birmingham',
              state_district: 'West Midlands',
              state: 'England',
              postcode: 'B72 1LH',
              country: 'United Kingdom',
              country_code: 'gb'
            }
          }
        ]);

      const osmAdapter = new OpenStreetMapGeocoder(mockedHttpAdapter);

      osmAdapter.geocode(
        '135 pilkington avenue, birmingham',
        function (err: any, results: any) {
          mock.verify();

          expect(err).equal(null);

          results.data[0].should.to.deep.equal({
            latitude: 52.5487921,
            longitude: -1.8164307339635,
            formattedAddress:
              '135, Pilkington Avenue, Castle Vale, Maney, Birmingham, West Midlands, England, B72 1LH, United Kingdom',
            country: 'United Kingdom',
            state: 'England',
            city: 'Birmingham',
            zipcode: 'B72 1LH',
            streetName: 'Pilkington Avenue',
            streetNumber: '135',
            countryCode: 'GB',
            neighbourhood: ''
          });

          results.raw.should.deep.equal([
            {
              place_id: '73723099',
              licence:
                'Data \u00a9 OpenStreetMap contributors, ODbL 1.0. http://www.openstreetmap.org/copyright',
              osm_type: 'way',
              osm_id: '90394480',
              boundingbox: [
                '52.5487473',
                '52.5488481',
                '-1.8165129',
                '-1.8163463'
              ],
              lat: '52.5487921',
              lon: '-1.8164307339635',
              display_name:
                '135, Pilkington Avenue, Castle Vale, Maney, Birmingham, West Midlands, England, B72 1LH, United Kingdom',
              class: 'building',
              type: 'yes',
              importance: 0.411,
              address: {
                house_number: '135',
                road: 'Pilkington Avenue',
                suburb: 'Castle Vale',
                hamlet: 'Maney',
                city: 'Birmingham',
                state_district: 'West Midlands',
                state: 'England',
                postcode: 'B72 1LH',
                country: 'United Kingdom',
                country_code: 'gb'
              }
            }
          ]);

          mock.verify();
          done();
        }
      );
    });

    test('Should return geocoded address when quried with object', done => {
      const mock = sinon.mock(mockedHttpAdapter);
      mock
        .expects('get')
        .once()
        .callsArgWith(2, false, [
          {
            place_id: '7677374',
            licence:
              'Data \u00a9 OpenStreetMap contributors, ODbL 1.0. http://www.openstreetmap.org/copyright',
            osm_type: 'node',
            osm_id: '829071536',
            boundingbox: ['48.8712111', '48.8713111', '2.3017954', '2.3018954'],
            lat: '48.8712611',
            lon: '2.3018454',
            display_name:
              '93, Avenue des Champs-\u00c9lys\u00e9es, Champs-\u00c9lys\u00e9es, 8e, Paris, \u00cele-de-France, France m\u00e9tropolitaine, 75008, France',
            class: 'place',
            type: 'house',
            importance: 0.621,
            address: {
              house_number: '93',
              road: 'Avenue des Champs-\u00c9lys\u00e9es',
              suburb: 'Champs-\u00c9lys\u00e9es',
              city_district: '8e',
              city: 'Paris',
              county: 'Paris',
              state: '\u00cele-de-France',
              country: 'France',
              postcode: '75008',
              country_code: 'fr',
              neighbourhood: 'Williamsburg'
            }
          }
        ])
        .withArgs('http://nominatim.openstreetmap.org/search', {
          format: 'json',
          addressdetails: 1,
          city: 'Paris',
          limit: 1,
          street: '93 Champs-Élysèes'
        });

      const osmAdapter = new OpenStreetMapGeocoder(mockedHttpAdapter);

      osmAdapter.geocode(
        { street: '93 Champs-Élysèes', city: 'Paris', limit: 1 },
        function (err, results) {
          mock.verify();

          expect(err).equal(null);

          results!.data[0].should.to.deep.equal({
            latitude: 48.8712611,
            longitude: 2.3018454,
            formattedAddress:
              '93, Avenue des Champs-\u00c9lys\u00e9es, Champs-\u00c9lys\u00e9es, 8e, Paris, \u00cele-de-France, France m\u00e9tropolitaine, 75008, France',
            country: 'France',
            state: '\u00cele-de-France',
            city: 'Paris',
            zipcode: '75008',
            streetName: 'Avenue des Champs-\u00c9lys\u00e9es',
            streetNumber: '93',
            countryCode: 'FR',
            neighbourhood: 'Williamsburg'
          });

          done();
        }
      );
    });

    test('Should ignore format and addressdetails arguments', done => {
      const mock = sinon.mock(mockedHttpAdapter);
      mock
        .expects('get')
        .once()
        .callsArgWith(2, false, [])
        .withArgs('http://nominatim.openstreetmap.org/search', {
          format: 'json',
          addressdetails: 1,
          q: 'Athens'
        });

      const osmAdapter = new OpenStreetMapGeocoder(mockedHttpAdapter);
      osmAdapter.geocode(
        { q: 'Athens', format: 'xml', addressdetails: 0 },
        function () {
          mock.verify();
          done();
        }
      );
    });
  });

  describe('#reverse', () => {
    test('Should return geocoded address', done => {
      const mock = sinon.mock(mockedHttpAdapter);
      mock
        .expects('get')
        .once()
        .callsArgWith(2, false, {
          place_id: '119109484',
          licence:
            'Data \u00a9 OpenStreetMap contributors, ODbL 1.0. http://www.openstreetmap.org/copyright',
          osm_type: 'way',
          osm_id: '279767984',
          lat: '40.714205',
          lon: '-73.9613150927476',
          display_name:
            '277, Bedford Avenue, Williamsburg, Kings County, NYC, New York, 11211, United States of America',
          address: {
            house_number: '277',
            road: 'Bedford Avenue',
            neighbourhood: 'Williamsburg',
            county: 'Kings County',
            city: 'NYC',
            state: 'New York',
            postcode: '11211',
            country: 'United States of America',
            country_code: 'us'
          }
        });
      const osmAdapter = new OpenStreetMapGeocoder(mockedHttpAdapter);
      osmAdapter.reverse(
        { lat: 40.714232, lon: -73.9612889 },
        function (err, results) {
          expect(err).equal(null);
          results!.data[0].should.to.deep.equal({
            latitude: 40.714205,
            longitude: -73.9613150927476,
            formattedAddress:
              '277, Bedford Avenue, Williamsburg, Kings County, NYC, New York, 11211, United States of America',
            country: 'United States of America',
            state: 'New York',
            city: 'NYC',
            zipcode: '11211',
            streetName: 'Bedford Avenue',
            streetNumber: '277',
            countryCode: 'US',
            neighbourhood: 'Williamsburg'
          });
          results!.raw.should.deep.equal({
            place_id: '119109484',
            licence:
              'Data \u00a9 OpenStreetMap contributors, ODbL 1.0. http://www.openstreetmap.org/copyright',
            osm_type: 'way',
            osm_id: '279767984',
            lat: '40.714205',
            lon: '-73.9613150927476',
            display_name:
              '277, Bedford Avenue, Williamsburg, Kings County, NYC, New York, 11211, United States of America',
            address: {
              house_number: '277',
              road: 'Bedford Avenue',
              neighbourhood: 'Williamsburg',
              county: 'Kings County',
              city: 'NYC',
              state: 'New York',
              postcode: '11211',
              country: 'United States of America',
              country_code: 'us'
            }
          });

          mock.verify();
          done();
        }
      );
    });

    test('Should correctly set extra arguments', done => {
      const mock = sinon.mock(mockedHttpAdapter);
      mock
        .expects('get')
        .once()
        .callsArgWith(2, false, [])
        .withArgs('http://nominatim.openstreetmap.org/reverse', {
          format: 'json',
          addressdetails: 1,
          lat: 12,
          lon: 7,
          zoom: 15
        });

      const osmAdapter = new OpenStreetMapGeocoder(mockedHttpAdapter);
      osmAdapter._reverse({ lat: 12, lon: 7, zoom: 15 }, function () {
        mock.verify();
        done();
      });
    });

    test('Should correctly set extra arguments from constructor extras', done => {
      const mock = sinon.mock(mockedHttpAdapter);
      mock
        .expects('get')
        .once()
        .callsArgWith(2, false, [])
        .withArgs('http://nominatim.openstreetmap.org/reverse', {
          format: 'json',
          addressdetails: 1,
          lat: 12,
          lon: 7,
          zoom: 9
        });

      const osmAdapter = new OpenStreetMapGeocoder(mockedHttpAdapter, {
        zoom: 9
      });
      osmAdapter.reverse({ lat: 12, lon: 7 }, function () {
        mock.verify();
        done();
      });
    });

    test('Should ignore format and addressdetails arguments', done => {
      const mock = sinon.mock(mockedHttpAdapter);
      mock
        .expects('get')
        .once()
        .callsArgWith(2, false, [])
        .withArgs('http://nominatim.openstreetmap.org/reverse', {
          format: 'json',
          addressdetails: 1,
          lat: 12,
          lon: 7
        });

      const osmAdapter = new OpenStreetMapGeocoder(mockedHttpAdapter);
      osmAdapter._reverse(
        { lat: 12, lon: 7, format: 'xml', addressdetails: 0 },
        function () {
          mock.verify();
          done();
        }
      );
    });
  });
});
