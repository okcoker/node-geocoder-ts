import getGecoder, { AbstractGeocoder } from 'src/index';

const apiKey = process.env.GOOGLE_API_KEY;
const options = {
  provider: 'google',
  apiKey
} as const;

// Enable the Geocoding API in your cloud account here:
// https://console.cloud.google.com/apis/library/browse?q=geocoding%20api
const maybeDescribe = !apiKey ? describe.skip : describe;
if (!apiKey) {
  console.log('GOOGLE_API_KEY not configured. Skipping test suite.');
}

maybeDescribe('Google geocoder', () => {
  let geocoder: AbstractGeocoder<'google'>;

  beforeAll(() => {
    geocoder = getGecoder(options);
  });

  describe('geocode', () => {
    it('works', async () => {
      const res = await geocoder.geocode('1231 Avenue Lajoie, Montreal');

      expect(res.data[0]).toMatchObject({
        latitude: 45.5210619,
        longitude: -73.61070029999999,
        formattedAddress: '1231 Av. Lajoie, Outremont, QC H2V 1P2, Canada',
        country: 'Canada',
        countryCode: 'CA',
        city: 'Montréal',
        zipcode: 'H2V 1P2'
      });
    });
  });

  describe('reverse', () => {
    it('works', async () => {
      const res = await geocoder.reverse({ lat: 45.521056, lon: -73.610734 });
      expect(res.data[0]).toMatchObject({
        latitude: 45.5210619,
        longitude: -73.61070029999999,
        formattedAddress: '1231 Av. Lajoie, Outremont, QC H2V 1P2, Canada',
        country: 'Canada',
        countryCode: 'CA',
        city: 'Montréal',
        zipcode: 'H2V 1P2'
      });
    });
  });
});
