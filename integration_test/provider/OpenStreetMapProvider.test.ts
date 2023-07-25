import getGeocoder, { AbstractGeocoder, ResultData } from 'src/index';

describe('Openstreetmap geocoder', () => {
  let geocoder: AbstractGeocoder<'openstreetmap'>;

  beforeAll(() => {
    const options = {
      provider: 'openstreetmap'
    } as const;

    geocoder = getGeocoder(options);
  });

  describe('geocode', () => {
    it('works with basic value', async () => {
      const res = await geocoder.geocode('1231 Av. Lajoie, Montreal');
      const firstResult = res.data[0] as ResultData;

      expect(firstResult).toBeDefined();
      expect(firstResult).toEqual(expect.objectContaining({
        country: 'Canada',
        countryCode: 'CA',
        state: 'Québec',
        city: 'Montréal'
      }));
      expect(Math.trunc(firstResult.latitude!)).toEqual(45);
      expect(Math.trunc(firstResult.longitude!)).toEqual(-73);
    });

    it('works with openstreetmap params', async () => {
      const res = await geocoder.geocode({
        q: '1231 Av. Lajoie, Montreal',
        limit: 2
      });
      const firstResult = res.data[0] as ResultData;

      expect(res.data).toHaveLength(2);
      expect(firstResult).toBeDefined();
      expect(firstResult).toEqual(expect.objectContaining({
        country: 'Canada',
        countryCode: 'CA',
        state: 'Québec',
        city: 'Montréal'
      }));
      expect(Math.trunc(firstResult.latitude!)).toEqual(45);
      expect(Math.trunc(firstResult.longitude!)).toEqual(-73);
    });
  });
});
