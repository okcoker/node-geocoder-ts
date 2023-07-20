import chai from 'chai';
import StringFormatter from '../../lib/formatter/stringformatter';

chai.should();

const expect = chai.expect;

describe('StringFormatter', () => {
  describe('#constructor', () => {
    test('a string pattern must be set', () => {
      expect(function () {
        new StringFormatter({ pattern: '' });
      }).to.throw(Error, 'StringFormatter need a pattern');
    });
  });

  describe('#format', () => {
    test('should replace pattern with correct values', () => {
      const formatter = new StringFormatter({
        pattern: '%P %p %n %S %z %T %t %c'
      });

      const results = formatter.format([
        {
          country: 'France',
          countryCode: 'FR',
          streetNumber: '29',
          streetName: 'rue chevreul',
          zipcode: '69007',
          state: 'Rhone alpes',
          stateCode: 'RA',
          city: 'Lyon'
        }
      ]);

      results.should.have.length(1);
      const str = results[0];

      str.should.be.a('string');
      str.should.equal('France FR 29 rue chevreul 69007 Rhone alpes RA Lyon');
    });
  });
});
