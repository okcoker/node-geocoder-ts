// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'NodeGeocod... Remove this comment to see the full error message
const NodeGeocoder = require('../../index');

// @ts-expect-error TS(2582): Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe('Google geocoder', () => {
  let geocoder: any;

  // @ts-expect-error TS(2304): Cannot find name 'beforeAll'.
  beforeAll(() => {
    const apiKey = process.env.GOOGLE_API_KEY;
    const options = {
      provider: 'google',
      apiKey
    };

    if (!apiKey || apiKey === '') {
      throw new Error('GOOGLE_API_KEY not configured');
    }

    geocoder = NodeGeocoder(options);
  });

  // @ts-expect-error TS(2582): Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
  describe('geocode', () => {
    // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('works', async () => {
      const res = await geocoder.geocode('1231 Avenue Lajoie, Montreal');
      expect(res[0]).toBeDefined();
      expect(res[0]).toMatchObject({
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

  // @ts-expect-error TS(2582): Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
  describe('reverse', () => {
    // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('works', async () => {
      const res = await geocoder.reverse({ lat: 45.521056, lon: -73.610734 });
      expect(res[0]).toBeDefined();
      expect(res[0]).toMatchObject({
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
