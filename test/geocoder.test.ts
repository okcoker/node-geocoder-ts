import Geocoder from 'lib/geocoder';
import { buildGeocoder } from 'test/helpers/mocks';

const stupidGeocoder = buildGeocoder();

const stupidBatchGeocoder = {
  ...stupidGeocoder,
  _batchGeocode: function (data: any, cb: any) {
    cb(null, data);
  }
};

describe('Geocoder', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('#constructor', () => {
    test('Should set _adapter', () => {
      const geocoder = new Geocoder(stupidGeocoder);

      geocoder._adapter.should.be.equal(stupidGeocoder);
    });
  });

  describe('#geocode', () => {
    test('Should call geocoder geocode method', async () => {
      const spy = jest.spyOn(stupidGeocoder, 'geocode');
      const geocoder = new Geocoder(stupidGeocoder);

      await geocoder.geocode('127.0.0.1');

      expect(spy).toHaveBeenCalledTimes(1);
    });

    test('Should return a promise', async () => {
      const geocoder = new Geocoder(stupidGeocoder);

      const promise = geocoder.geocode('127.0.0.1');

      expect(promise).toBeInstanceOf('Promise');

      await promise;
    });
  });

  describe('#batchGeocode', () => {
    test('Should call stupidGeocoder geocoder method x times', async () => {
      const spy = jest.spyOn(stupidGeocoder, 'geocode');
      const geocoder = new Geocoder(stupidGeocoder);
      await geocoder.batchGeocode(['127.0.0.1', '127.0.0.1']);
      expect(spy).toHaveBeenCalledTimes(2);
    });

    test('Should return a promise', async () => {
      const geocoder = new Geocoder(stupidGeocoder);

      const promise = geocoder.batchGeocode(['127.0.0.1']);
      expect(promise).toBeInstanceOf('Promise');

      await promise;
    });

    test('Should call stupidBatchGeocoder.batchGeocoder method only once when implemented', async () => {
      const spy = jest.spyOn(stupidGeocoder, 'batchGeocode');
      const geocoder = new Geocoder(stupidBatchGeocoder);
      await geocoder.batchGeocode(['127.0.0.1', '127.0.0.1']);
      expect(spy).toHaveBeenCalledTimes(1);
    });
  });

  describe('#reverse', () => {
    test('Should call stupidGeocoder reverse method', async () => {
      const spy = jest.spyOn(stupidGeocoder, 'geocode');
      const geocoder = new Geocoder(stupidGeocoder);

      await geocoder.reverse({ lat: 1, lon: 2 });
      expect(spy).toHaveBeenCalledTimes(1);
    });

    test('Should return a promise', async () => {
      const geocoder = new Geocoder(stupidGeocoder);

      const promise = geocoder.reverse({ lat: 1, lon: 2 });

      expect(promise).toBeInstanceOf('Promise');

      await promise;
    });
  });
});
