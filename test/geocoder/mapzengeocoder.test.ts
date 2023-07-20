import chai from 'chai';
import sinon from 'sinon';
import MapzenGeocoder from 'lib/geocoder/mapzengeocoder';
import { buildHttpAdapter } from 'test/helpers/mocks';
import { HTTPAdapter } from 'types';

chai.should();
const expect = chai.expect;
const mockedHttpAdapter = buildHttpAdapter();

describe('MapzenGeocoder', () => {
  describe('#constructor', () => {
    test('an http adapter must be set', () => {
      expect(function () {
        new MapzenGeocoder('' as unknown as HTTPAdapter, { apiKey: '' });
      }).to.throw(Error, 'MapzenGeocoder need an httpAdapter');
    });

    test('an apiKey must be set', () => {
      expect(function () {
        new MapzenGeocoder(mockedHttpAdapter, { apiKey: '' });
      }).to.throw(Error, 'MapzenGeocoder needs an apiKey');
    });

    test('Should be an instance of MapzenGeocoder', () => {
      const mapzenAdapter = new MapzenGeocoder(mockedHttpAdapter, {
        apiKey: 'API_KEY'
      });

      mapzenAdapter.should.be.instanceof(MapzenGeocoder);
    });
  });

  describe('#geocode', () => {
    test('Should not accept IPv4', () => {
      const mapzenAdapter = new MapzenGeocoder(mockedHttpAdapter, {
        apiKey: 'API_KEY'
      });

      expect(function () {
        mapzenAdapter.geocode('127.0.0.1', () => {});
      }).to.throw(Error, 'MapzenGeocoder does not support geocoding IPv4');
    });

    test('Should not accept IPv6', () => {
      const mapzenAdapter = new MapzenGeocoder(mockedHttpAdapter, {
        apiKey: 'API_KEY'
      });

      expect(function () {
        mapzenAdapter.geocode(
          '2001:0db8:0000:85a3:0000:0000:ac1f:8001',
          () => {}
        );
      }).to.throw(Error, 'MapzenGeocoder does not support geocoding IPv6');
    });
  });

  describe('#reverse', () => {
    test('Should call httpAdapter get method', () => {
      const mock = sinon.mock(mockedHttpAdapter);
      mock
        .expects('get')
        .once()
        .returns({ then: function () {} });

      const mapzenAdapter = new MapzenGeocoder(mockedHttpAdapter, {
        apiKey: 'API_KEY'
      });

      mapzenAdapter.reverse({ lat: 10.0235, lon: -2.3662 }, () => {});

      mock.verify();
    });
  });
});
