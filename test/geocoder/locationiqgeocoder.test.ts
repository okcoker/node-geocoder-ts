import chai from 'chai';
import sinon from 'sinon';
import LocationIQGeocoder from 'lib/geocoder/locationiqgeocoder';
import { buildHttpAdapter } from 'test/helpers/mocks';
import { HTTPAdapter } from 'types';

chai.should();
const expect = chai.expect;
const mockedHttpAdapter = buildHttpAdapter();
describe('LocationIQGeocoder', () => {
  describe('#constructor', () => {
    test('an http adapter must be set', () => {
      expect(function () {
        new LocationIQGeocoder('' as unknown as HTTPAdapter);
      }).to.throw(Error, 'LocationIQGeocoder need an httpAdapter');
    });

    test('must have an api key as second argument', () => {
      expect(function () {
        new LocationIQGeocoder(mockedHttpAdapter);
      }).to.throw(Error, 'LocationIQGeocoder needs an apiKey');
    });

    test('Should be an instance of LocationIQGeocoder', () => {
      const adapter = new LocationIQGeocoder(mockedHttpAdapter, {
        apiKey: 'API_KEY'
      });
      adapter.should.be.instanceOf(LocationIQGeocoder);
    });
  });

  describe('#geocode', () => {
    test('Should not accept IPv4', () => {
      const adapter = new LocationIQGeocoder(mockedHttpAdapter, {
        apiKey: 'API_KEY'
      });
      expect(function () {
        adapter.geocode('127.0.0.1', () => {});
      }).to.throw(Error, 'LocationIQGeocoder does not support geocoding IPv4');
    });

    test('Should not accept IPv6', () => {
      const adapter = new LocationIQGeocoder(mockedHttpAdapter, {
        apiKey: 'API_KEY'
      });
      expect(function () {
        adapter.geocode('2001:0db8:0000:85a3:0000:0000:ac1f:8001', () => {});
      }).to.throw(Error, 'LocationIQGeocoder does not support geocoding IPv6');
    });

    test('Should call httpAdapter get method', () => {
      const mock = sinon.mock(mockedHttpAdapter);
      mock
        .expects('get')
        .once()
        .returns({ then: function () {} });
      const adapter = new LocationIQGeocoder(mockedHttpAdapter, {
        apiKey: 'API_KEY'
      });
      adapter.geocode('Empire State Building', () => {});
      mock.verify();
    });

    test('Should return geocoded address', (done: any) => {
      const mock = sinon.mock(mockedHttpAdapter);
      const rawResponse = [
        {
          place_id: '49220656',
          licence:
            'Data © OpenStreetMap contributors, ODbL 1.0. http://www.openstreetmap.org/copyright',
          osm_type: 'node',
          osm_id: '3674260525',
          boundingbox: [
            '40.7487227',
            '40.7488227',
            '-73.9849836',
            '-73.9848836'
          ],
          lat: '40.7487727',
          lon: '-73.9849336',
          display_name:
            'Empire State Building, 362, 5th Avenue, Diamond District, Manhattan, New York County, NYC, New York, 10035, United States of America',
          class: 'tourism',
          type: 'attraction',
          importance: 0.301,
          icon: 'http://158.69.3.42/nominatim/images/mapicons/poi_point_of_interest.p.20.png',
          address: {
            attraction: 'Empire State Building',
            house_number: '362',
            road: '5th Avenue',
            neighbourhood: 'Diamond District',
            suburb: 'Manhattan',
            county: 'New York County',
            city: 'NYC',
            state: 'New York',
            postcode: '10035',
            country: 'United States of America',
            country_code: 'us'
          }
        }
      ];
      mock.expects('get').once().callsArgWith(2, false, rawResponse);

      const adapter = new LocationIQGeocoder(mockedHttpAdapter, {
        apiKey: 'API_KEY'
      });
      adapter.geocode(
        'Empire State Building',
        function (err: any, results: any) {
          mock.verify();
          expect(err).equal(null);

          results.should.have.property('raw');
          results.raw.should.deep.equal(rawResponse);

          results[0].should.deep.equal({
            city: 'NYC',
            country: 'United States of America',
            countryCode: 'US',
            latitude: 40.7487727,
            longitude: -73.9849336,
            state: 'New York',
            streetName: '5th Avenue',
            streetNumber: '362',
            zipcode: '10035'
          });
        }
      );
      mock.verify();
      done();
    });

    test('Should return geocoded address when queried with an object', (done: any) => {
      const mock = sinon.mock(mockedHttpAdapter);
      const rawResponse = [
        {
          place_id: '49220656',
          licence:
            'Data © OpenStreetMap contributors, ODbL 1.0. http://www.openstreetmap.org/copyright',
          osm_type: 'node',
          osm_id: '3674260525',
          boundingbox: [
            '40.7487227',
            '40.7488227',
            '-73.9849836',
            '-73.9848836'
          ],
          lat: '40.7487727',
          lon: '-73.9849336',
          display_name:
            'Empire State Building, 362, 5th Avenue, Diamond District, Manhattan, New York County, NYC, New York, 10035, United States of America',
          class: 'tourism',
          type: 'attraction',
          importance: 0.401,
          icon: 'http://158.69.3.42/nominatim/images/mapicons/poi_point_of_interest.p.20.png',
          address: {
            attraction: 'Empire State Building',
            house_number: '362',
            road: '5th Avenue',
            neighbourhood: 'Diamond District',
            suburb: 'Manhattan',
            county: 'New York County',
            city: 'NYC',
            state: 'New York',
            postcode: '10035',
            country: 'United States of America',
            country_code: 'us'
          }
        }
      ];
      mock.expects('get').once().callsArgWith(2, false, rawResponse);

      const adapter = new LocationIQGeocoder(mockedHttpAdapter, {
        apiKey: 'API_KEY'
      });
      const query = {
        street: '5th Avenue 263',
        city: 'New York'
      };
      adapter.geocode(query, function (err: any, results: any) {
        mock.verify();
        expect(err).equal(null);

        results.should.have.length.of(1);
        results[0].should.deep.equal({
          city: 'NYC',
          country: 'United States of America',
          countryCode: 'US',
          latitude: 40.7487727,
          longitude: -73.9849336,
          state: 'New York',
          streetName: '5th Avenue',
          streetNumber: '362',
          zipcode: '10035'
        });

        results.should.have.property('raw');
        results.raw.should.deep.equal(rawResponse);
      });
      mock.verify();
      done();
    });

    test('should ignore "format" and "addressdetails" arguments', (done: any) => {
      const mock = sinon.mock(mockedHttpAdapter);
      mock
        .expects('get')
        .once()
        .callsArgWith(2, false, [])
        .withArgs('http://us1.locationiq.com/v1/search', {
          addressdetails: '1',
          format: 'json',
          key: 'API_KEY',
          q: 'Athens'
        });

      const adapter = new LocationIQGeocoder(mockedHttpAdapter, {
        apiKey: 'API_KEY'
      });
      const query = { q: 'Athens', format: 'xml', addressdetails: 0 };
      adapter.geocode(query, function (err: any, results: any) {
        expect(err).equal(null);
        results.should.have.length.of(0);
        mock.verify();
        done();
      });
    });
  });

  describe('#reverse', () => {
    test('Should correctly set extra arguments', (done: any) => {
      const mock = sinon.mock(mockedHttpAdapter);
      mock
        .expects('get')
        .once()
        .callsArgWith(2, false, [])
        .withArgs('http://us1.locationiq.com/v1/reverse', {
          addressdetails: '1',
          format: 'json',
          key: 'API_KEY',
          lat: 12,
          lon: 7,
          zoom: 15 // <--- extra
        });

      const adapter = new LocationIQGeocoder(mockedHttpAdapter, {
        apiKey: 'API_KEY'
      });
      adapter._reverse(
        { lat: 12, lon: 7, zoom: 15 },
        function (err: any, result: any) {
          expect(err).equal(null);
          // check for empty result
          result.should.be.an('array').have.length.of(0);
          mock.verify();
          done();
        }
      );
    });

    test('should ignore "format" and "addressdetails" arguments', (done: any) => {
      const mock = sinon.mock(mockedHttpAdapter);
      mock
        .expects('get')
        .once()
        .callsArgWith(2, false, [])
        .withArgs('http://us1.locationiq.com/v1/reverse', {
          addressdetails: '1',
          format: 'json',
          key: 'API_KEY',
          lat: 12,
          lon: 7
        });

      const adapter = new LocationIQGeocoder(mockedHttpAdapter, {
        apiKey: 'API_KEY'
      });
      const query = { lat: 12, lon: 7, format: 'xml', addressdetails: 0 };
      adapter.reverse(query, function (err: any, result: any) {
        expect(err).equal(null);
        // check for empty result
        result.should.be.an('array').have.length.of(0);
        mock.verify();
        done();
      });
    });
  });
});
