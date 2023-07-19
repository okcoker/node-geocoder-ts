(function () {
  var chai = require('chai'),
    should = chai.should(),
    expect = chai.expect,
    sinon = require('sinon');

  var SmartyStreets = require('../../lib/geocoder/smartystreetsgeocoder.js');
  var HttpAdapter = require('../../lib/httpadapter/fetchadapter.js');

  var mockedHttpAdapter = {
    get: function () {}
  };

  // @ts-expect-error TS(2582): Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
  describe('SmartyStreets', () => {
    // @ts-expect-error TS(2582): Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
    describe('#constructor', () => {
      // @ts-expect-error TS(2582): Cannot find name 'test'. Do you need to install ty... Remove this comment to see the full error message
      test('an http adapter must be set', () => {
        expect(function () {
          new SmartyStreets();
        }).to.throw(Error, 'SmartyStreets need an httpAdapter');
      });

      // @ts-expect-error TS(2582): Cannot find name 'test'. Do you need to install ty... Remove this comment to see the full error message
      test('an auth-id and auth-token must be set', () => {
        expect(function () {
          new SmartyStreets(mockedHttpAdapter);
        }).to.throw(Error, 'You must specify an auth-id and auth-token!');
      });

      // @ts-expect-error TS(2582): Cannot find name 'test'. Do you need to install ty... Remove this comment to see the full error message
      test('Should be an instance of SmartyStreets', () => {
        var smartyStreetsAdapter = new SmartyStreets(
          mockedHttpAdapter,
          'AUTH_ID',
          'AUTH_TOKEN'
        );

        smartyStreetsAdapter.should.be.instanceof(SmartyStreets);
      });
    });

    // @ts-expect-error TS(2582): Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
    describe('#geocode', () => {
      // @ts-expect-error TS(2582): Cannot find name 'test'. Do you need to install ty... Remove this comment to see the full error message
      test('Should call httpAdapter get method', () => {
        var mock = sinon.mock(mockedHttpAdapter);
        mock
          .expects('get')
          .withArgs('https://api.smartystreets.com/street-address', {
            street: '1 Infinite Loop, Cupertino, CA',
            'auth-id': 'AUTH_ID',
            'auth-token': 'AUTH_TOKEN',
            format: 'json'
          })
          .once()
          .returns({ then: function () {} });

        var smartyStreetsAdapter = new SmartyStreets(
          mockedHttpAdapter,
          'AUTH_ID',
          'AUTH_TOKEN'
        );

        smartyStreetsAdapter.geocode('1 Infinite Loop, Cupertino, CA');
        mock.verify();
      });
    });

    // @ts-expect-error TS(2582): Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
    describe('#reverse', () => {
      // @ts-expect-error TS(2582): Cannot find name 'test'. Do you need to install ty... Remove this comment to see the full error message
      test('Should throw expection', () => {
        var smartyStreetsAdapter = new SmartyStreets(
          mockedHttpAdapter,
          'AUTH_ID',
          'AUTH_TOKEN'
        );

        expect(function () {
          smartyStreetsAdapter.reverse(10.0235, -2.3662);
        }).to.throw(Error, 'SmartyStreets doesnt support reverse geocoding!');
      });
    });
  });
})();
