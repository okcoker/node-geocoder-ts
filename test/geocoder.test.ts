
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'chai'.
var chai   = require('chai');
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'should'.
var should = chai.should();
var assert = chai.assert;
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'sinon'.
var sinon  = require('sinon');

// @ts-expect-error TS(2403): Subsequent variable declarations must have the sam... Remove this comment to see the full error message
var Geocoder = require('../lib/geocoder.js');
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'AbstractGe... Remove this comment to see the full error message
const AbstractGeocoder = require('../lib/geocoder/abstractgeocoder.js');

var stupidGeocoder = {
  geocode: function(data: any, cb: any) {
    cb(null, []);
  },
  reverse: function(data: any, cb: any) {
    cb(null, []);
  },
  batchGeocode: AbstractGeocoder.prototype.batchGeocode
};

var stupidBatchGeocoder = {
  ...stupidGeocoder,
  _batchGeocode: function(data: any, cb: any) {
    cb(null, data);
  }
};

// @ts-expect-error TS(2582): Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe('Geocoder', () => {
  // @ts-expect-error TS(2304): Cannot find name 'beforeEach'.
  beforeEach(() => {
    sinon.spy(stupidGeocoder, 'geocode');
    sinon.spy(stupidGeocoder, 'reverse');
    sinon.spy(stupidBatchGeocoder, '_batchGeocode');
  });

  // @ts-expect-error TS(2304): Cannot find name 'afterEach'.
  afterEach(() => {
    // @ts-expect-error TS(2339): Property 'restore' does not exist on type '(data: ... Remove this comment to see the full error message
    stupidGeocoder.geocode.restore();
    // @ts-expect-error TS(2339): Property 'restore' does not exist on type '(data: ... Remove this comment to see the full error message
    stupidGeocoder.reverse.restore();
    // @ts-expect-error TS(2339): Property 'restore' does not exist on type '(data: ... Remove this comment to see the full error message
    stupidBatchGeocoder._batchGeocode.restore();
  });

  // @ts-expect-error TS(2582): Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
  describe('#constructor' , () => {
    // @ts-expect-error TS(2582): Cannot find name 'test'. Do you need to install ty... Remove this comment to see the full error message
    test('Should set _geocoder', () => {
      // @ts-expect-error TS(2554): Expected 2 arguments, but got 1.
      var geocoder = new Geocoder(stupidGeocoder);

      geocoder._geocoder.should.be.equal(stupidGeocoder);
    });
  });

  // @ts-expect-error TS(2582): Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
  describe('#geocode' , () => {
    // @ts-expect-error TS(2582): Cannot find name 'test'. Do you need to install ty... Remove this comment to see the full error message
    test('Should call geocoder geocode method', () => {
      // @ts-expect-error TS(2554): Expected 2 arguments, but got 1.
      var geocoder = new Geocoder(stupidGeocoder);

      return geocoder.geocode('127.0.0.1')
        .then(function() {
          // @ts-expect-error TS(2339): Property 'calledOnce' does not exist on type '(dat... Remove this comment to see the full error message
          stupidGeocoder.geocode.calledOnce.should.be.true;
        });
    });

    // @ts-expect-error TS(2582): Cannot find name 'test'. Do you need to install ty... Remove this comment to see the full error message
    test('Should return a promise', () => {
      // @ts-expect-error TS(2554): Expected 2 arguments, but got 1.
      var geocoder = new Geocoder(stupidGeocoder);

      var promise = geocoder.geocode('127.0.0.1');
      promise.then.should.be.a('function');

      return promise;
    });
  });

  // @ts-expect-error TS(2582): Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
  describe('#batchGeocode' , () => {
    // @ts-expect-error TS(2582): Cannot find name 'test'. Do you need to install ty... Remove this comment to see the full error message
    test('Should call stupidGeocoder geocoder method x times', () => {
      // @ts-expect-error TS(2554): Expected 2 arguments, but got 1.
      var geocoder = new Geocoder(stupidGeocoder);
      return geocoder.batchGeocode([
        '127.0.0.1',
        '127.0.0.1'
      ]).then(function() {
        // @ts-expect-error TS(2339): Property 'calledTwice' does not exist on type '(da... Remove this comment to see the full error message
        assert.isTrue(stupidGeocoder.geocode.calledTwice);
      });
    });

    // @ts-expect-error TS(2582): Cannot find name 'test'. Do you need to install ty... Remove this comment to see the full error message
    test('Should return a promise', () => {
      // @ts-expect-error TS(2554): Expected 2 arguments, but got 1.
      var geocoder = new Geocoder(stupidGeocoder);

      var promise = geocoder.batchGeocode(['127.0.0.1']);
      promise.then.should.be.a('function');

      return promise;
    });

    // @ts-expect-error TS(2582): Cannot find name 'test'. Do you need to install ty... Remove this comment to see the full error message
    test('Should call stupidBatchGeocoder.batchGeocoder method only once when implemented', () => {
      // @ts-expect-error TS(2554): Expected 2 arguments, but got 1.
      var geocoder = new Geocoder(stupidBatchGeocoder);
      return geocoder.batchGeocode([
        '127.0.0.1',
        '127.0.0.1'
      ]).then(function() {
        // @ts-expect-error TS(2339): Property 'calledOnce' does not exist on type '(dat... Remove this comment to see the full error message
        assert.isTrue(stupidBatchGeocoder._batchGeocode.calledOnce);
      });
    });
  });

  // @ts-expect-error TS(2582): Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
  describe('#reverse' , () => {
    // @ts-expect-error TS(2582): Cannot find name 'test'. Do you need to install ty... Remove this comment to see the full error message
    test('Should call stupidGeocoder reverse method', () => {
      // @ts-expect-error TS(2554): Expected 2 arguments, but got 1.
      var geocoder = new Geocoder(stupidGeocoder);

      return geocoder.reverse(1, 2)
        .then(function() {
          // @ts-expect-error TS(2339): Property 'calledOnce' does not exist on type '(dat... Remove this comment to see the full error message
          stupidGeocoder.reverse.calledOnce.should.be.true;
        });
    });

    // @ts-expect-error TS(2582): Cannot find name 'test'. Do you need to install ty... Remove this comment to see the full error message
    test('Should return a promise', () => {
      // @ts-expect-error TS(2554): Expected 2 arguments, but got 1.
      var geocoder = new Geocoder(stupidGeocoder);

      var promise = geocoder.reverse('127.0.0.1');

      promise.then.should.be.a('function');
    });
  });
});

