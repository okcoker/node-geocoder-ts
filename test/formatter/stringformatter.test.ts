
var chai = require('chai');
var should = chai.should();
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'expect'.
var expect = chai.expect;

// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'StringForm... Remove this comment to see the full error message
var StringFormatter = require('../../lib/formatter/stringformatter.js');

// @ts-expect-error TS(2582): Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe('StringFormatter', () => {
  // @ts-expect-error TS(2582): Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
  describe('#constructor' , () => {
    // @ts-expect-error TS(2582): Cannot find name 'test'. Do you need to install ty... Remove this comment to see the full error message
    test('a string pattern must be set', () => {
      expect(function() {new StringFormatter();}).to.throw(Error, 'StringFormatter need a pattern');
    });
  });
  // @ts-expect-error TS(2582): Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
  describe('#format' , () => {
    // @ts-expect-error TS(2582): Cannot find name 'test'. Do you need to install ty... Remove this comment to see the full error message
    test('should replace pattern with correct values', () => {
      var formatter = new StringFormatter('%P %p %n %S %z %T %t %c');

      var results = formatter.format([{
        country: 'France',
        countryCode: 'FR',
        streetNumber: 29,
        streetName: 'rue chevreul',
        zipcode: '69007',
        state: 'Rhone alpes',
        stateCode: 'RA',
        city: 'Lyon',
      }]);

      results.should.have.length(1);
      var string = results[0];

      string.should.be.a('string');
      string.should.equal('France FR 29 rue chevreul 69007 Rhone alpes RA Lyon');
    });
  });
});

