(function () {
  var chai = require('chai'),
    should = chai.should(),
    expect = chai.expect,
    sinon = require('sinon');

  var MapQuestGeocoder = require('../../lib/geocoder/openmapquestgeocoder.js');
  var HttpAdapter = require('../../lib/httpadapter/fetchadapter.js');

  var mockedHttpAdapter = {
    get: function () {}
  };

  // @ts-expect-error TS(2582): Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
  describe('MapQuestGeocoder', () => {
    // @ts-expect-error TS(2582): Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
    describe('#constructor', () => {
      // @ts-expect-error TS(2582): Cannot find name 'test'. Do you need to install ty... Remove this comment to see the full error message
      test('an http adapter must be set', () => {
        expect(function () {
          new MapQuestGeocoder();
        }).to.throw(Error, 'OpenMapQuestGeocoder need an httpAdapter');
      });

      // @ts-expect-error TS(2582): Cannot find name 'test'. Do you need to install ty... Remove this comment to see the full error message
      test('an apiKey must be set', () => {
        expect(function () {
          new MapQuestGeocoder(mockedHttpAdapter);
        }).to.throw(Error, 'OpenMapQuestGeocoder needs an apiKey');
      });

      // @ts-expect-error TS(2582): Cannot find name 'test'. Do you need to install ty... Remove this comment to see the full error message
      test('Should be an instance of MapQuestGeocoder', () => {
        var mapquestAdapter = new MapQuestGeocoder(
          mockedHttpAdapter,
          'API_KEY'
        );

        mapquestAdapter.should.be.instanceof(MapQuestGeocoder);
      });
    });

    // @ts-expect-error TS(2582): Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
    describe('#geocode', () => {
      // @ts-expect-error TS(2582): Cannot find name 'test'. Do you need to install ty... Remove this comment to see the full error message
      test('Should not accept IPv4', () => {
        var mapquestAdapter = new MapQuestGeocoder(
          mockedHttpAdapter,
          'API_KEY'
        );

        expect(function () {
          mapquestAdapter.geocode('127.0.0.1');
        }).to.throw(
          Error,
          'OpenMapQuestGeocoder does not support geocoding IPv4'
        );
      });

      // @ts-expect-error TS(2582): Cannot find name 'test'. Do you need to install ty... Remove this comment to see the full error message
      test('Should not accept IPv6', () => {
        var mapquestAdapter = new MapQuestGeocoder(
          mockedHttpAdapter,
          'API_KEY'
        );

        expect(function () {
          mapquestAdapter.geocode('2001:0db8:0000:85a3:0000:0000:ac1f:8001');
        }).to.throw(
          Error,
          'OpenMapQuestGeocoder does not support geocoding IPv6'
        );
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

        var mapquestAdapter = new MapQuestGeocoder(
          mockedHttpAdapter,
          'API_KEY'
        );

        mapquestAdapter.reverse({ lat: 10.0235, lon: -2.3662 });

        mock.verify();
      });
    });
  });
})();
