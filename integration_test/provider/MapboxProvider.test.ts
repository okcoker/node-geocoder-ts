import createGeocoder, { AbstractGeocoder } from 'src/index';

const apiKey = process.env.MAPBOX_API_KEY;
const options = {
  provider: 'mapbox',
  apiKey: apiKey!
} as const;
const maybeDescribe = !apiKey ? describe.skip : describe;

if (!apiKey) {
  console.log('MAPBOX_API_KEY not configured. Skipping test suite.');
}

maybeDescribe('Mapbox geocoder', () => {
  let geocoder: AbstractGeocoder<'mapbox'>;

  beforeAll(() => {
    geocoder = createGeocoder(options);
  });

  describe('geocode', () => {
    it('works', async () => {
      const res = await geocoder.geocode('1231 Av. Lajoie, Montreal');

      expect(res.data[0]).toBeDefined();
      expect(res.data[0]).toMatchObject({
        latitude: 45.521056,
        longitude: -73.610734,
        formattedAddress:
          '1231 Avenue Lajoie, Montréal, Quebec H2V 1P2, Canada',
        country: 'Canada',
        countryCode: 'CA',
        state: 'Quebec',
        city: 'Montréal',
        zipcode: 'H2V 1P2',
        neighbourhood: 'Outremont'
      });
    });
  });

  describe('reverse', () => {
    it('works', async () => {
      const res = await geocoder.reverse({ lat: 45.521056, lon: -73.610734 });
      expect(res.data[0]).toBeDefined();
      expect(res.data[0]).toMatchObject({
        latitude: 45.52105585,
        longitude: -73.61073425,
        formattedAddress:
          '1231 Avenue Lajoie, Montréal, Quebec H2V 1P2, Canada',
        country: 'Canada',
        countryCode: 'CA',
        state: 'Quebec',
        city: 'Montréal',
        zipcode: 'H2V 1P2',
        neighbourhood: 'Outremont'
      });
    });
  });
});
