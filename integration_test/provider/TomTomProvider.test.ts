import getGeocoder, { AbstractGeocoder } from 'src/index';

const apiKey = process.env.TOMTOM_API_KEY;
const options = {
  provider: 'mapbox',
  apiKey: apiKey!
} as const;
const maybeDescribe = !apiKey ? describe.skip : describe;

if (!apiKey) {
  console.log('TOMTOM_API_KEY not configured. Skipping test suite.');
}

maybeDescribe('TomTom geocoder', () => {
  let geocoder: AbstractGeocoder<'mapbox'>;

  beforeAll(() => {
    geocoder = getGeocoder(options);
  });

  describe('geocode', () => {
    it('works', async () => {
      const res = await geocoder.geocode('1231 Av. Lajoie, Montreal');

      expect(res.data[0]).toBeDefined();
      expect(res.data[0]).toMatchObject({
        latitude: 45.52106,
        longitude: -73.61073,
        country: 'Canada',
        countryCode: 'CA',
        state: 'QC',
        city: 'Outremont'
      });
    });
  });

  describe('batchGeocode', () => {
    it('works', async () => {
      const res = await geocoder.batchGeocode([
        '1231 Av. Lajoie, Montreal',
        '1432 av laurier montreal'
      ]);

      expect(res.data[0]).toBeDefined();
      expect(res.data[0].data).toMatchObject({
        latitude: 45.52106,
        longitude: -73.61073,
        country: 'Canada',
        countryCode: 'CA',
        state: 'QC',
        city: 'Outremont'
      });

      expect(res.data[1]).toBeDefined();
      expect(res.data[1].data).toMatchObject({
        latitude: 45.53383,
        longitude: -73.58328,
        country: 'Canada',
        countryCode: 'CA',
        state: 'QC',
        city: 'Montreal'
      });
    });
  });
});
