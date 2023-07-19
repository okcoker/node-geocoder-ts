(function () {
  var chai = require('chai'),
    should = chai.should(),
    expect = chai.expect,
    sinon = require('sinon');

  var MapzenGeocoder = require('../../lib/geocoder/mapzengeocoder.js');
  var HttpAdapter = require('../../lib/httpadapter/fetchadapter.js');

  var mockedHttpAdapter = {
    get: function () {}
  };

  // @ts-expect-error TS(2582): Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
  describe('MapzenGeocoder', () => {
    // @ts-expect-error TS(2582): Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
    describe('#constructor', () => {
      // @ts-expect-error TS(2582): Cannot find name 'test'. Do you need to install ty... Remove this comment to see the full error message
      test('an http adapter must be set', () => {
        expect(function () {
          new MapzenGeocoder();
        }).to.throw(Error, 'MapzenGeocoder need an httpAdapter');
      });

      // @ts-expect-error TS(2582): Cannot find name 'test'. Do you need to install ty... Remove this comment to see the full error message
      test('an apiKey must be set', () => {
        expect(function () {
          new MapzenGeocoder(mockedHttpAdapter);
        }).to.throw(Error, 'MapzenGeocoder needs an apiKey');
      });

      // @ts-expect-error TS(2582): Cannot find name 'test'. Do you need to install ty... Remove this comment to see the full error message
      test('Should be an instance of MapzenGeocoder', () => {
        var mapzenAdapter = new MapzenGeocoder(mockedHttpAdapter, 'API_KEY');

        mapzenAdapter.should.be.instanceof(MapzenGeocoder);
      });
    });

    // @ts-expect-error TS(2582): Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
    describe('#geocode', () => {
      // @ts-expect-error TS(2582): Cannot find name 'test'. Do you need to install ty... Remove this comment to see the full error message
      test('Should not accept IPv4', () => {
        var mapzenAdapter = new MapzenGeocoder(mockedHttpAdapter, 'API_KEY');

        expect(function () {
          mapzenAdapter.geocode('127.0.0.1');
        }).to.throw(Error, 'MapzenGeocoder does not support geocoding IPv4');
      });

      // @ts-expect-error TS(2582): Cannot find name 'test'. Do you need to install ty... Remove this comment to see the full error message
      test('Should not accept IPv6', () => {
        var mapzenAdapter = new MapzenGeocoder(mockedHttpAdapter, 'API_KEY');

        expect(function () {
          mapzenAdapter.geocode('2001:0db8:0000:85a3:0000:0000:ac1f:8001');
        }).to.throw(Error, 'MapzenGeocoder does not support geocoding IPv6');
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

        var mapzenAdapter = new MapzenGeocoder(mockedHttpAdapter, 'API_KEY');

        mapzenAdapter.reverse({ lat: 10.0235, lon: -2.3662 });

        mock.verify();
      });
    });
  });
})();
