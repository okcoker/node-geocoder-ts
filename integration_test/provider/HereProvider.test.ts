import getGeocoder, { AbstractGeocoder } from 'src/index';

const apiKey = process.env.HERE_API_KEY;
const options = {
  provider: 'here',
  apiKey: apiKey!
} as const;

// Sign up for a key here:
// https://platform.here.com/
const maybeDescribe = !apiKey ? describe.skip : describe;
if (!apiKey) {
  console.log('HERE_API_KEY not configured. Skipping test suite.');
}

maybeDescribe('Here geocoder', () => {
  let geocoder: AbstractGeocoder<'here'>;;

  beforeAll(() => {
    geocoder = getGeocoder(options);
  });

  describe('geocode', () => {
    it('works', async () => {
      const res = await geocoder.geocode('1231 Av. Lajoie, Montreal');
      expect(res.data[0]).toBeDefined();
      expect(res.data[0]).toMatchObject({
        latitude: 45.52106,
        longitude: -73.6108,
        formattedAddress: '1231 Avenue Lajoie, Outremont, QC H2V 1P2, Canada',
        country: 'Canada',
        countryCode: 'CA',
        state: 'Québec',
        city: 'Montréal',
        zipcode: 'H2V 1P2'
      });
    });
  });

  describe('reverse', () => {
    it('works', async () => {
      const res = await geocoder.reverse({ lat: 45.521056, lon: -73.610734 });
      expect(res.data[0]).toBeDefined();
      expect(res.data[0]).toMatchObject({
        latitude: 45.5209075,
        longitude: -73.6105696,
        formattedAddress: 'Avenue Lajoie, Outremont, QC H2V, Canada',
        country: 'Canada',
        countryCode: 'CA',
        state: 'Québec',
        city: 'Montréal',
        zipcode: 'H2V'
      });
    });
  });
});
