(function() {
  var chai = require('chai'),
      should = chai.should(),
      expect = chai.expect,
      sinon = require('sinon');

  var LocationIQGeocoder = require('../../lib/geocoder/locationiqgeocoder.js');

  var mockedHttpAdapter = {
    get: function() {}
  };

  // @ts-expect-error TS(2582): Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
  describe('LocationIQGeocoder', () => {

    // @ts-expect-error TS(2582): Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
    describe('#constructor', () => {

      // @ts-expect-error TS(2582): Cannot find name 'test'. Do you need to install ty... Remove this comment to see the full error message
      test('an http adapter must be set', () => {
        expect(function() {
          new LocationIQGeocoder();
        }).to.throw(Error, 'LocationIQGeocoder need an httpAdapter');
      });

      // @ts-expect-error TS(2582): Cannot find name 'test'. Do you need to install ty... Remove this comment to see the full error message
      test('must have an api key as second argument', () => {
        expect(function() {
          new LocationIQGeocoder(mockedHttpAdapter);
        }).to.throw(Error, 'LocationIQGeocoder needs an apiKey');
      });

      // @ts-expect-error TS(2582): Cannot find name 'test'. Do you need to install ty... Remove this comment to see the full error message
      test('Should be an instance of LocationIQGeocoder', () => {
        var adapter = new LocationIQGeocoder(mockedHttpAdapter, 'API_KEY');
        adapter.should.be.instanceOf(LocationIQGeocoder);
      });

    });

    // @ts-expect-error TS(2582): Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
    describe('#geocode', () => {

      // @ts-expect-error TS(2582): Cannot find name 'test'. Do you need to install ty... Remove this comment to see the full error message
      test('Should not accept IPv4', () => {
        var adapter = new LocationIQGeocoder(mockedHttpAdapter, 'API_KEY');
        expect(function() {
                adapter.geocode('127.0.0.1');
        }).to.throw(Error, 'LocationIQGeocoder does not support geocoding IPv4');
      });

      // @ts-expect-error TS(2582): Cannot find name 'test'. Do you need to install ty... Remove this comment to see the full error message
      test('Should not accept IPv6', () => {
        var adapter = new LocationIQGeocoder(mockedHttpAdapter, 'API_KEY');
        expect(function() {
                adapter.geocode('2001:0db8:0000:85a3:0000:0000:ac1f:8001');
        }).to.throw(Error, 'LocationIQGeocoder does not support geocoding IPv6');
      });

      // @ts-expect-error TS(2582): Cannot find name 'test'. Do you need to install ty... Remove this comment to see the full error message
      test('Should call httpAdapter get method', () => {
        var mock = sinon.mock(mockedHttpAdapter);
        mock.expects('get').once().returns({then: function() {}});
        var adapter = new LocationIQGeocoder(mockedHttpAdapter, 'API_KEY');
        adapter.geocode('Empire State Building');
        mock.verify();
      });

      // @ts-expect-error TS(2582): Cannot find name 'test'. Do you need to install ty... Remove this comment to see the full error message
      test('Should return geocoded address', (done: any) => {
        var mock = sinon.mock(mockedHttpAdapter);
        var rawResponse = [{
          "place_id": "49220656",
          "licence": "Data © OpenStreetMap contributors, ODbL 1.0. http://www.openstreetmap.org/copyright",
          "osm_type": "node",
          "osm_id": "3674260525",
          "boundingbox": [
            "40.7487227",
            "40.7488227",
            "-73.9849836",
            "-73.9848836"
          ],
          "lat": "40.7487727",
          "lon": "-73.9849336",
          "display_name": "Empire State Building, 362, 5th Avenue, Diamond District, Manhattan, New York County, NYC, New York, 10035, United States of America",
          "class": "tourism",
          "type": "attraction",
          "importance": 0.301,
          "icon": "http://158.69.3.42/nominatim/images/mapicons/poi_point_of_interest.p.20.png",
          "address": {
            "attraction": "Empire State Building",
            "house_number": "362",
            "road": "5th Avenue",
            "neighbourhood": "Diamond District",
            "suburb": "Manhattan",
            "county": "New York County",
            "city": "NYC",
            "state": "New York",
            "postcode": "10035",
            "country": "United States of America",
            "country_code": "us"
          }
        }];
        mock.expects('get').once().callsArgWith(2, false, rawResponse);

        var adapter = new LocationIQGeocoder(mockedHttpAdapter, 'API_KEY');
        adapter.geocode('Empire State Building', function(err: any, results: any) {
          mock.verify();
          err.should.equal(false);

          results.should.have.property('raw');
          results.raw.should.deep.equal(rawResponse);

          results[0].should.deep.equal({
            'city': 'NYC',
            'country': 'United States of America',
            'countryCode': 'US',
            'latitude': 40.7487727,
            'longitude': -73.9849336,
            'state': 'New York',
            'streetName': '5th Avenue',
            'streetNumber': '362',
            'zipcode': '10035'
          });

        });
        mock.verify();
        done();
      });

      // @ts-expect-error TS(2582): Cannot find name 'test'. Do you need to install ty... Remove this comment to see the full error message
      test(
        'Should return geocoded address when queried with an object',
        (done: any) => {
          var mock = sinon.mock(mockedHttpAdapter);
          var rawResponse = [{
            "place_id": "49220656",
            "licence": "Data © OpenStreetMap contributors, ODbL 1.0. http://www.openstreetmap.org/copyright",
            "osm_type": "node",
            "osm_id": "3674260525",
            "boundingbox": [
              "40.7487227",
              "40.7488227",
              "-73.9849836",
              "-73.9848836"
            ],
            "lat": "40.7487727",
            "lon": "-73.9849336",
            "display_name": "Empire State Building, 362, 5th Avenue, Diamond District, Manhattan, New York County, NYC, New York, 10035, United States of America",
            "class": "tourism",
            "type": "attraction",
            "importance": 0.401,
            "icon": "http://158.69.3.42/nominatim/images/mapicons/poi_point_of_interest.p.20.png",
            "address": {
              "attraction": "Empire State Building",
              "house_number": "362",
              "road": "5th Avenue",
              "neighbourhood": "Diamond District",
              "suburb": "Manhattan",
              "county": "New York County",
              "city": "NYC",
              "state": "New York",
              "postcode": "10035",
              "country": "United States of America",
              "country_code": "us"
            }
          }];
          mock.expects('get').once().callsArgWith(2, false, rawResponse);

          var adapter = new LocationIQGeocoder(mockedHttpAdapter, 'API_KEY');
          var query = {
            'street': '5th Avenue 263',
            'city': 'New York'
          };
          adapter.geocode(query, function(err: any, results: any) {
            mock.verify();
            err.should.equal(false);

            results.should.have.length.of(1);
            results[0].should.deep.equal({
              'city': 'NYC',
              'country': 'United States of America',
              'countryCode': 'US',
              'latitude': 40.7487727,
              'longitude': -73.9849336,
              'state': 'New York',
              'streetName': '5th Avenue',
              'streetNumber': '362',
              'zipcode': '10035'
            });

            results.should.have.property('raw');
            results.raw.should.deep.equal(rawResponse);
          });
          mock.verify();
          done();
        }
      );

      // @ts-expect-error TS(2582): Cannot find name 'test'. Do you need to install ty... Remove this comment to see the full error message
      test('should ignore "format" and "addressdetails" arguments', (done: any) => {
        var mock = sinon.mock(mockedHttpAdapter);
        mock.expects('get').once().callsArgWith(2, false, [])
          .withArgs('http://us1.locationiq.com/v1/search', {
            addressdetails: '1',
            format: 'json',
            key: 'API_KEY',
            q:'Athens'
          });

        var adapter = new LocationIQGeocoder(mockedHttpAdapter, 'API_KEY');
        var query = {q:'Athens',format:'xml',addressdetails:0};
        adapter.geocode(query, function(err: any, results: any) {
          err.should.equal(false);
          results.should.have.length.of(0);
          mock.verify();
          done();
        });
      });

    });

    // @ts-expect-error TS(2582): Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
    describe('#reverse', () => {

      // @ts-expect-error TS(2582): Cannot find name 'test'. Do you need to install ty... Remove this comment to see the full error message
      test('Should correctly set extra arguments', (done: any) => {
        var mock = sinon.mock(mockedHttpAdapter);
        mock.expects('get').once().callsArgWith(2, false, [])
          .withArgs('http://us1.locationiq.com/v1/reverse', {
            addressdetails: '1',
            format: 'json',
            key: 'API_KEY',
            lat: 12,
            lon: 7,
            zoom: 15 // <--- extra
          });

        var adapter = new LocationIQGeocoder(mockedHttpAdapter, 'API_KEY');
        adapter.reverse({lat:12,lon:7,zoom:15}, function(err: any, result: any) {
          err.should.equal(false);
          // check for empty result
          result.should
            .be.an('array')
            .have.length.of(0);
          mock.verify();
          done();
        });
      });

      // @ts-expect-error TS(2582): Cannot find name 'test'. Do you need to install ty... Remove this comment to see the full error message
      test('should ignore "format" and "addressdetails" arguments', (done: any) => {
        var mock = sinon.mock(mockedHttpAdapter);
        mock.expects('get').once().callsArgWith(2, false, [])
          .withArgs('http://us1.locationiq.com/v1/reverse', {
            addressdetails: '1',
            format: 'json',
            key: 'API_KEY',
            lat: 12,
            lon: 7
          });

        var adapter = new LocationIQGeocoder(mockedHttpAdapter, 'API_KEY');
        var query = {lat:12,lon:7,format:'xml',addressdetails:0};
        adapter.reverse(query, function(err: any, result: any) {
          err.should.equal(false);
          // check for empty result
          result.should
            .be.an('array')
            .have.length.of(0);
          mock.verify();
          done();
        });
      });

    });

  });
})();
