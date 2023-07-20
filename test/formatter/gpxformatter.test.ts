import chai from 'chai';
import GpxFormatter from '../../lib/formatter/gpxformatter';

const should = chai.should();

describe('GpxFormatter', () => {
  describe('#format', () => {
    test('should format using gpx format', () => {
      var formatter = new GpxFormatter();

      var results = formatter.format([{
        latitude: 40.714232,
        longitude: -73.9612889
      }]);

      results.should.be.a('string');
      results.should.include('<wpt lat="40.714232" lon="-73.9612889"><name></name></wpt>');
    });
  });
});
