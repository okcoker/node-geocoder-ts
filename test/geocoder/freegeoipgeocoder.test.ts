import chai from 'chai';
import sinon from 'sinon';
import FreegeoipGeocoder from 'lib/geocoder/freegeoipgeocoder';
import { buildHttpAdapter } from 'test/helpers/mocks';
import { HTTPAdapter } from 'types';

chai.should();
const expect = chai.expect;
const mockedHttpAdapter = buildHttpAdapter();

describe('FreegeoipGeocoder', () => {
  describe('#constructor', () => {
    test('an http adapter must be set', () => {
      expect(() => {
        new FreegeoipGeocoder('' as unknown as HTTPAdapter, {});
      }).to.throw(Error, 'FreegeoipGeocoder need an httpAdapter');
    });
    test('Should be an instance of FreegeoipGeocoder', () => {
      const freegeoipgeocoder = new FreegeoipGeocoder(mockedHttpAdapter, {});

      freegeoipgeocoder.should.be.instanceof(FreegeoipGeocoder);
    });
  });
  describe('#geocode', () => {
    test('Should not accept address', () => {
      const freegeoipgeocoder = new FreegeoipGeocoder(mockedHttpAdapter, {});
      expect(function () {
        freegeoipgeocoder.geocode('1 rue test', () => {});
      }).to.throw(
        Error,
        'FreegeoipGeocoder does not support geocoding address'
      );
    });
    test('Should call httpAdapter get method', () => {
      const mock = sinon.mock(mockedHttpAdapter);
      mock
        .expects('get')
        .once()
        .returns({ then: function () {} });

      const freegeoipgeocoder = new FreegeoipGeocoder(mockedHttpAdapter, {});

      freegeoipgeocoder.geocode('127.0.0.1', () => {});

      mock.verify();
    });
    test('Should return a geocoded address', (done: any) => {
      const mock = sinon.mock(mockedHttpAdapter);
      mock.expects('get').once().callsArgWith(2, false, {
        ip: '66.249.64.0',
        country_code: 'US',
        country_name: 'United States',
        region_code: 'CA',
        region_name: 'California',
        city: 'Mountain View',
        zip_code: '94040',
        time_zone: 'America/Los_Angeles',
        latitude: 37.386,
        longitude: -122.084,
        metro_code: 807
      });
      const freegeoipgeocoder = new FreegeoipGeocoder(mockedHttpAdapter, {});

      freegeoipgeocoder.geocode(
        '66.249.64.0',
        function (err: any, results: any) {
          expect(err).equal(null);
          results.data[0].should.to.deep.equal({
            ip: '66.249.64.0',
            countryCode: 'US',
            country: 'United States',
            regionCode: 'CA',
            regionName: 'California',
            city: 'Mountain View',
            zipcode: '94040',
            timeZone: 'America/Los_Angeles',
            latitude: 37.386,
            longitude: -122.084,
            metroCode: 807
          });
          mock.verify();
          done();
        }
      );
    });
  });
  describe('#reverse', () => {
    test('Should throw an error', () => {
      const freegeoipgeocoder = new FreegeoipGeocoder(mockedHttpAdapter, {});
      expect(() => {
        freegeoipgeocoder.reverse({ lat: 10.0235, lon: -2.3662 }, () => {});
      }).to.throw(
        Error,
        'FreegeoipGeocoder does not support reverse geocoding'
      );
    });
  });
});
