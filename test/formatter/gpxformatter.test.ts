var chai = require('chai');
var should = chai.should();

// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'GpxFormatt... Remove this comment to see the full error message
var GpxFormatter = require('../../lib/formatter/gpxformatter.js');

// @ts-expect-error TS(2582): Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe('GpxFormatter', () => {
  // @ts-expect-error TS(2582): Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
  describe('#format' , () => {
    // @ts-expect-error TS(2582): Cannot find name 'test'. Do you need to install ty... Remove this comment to see the full error message
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
