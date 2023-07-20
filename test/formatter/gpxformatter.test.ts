import chai from 'chai';
import GpxFormatter from '../../lib/formatter/gpxformatter';

chai.should();

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

      results.should.be.a('string');
      results.should.include(
        '<wpt lat="40.714232" lon="-73.9612889"><name></name></wpt>'
      );
    });
  });
});
