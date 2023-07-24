import Geocoder from 'lib/geocoder';
import { buildGeocoderAdapter } from 'test/helpers/mocks';

const mockAdapter = buildGeocoderAdapter();

const stupidBatchGeocoderAdapter = {
  ...mockAdapter,
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
      const geocoder = new Geocoder(mockAdapter);

      expect(geocoder._adapter).toEqual(mockAdapter);
    });
  });

  describe('#geocode', () => {
    test('Should call geocoder geocode method', async () => {
      const spy = jest.spyOn(mockAdapter, 'geocode');
      const geocoder = new Geocoder(mockAdapter);

      await geocoder.geocode('127.0.0.1');

      expect(spy).toHaveBeenCalledTimes(1);
    });

    test('Should return a promise', async () => {
      const geocoder = new Geocoder(mockAdapter);

      const promise = geocoder.geocode('127.0.0.1');

      expect(promise).toBeInstanceOf(Promise);

      await promise;
    });
  });

  describe('#batchGeocode', () => {
    test('Should call mockAdapter geocoder batchGeocode method', async () => {
      const spy = jest.spyOn(mockAdapter, 'batchGeocode');
      const geocoder = new Geocoder(mockAdapter);
      await geocoder.batchGeocode(['127.0.0.1', '127.0.0.1']);
      expect(spy).toHaveBeenCalledTimes(1);
    });

    test('Should return a promise', async () => {
      const geocoder = new Geocoder(mockAdapter);

      const promise = geocoder.batchGeocode(['127.0.0.1']);
      expect(promise).toBeInstanceOf(Promise);

      // Dont care about the result, but also this test seems pointless
      Promise.reject(promise).catch(() => { });
    });

    test('Should call stupidBatchGeocoderAdapter.batchGeocoder method only once when implemented', async () => {
      const spy = jest.spyOn(stupidBatchGeocoderAdapter, 'batchGeocode');
      const geocoder = new Geocoder(stupidBatchGeocoderAdapter);
      await geocoder.batchGeocode(['127.0.0.1', '127.0.0.1']);
      expect(spy).toHaveBeenCalledTimes(1);
    });
  });

  describe('#reverse', () => {
    test('Should call mockAdapter reverse method', async () => {
      const spy = jest.spyOn(mockAdapter, 'reverse');
      const geocoder = new Geocoder(mockAdapter);

      await geocoder.reverse({ lat: 1, lon: 2 });
      expect(spy).toHaveBeenCalledTimes(1);
    });

    test('Should return a promise', async () => {
      const geocoder = new Geocoder(mockAdapter);

      const promise = geocoder.reverse({ lat: 1, lon: 2 });

      expect(promise).toBeInstanceOf(Promise);

      // Dont care about the result, but also this test seems pointless
      Promise.reject(promise).catch(() => { });
    });
  });
});
