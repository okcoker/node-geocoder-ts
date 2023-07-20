var chai = require('chai'),
  should = chai.should(),
  // @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'expect'.
  expect = chai.expect,
  sinon = require('sinon');

var GeocodioGeocoder = require('../../lib/geocoder/geocodiogeocoder.js');
var HttpAdapter = require('../../lib/httpadapter/fetchadapter.js');

// @ts-expect-error TS(2403): Subsequent variable declarations must have the sam... Remove this comment to see the full error message
var mockedHttpAdapter = {
  get: function () {}
};

// @ts-expect-error TS(2582): Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe('GeocodioGeocoder', () => {
  // @ts-expect-error TS(2582): Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
  describe('#constructor', () => {
    // @ts-expect-error TS(2582): Cannot find name 'test'. Do you need to install ty... Remove this comment to see the full error message
    test('an http adapter must be set', () => {
      expect(function () {
        new GeocodioGeocoder();
      }).to.throw(Error, 'GeocodioGeocoder need an httpAdapter');
    });

    // @ts-expect-error TS(2582): Cannot find name 'test'. Do you need to install ty... Remove this comment to see the full error message
    test('an apiKey must be set', () => {
      expect(function () {
        new GeocodioGeocoder(mockedHttpAdapter);
      }).to.throw(Error, 'GeocodioGeocoder needs an apiKey');
    });

    // @ts-expect-error TS(2582): Cannot find name 'test'. Do you need to install ty... Remove this comment to see the full error message
    test('Should be an instance of GeocodioGeocoder', () => {
      var mapquestAdapter = new GeocodioGeocoder(mockedHttpAdapter, 'API_KEY');

      mapquestAdapter.should.be.instanceof(GeocodioGeocoder);
    });
  });

  // @ts-expect-error TS(2582): Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
  describe('#geocode', () => {
    // @ts-expect-error TS(2582): Cannot find name 'test'. Do you need to install ty... Remove this comment to see the full error message
    test('Should not accept IPv4', () => {
      var mapquestAdapter = new GeocodioGeocoder(mockedHttpAdapter, 'API_KEY');

      expect(function () {
        mapquestAdapter.geocode('127.0.0.1');
      }).to.throw(Error, 'GeocodioGeocoder does not support geocoding IPv4');
    });

    // @ts-expect-error TS(2582): Cannot find name 'test'. Do you need to install ty... Remove this comment to see the full error message
    test('Should not accept IPv6', () => {
      var mapquestAdapter = new GeocodioGeocoder(mockedHttpAdapter, 'API_KEY');

      expect(function () {
        mapquestAdapter.geocode('2001:0db8:0000:85a3:0000:0000:ac1f:8001');
      }).to.throw(Error, 'GeocodioGeocoder does not support geocoding IPv6');
    });
  });

  // @ts-expect-error TS(2582): Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
  describe('#reverse', () => {
    // @ts-expect-error TS(2582): Cannot find name 'test'. Do you need to install ty... Remove this comment to see the full error message
    test('Should call httpAdapter get method', () => {
      var mock = sinon.mock(mockedHttpAdapter);
      mock
        .expects('get')
        .once()
        .returns({ then: function () {} });

      var mapquestAdapter = new GeocodioGeocoder(mockedHttpAdapter, 'API_KEY');

      mapquestAdapter.reverse({ lat: 10.0235, lon: -2.3662 });

      mock.verify();
    });
  });
});
