import chai from 'chai';
import sinon from 'sinon';
import DataScienceToolkitGeocoder from 'lib/geocoder/datasciencetoolkitgeocoder';
import { buildHttpAdapter } from 'test/helpers/mocks';
import { HTTPAdapter } from 'types';

chai.should();
const expect = chai.expect;

const mockedHttpAdapter = buildHttpAdapter()

describe('DataScienceToolkitGeocoder', () => {

  describe('#constructor', () => {

    test('an http adapter must be set', () => {

      expect(() => { new DataScienceToolkitGeocoder('' as unknown as HTTPAdapter, {}); }).to.throw(Error, 'DataScienceToolkitGeocoder need an httpAdapter');
    });

    test('Should be an instance of DataScienceToolkitGeocoder', () => {
      const geocoder = new DataScienceToolkitGeocoder(mockedHttpAdapter, {});

      geocoder.should.be.instanceof(DataScienceToolkitGeocoder);
    });

  });

  describe('#geocode', () => {

    test('Should call httpAdapter get method', () => {

      const mock = sinon.mock(mockedHttpAdapter);
      mock.expects('get').once().returns({ then: function () { } });

      const geocoder = new DataScienceToolkitGeocoder(mockedHttpAdapter, {});

      geocoder.geocode('127.0.0.1', () => { });

      mock.verify();
    });

    test('Should call httpAdapter get method with specified host', () => {

      const mock = sinon.mock(mockedHttpAdapter);
      mock.expects('get').withArgs('http://raoul.io/ip2coordinates/127.0.0.1', {}).once().returns({ then: function () { } });

      const geocoder = new DataScienceToolkitGeocoder(mockedHttpAdapter, { host: 'raoul.io' });

      geocoder.geocode('127.0.0.1', () => { });

      mock.verify();
    });

    test('Should return a geocoded address', (done: any) => {

      const mock = sinon.mock(mockedHttpAdapter);
      mock.expects('get').once().callsArgWith(2, false, {
        '67.169.73.113': {
          'country_name': 'United States',
          'area_code': 415,
          'region': 'CA',
          'postal_code': '94114',
          'city': 'San Francisco',
          'latitude': 37.7587013244629,
          'country_code': 'US',
          'longitude': -122.438102722168,
          'country_code3': 'USA',
          'dma_code': 807
        }
      }
      );
      const geocoder = new DataScienceToolkitGeocoder(mockedHttpAdapter, {});

      geocoder.geocode('67.169.73.113', function (err: any, results: any) {
        expect(err).equal(null);
        results.data[0].should.to.deep.equal({
          'latitude': 37.7587013244629,
          'longitude': -122.438102722168,
          'country': 'United States',
          'city': 'San Francisco',
          'state': 'CA',
          'zipcode': '94114',
          'streetName': undefined,
          'streetNumber': undefined,
          'countryCode': 'US'
        });
        mock.verify();
        done();
      });

    });

    test('Should return a geocoded address', (done: any) => {

      const mock = sinon.mock(mockedHttpAdapter);
      mock.expects('get').once().callsArgWith(2, false, {
        '2543 Graystone Place, Simi Valley, CA 93065': {
          'country_code3': 'USA',
          'latitude': 34.280874,
          'country_name': 'United States',
          'longitude': -118.766282,
          'street_address': '2543 Graystone Pl',
          'region': 'CA',
          'confidence': 1.0,
          'street_number': '2543',
          'locality': 'Simi Valley',
          'street_name': 'Graystone Pl',
          'fips_county': '06111',
          'country_code': 'US'
        }
      }
      );
      const geocoder = new DataScienceToolkitGeocoder(mockedHttpAdapter, {});

      geocoder.geocode('2543 Graystone Place, Simi Valley, CA 93065', function (err: any, results: any) {
        expect(err).equal(null);
        results.data[0].should.to.deep.equal({
          'latitude': 34.280874,
          'longitude': -118.766282,
          'country': 'United States',
          'city': 'Simi Valley',
          'state': 'CA',
          'zipcode': undefined,
          'streetName': 'Graystone Pl',
          'streetNumber': '2543',
          'countryCode': 'US'
        });
        mock.verify();
        done();
      });

    });

    test('Should error for no result', (done: any) => {

      const mock = sinon.mock(mockedHttpAdapter);
      mock.expects('get').once().callsArgWith(2, false, {
        '2543 Graystone Place, #123, Simi Valley, CA 93065': null
      }
      );
      const geocoder = new DataScienceToolkitGeocoder(mockedHttpAdapter, {});

      geocoder.geocode('2543 Graystone Place, #123, Simi Valley, CA 93065', function (err: any) {
        err.message.should.to.equal('Could not geocode "2543 Graystone Place, #123, Simi Valley, CA 93065".');
        mock.verify();
        done();
      });

    });
  });

  describe('#reverse', () => {
    test('Should throw an error', () => {
      const geocoder = new DataScienceToolkitGeocoder(mockedHttpAdapter, {});
      expect(() => {
        geocoder.reverse({ lat: 10.0235, lon: -2.3662 }, () => { });
      })
        .to
        .throw(Error, 'DataScienceToolkitGeocoder does not support reverse geocoding');

    });
  });


});
