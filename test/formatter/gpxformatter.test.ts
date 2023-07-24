import GpxFormatter from '../../lib/formatter/gpxformatter';

describe('GpxFormatter', () => {
  describe('#format', () => {
    test('should format using gpx format', () => {
      const formatter = new GpxFormatter();

      const results = formatter.format([
        {
          latitude: 40.714232,
          longitude: -73.9612889
        }
      ]);

      expect(results).toContain(
        '<wpt lat="40.714232" lon="-73.9612889"><name></name></wpt>'
      );
    });
  });
});
