// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'NodeGeocod... Remove this comment to see the full error message
const NodeGeocoder = require('../../index');

// @ts-expect-error TS(2582): Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe('Here geocoder', () => {
  let geocoder: any;

  // @ts-expect-error TS(2304): Cannot find name 'beforeAll'.
  beforeAll(() => {
    const apiKey = process.env.HERE_API_KEY;
    const options = {
      provider: 'here',
      apiKey
    };

    if (!apiKey || apiKey === '') {
      throw new Error('HERE_API_KEY not configured');
    }

    geocoder = NodeGeocoder(options);
  });

  // @ts-expect-error TS(2582): Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
  describe('geocode', () => {
    // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('works', async () => {
      const res = await geocoder.geocode('1231 Av. Lajoie, Montreal');
      expect(res[0]).toBeDefined();
      expect(res[0]).toMatchObject({
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

  // @ts-expect-error TS(2582): Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
  describe('reverse', () => {
    // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('works', async () => {
      const res = await geocoder.reverse({ lat: 45.521056, lon: -73.610734 });
      expect(res[0]).toBeDefined();
      expect(res[0]).toMatchObject({
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
