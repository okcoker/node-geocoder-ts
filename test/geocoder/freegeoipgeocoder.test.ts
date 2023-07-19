(function() {
    var chai = require('chai'),
        should = chai.should(),
        expect = chai.expect,
        sinon = require('sinon');

    var FreegeoipGeocoder = require('../../lib/geocoder/freegeoipgeocoder.js');

    var mockedHttpAdapter = {
        get: function() {}
    };

    // @ts-expect-error TS(2582): Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
    describe('FreegeoipGeocoder', () => {

        // @ts-expect-error TS(2582): Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
        describe('#constructor' , () => {

            // @ts-expect-error TS(2582): Cannot find name 'test'. Do you need to install ty... Remove this comment to see the full error message
            test('an http adapter must be set', () => {

                expect(function() {new FreegeoipGeocoder();}).to.throw(Error, 'FreegeoipGeocoder need an httpAdapter');
            });

            // @ts-expect-error TS(2582): Cannot find name 'test'. Do you need to install ty... Remove this comment to see the full error message
            test('Should be an instance of FreegeoipGeocoder', () => {

                var freegeoipgeocoder = new FreegeoipGeocoder(mockedHttpAdapter);

                freegeoipgeocoder.should.be.instanceof(FreegeoipGeocoder);
            });

        });

        // @ts-expect-error TS(2582): Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
        describe('#geocode' , () => {

            // @ts-expect-error TS(2582): Cannot find name 'test'. Do you need to install ty... Remove this comment to see the full error message
            test('Should not accept address', () => {

                var freegeoipgeocoder = new FreegeoipGeocoder(mockedHttpAdapter);
                expect(function() {freegeoipgeocoder.geocode('1 rue test');})
                    .to
                    .throw(Error, 'FreegeoipGeocoder does not support geocoding address');


            });

            // @ts-expect-error TS(2582): Cannot find name 'test'. Do you need to install ty... Remove this comment to see the full error message
            test('Should call httpAdapter get method', () => {

                var mock = sinon.mock(mockedHttpAdapter);
                mock.expects('get').once().returns({then: function() {}});

                var freegeoipgeocoder = new FreegeoipGeocoder(mockedHttpAdapter);

                freegeoipgeocoder.geocode('127.0.0.1');

                mock.verify();
            });

            // @ts-expect-error TS(2582): Cannot find name 'test'. Do you need to install ty... Remove this comment to see the full error message
            test('Should return a geocoded address', (done: any) => {
                var mock = sinon.mock(mockedHttpAdapter);
                mock.expects('get').once().callsArgWith(2, false, {
                        ip: '66.249.64.0',
                        country_code: 'US',
                        country_name: 'United States',
                        region_code: 'CA',
                        region_name: 'California',
                        city: 'Mountain View',
                        zip_code: '94040',
                        time_zone: 'America/Los_Angeles',
                        latitude: 37.386,
                        longitude: -122.084,
                        metro_code: 807
                    }
                );
                var freegeoipgeocoder = new FreegeoipGeocoder(mockedHttpAdapter);


                freegeoipgeocoder.geocode('66.249.64.0', function(err: any, results: any) {
                    err.should.to.equal(false);
                    results[0].should.to.deep.equal({
                        'ip': '66.249.64.0',
                        'countryCode': 'US',
                        'country': 'United States',
                        'regionCode': 'CA',
                        'regionName': 'California',
                        'city': 'Mountain View',
                        'zipcode': '94040',
                        'timeZone': 'America/Los_Angeles',
                        'latitude': 37.386,
                        'longitude': -122.084,
                        'metroCode': 807
                    });
                    mock.verify();
                    done();
                });

            });
        });

        // @ts-expect-error TS(2582): Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
        describe('#reverse' , () => {
            // @ts-expect-error TS(2582): Cannot find name 'test'. Do you need to install ty... Remove this comment to see the full error message
            test('Should throw an error', () => {

                  var freegeoipgeocoder = new FreegeoipGeocoder(mockedHttpAdapter);
                expect(function() {freegeoipgeocoder.reverse(10.0235,-2.3662);})
                    .to
                    .throw(Error, 'FreegeoipGeocoder no support reverse geocoding');

            });
        });


    });

})();