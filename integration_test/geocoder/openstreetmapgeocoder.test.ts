// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'NodeGeocod... Remove this comment to see the full error message
const NodeGeocoder = require('../../index');

// @ts-expect-error TS(2582): Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe('Openstreetmap geocoder', () => {
  let geocoder: any;

  // @ts-expect-error TS(2304): Cannot find name 'beforeAll'.
  beforeAll(() => {
    const options = {
      provider: 'openstreetmap'
    };

    geocoder = NodeGeocoder(options);
  });

  // @ts-expect-error TS(2582): Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
  describe('geocode', () => {
    // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('works with basic value', async () => {
      const res = await geocoder.geocode('1231 Av. Lajoie, Montreal');

      expect(res[0]).toBeDefined();
      expect(res[0]).toMatchObject({
        latitude: 45.5209666,
        longitude: -73.6107766,
        country: 'Canada',
        countryCode: 'CA',
        state: 'Québec',
        city: 'Montréal'
      });
    });

    // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('works with openstreetmap params', async () => {
      const res = await geocoder.geocode({
        q: '1231 Av. Lajoie, Montreal',
        limit: 2
      });

      expect(res).toHaveLength(2);
      expect(res[0]).toBeDefined();
      expect(res[0]).toMatchObject({
        latitude: 45.5209666,
        longitude: -73.6107766,
        country: 'Canada',
        countryCode: 'CA',
        state: 'Québec',
        city: 'Montréal'
      });
    });
  });
});
