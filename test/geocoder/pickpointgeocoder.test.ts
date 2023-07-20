import chai from 'chai';
import sinon from 'sinon';
import PickPointGeocoder from 'lib/geocoder/pickpointgeocoder';
import { buildHttpAdapter } from 'test/helpers/mocks';
import { HTTPAdapter } from 'types';

chai.should();
const expect = chai.expect;
const mockedHttpAdapter = buildHttpAdapter({
  get: sinon.stub(),
  supportsHttps: sinon.stub()
});

describe('PickPointGeocoder', () => {
  describe('#constructor', () => {
    test('should be an instance of PickPointGeocoder', () => {
      (mockedHttpAdapter.supportsHttps as any).returns(true);
      const geocoder = new PickPointGeocoder(mockedHttpAdapter, {
        apiKey: 'API_KEY'
      });
      geocoder.should.be.instanceof(PickPointGeocoder);
    });

    test('an http adapter must be set', () => {
      expect(function () {
        new PickPointGeocoder('' as unknown as HTTPAdapter);
      }).to.throw(Error, 'PickPointGeocoder need an httpAdapter');
    });

    test('the adapter should support https', () => {
      (mockedHttpAdapter.supportsHttps as any).returns(false);
      expect(function () {
        new PickPointGeocoder(mockedHttpAdapter);
      }).to.throw(Error, 'You must use https http adapter');
    });

    test('an apiKey must be set', () => {
      (mockedHttpAdapter.supportsHttps as any).returns(true);
      expect(function () {
        new PickPointGeocoder(mockedHttpAdapter);
      }).to.throw(Error, 'PickPointGeocoder needs an apiKey');
    });
  });
});
