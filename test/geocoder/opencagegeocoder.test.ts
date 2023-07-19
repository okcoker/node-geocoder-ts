(function() {
    var chai = require('chai'),
        should = chai.should(),
        expect = chai.expect,
        sinon = require('sinon');

    var OpenCageGeocoder = require('../../lib/geocoder/opencagegeocoder.js');

    var mockedHttpAdapter = {
        get: function() {}
    };

    // @ts-expect-error TS(2582): Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
    describe('OpenCageGeocoder', () => {

        // @ts-expect-error TS(2582): Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
        describe('#constructor' , () => {

            // @ts-expect-error TS(2582): Cannot find name 'test'. Do you need to install ty... Remove this comment to see the full error message
            test('an http adapter must be set', () => {

                expect(function() {new OpenCageGeocoder();}).to.throw(Error, 'OpenCageGeocoder need an httpAdapter');
            });

            // @ts-expect-error TS(2582): Cannot find name 'test'. Do you need to install ty... Remove this comment to see the full error message
            test('an apiKey must be set', () => {

                expect(function() {new OpenCageGeocoder(mockedHttpAdapter);}).to.throw(Error, 'OpenCageGeocoder needs an apiKey');
            });

            // @ts-expect-error TS(2582): Cannot find name 'test'. Do you need to install ty... Remove this comment to see the full error message
            test('Should be an instance of OpenCageGeocoder', () => {

                var ocgAdapter = new OpenCageGeocoder(mockedHttpAdapter, 'API_KEY');

                ocgAdapter.should.be.instanceof(OpenCageGeocoder);
            });

        });

        // @ts-expect-error TS(2582): Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
        describe('#geocode' , () => {

            // @ts-expect-error TS(2582): Cannot find name 'test'. Do you need to install ty... Remove this comment to see the full error message
            test('Should not accept IPv4', () => {

                var ocgAdapter = new OpenCageGeocoder(mockedHttpAdapter, 'API_KEY');

                expect(function() {
                        ocgAdapter.geocode('127.0.0.1');
                }).to.throw(Error, 'OpenCageGeocoder does not support geocoding IPv4');

            });

            // @ts-expect-error TS(2582): Cannot find name 'test'. Do you need to install ty... Remove this comment to see the full error message
            test('Should not accept IPv6', () => {

                var ocgAdapter = new OpenCageGeocoder(mockedHttpAdapter, 'API_KEY');

                expect(function() {
                        ocgAdapter.geocode('2001:0db8:0000:85a3:0000:0000:ac1f:8001');
                }).to.throw(Error, 'OpenCageGeocoder does not support geocoding IPv6');

            });

            // @ts-expect-error TS(2582): Cannot find name 'test'. Do you need to install ty... Remove this comment to see the full error message
            test('Should call httpAdapter get method', () => {

                var mock = sinon.mock(mockedHttpAdapter);
                mock.expects('get').once().returns({then: function() {}});

                var ocgAdapter = new OpenCageGeocoder(mockedHttpAdapter, 'API_KEY');

                ocgAdapter.geocode('1 champs élysée Paris');

                mock.verify();

            });

            // @ts-expect-error TS(2582): Cannot find name 'test'. Do you need to install ty... Remove this comment to see the full error message
            test(
                'Should call httpAdapter get method with components if called with object',
                () => {

                    var mock = sinon.mock(mockedHttpAdapter);
                    mock.expects('get').withArgs('http://api.opencagedata.com/geocode/v1/json', {
                        q: '1 champs élysée Paris',
                        bounds: '2.01,48.01,3.01,49.01',
                        countrycode: 'fr',
                        limit: 1,
                        min_confidence: 4,
                        key: 'API_KEY'
                    }).once().returns({then: function() {}});

                    var ocgAdapter = new OpenCageGeocoder(mockedHttpAdapter, 'API_KEY');

                    ocgAdapter.geocode({
                        address: '1 champs élysée Paris',
                        bounds: [2.01,48.01,3.01,49.01],
                        countryCode: 'fr',
                        limit: 1,
                        minConfidence: 4
                    });

                    mock.verify();
                }
            );

            // @ts-expect-error TS(2582): Cannot find name 'test'. Do you need to install ty... Remove this comment to see the full error message
            test('Should return geocoded address', (done: any) => {
                var mock = sinon.mock(mockedHttpAdapter);
                mock.expects('get').once().callsArgWith(2, false, {
                        "status" : {
                          "code" : 200,
                          "message" : "OK"
                       },
                       "results": [
                               {
                                    "annotations" : {
                                       "geohash" : "6gydn5nhb587vf642f07",
                                       "timezone" : {
                                          "name" : "America/Sao_Paulo",
                                          "now_in_dst" : 0,
                                          "offset_sec" : -10800,
                                          "offset_string" : -300,
                                          "short_name" : "BRT"
                                       }
                                    },
                                    "bounds" : {
                                       "northeast" : {
                                          "lat" : -23.5370283,
                                          "lng" : -46.8357228
                                       },
                                       "southwest" : {
                                          "lat" : -23.5373732,
                                          "lng" : -46.8374628
                                       }
                                    },
                                    "components" : {
                                       "city" : "Carapicuíba",
                                       "country" : "Brazil",
                                       "country_code" : "BR",
                                       "county" : "RMSP",
                                       "road" : "Rua Cafelândia",
                                       "state" : "SP"
                                    },
                                    "confidence" : 10,
                                    "formatted" : "Rua Cafelândia, Carapicuíba, RMSP, SP, Brazil",
                                    "geometry" : {
                                       "lat" : -23.5373732,
                                       "lng" : -46.8374628
                                    }
                                }
                        ]
                    }
                );

                var ocgAdapter = new OpenCageGeocoder(mockedHttpAdapter, 'API_KEY');

                ocgAdapter.geocode('Rua Cafelândia, Carapicuíba, Brasil', function(err: any, results: any) {
                    err.should.to.equal(false);

                    results[0].should.to.deep.equal({
                        "latitude": -23.5373732,
                        "longitude": -46.8374628,
                        "country": "Brazil",
                        "city": "Carapicuíba",
                        "state" : "SP",
                        "streetName": "Rua Cafelândia",
                        "countryCode": "BR",
                        "zipcode": undefined,
                        "streetNumber": undefined,
                        "county" : "RMSP",
                        "extra" : {
                          "confidence": 10,
                          "confidenceKM": 0.25
                        }
                    });

                    results.raw.should.deep.equal({
                        "status" : {
                          "code" : 200,
                          "message" : "OK"
                       },
                       "results": [
                               {
                                    "annotations" : {
                                       "geohash" : "6gydn5nhb587vf642f07",
                                       "timezone" : {
                                          "name" : "America/Sao_Paulo",
                                          "now_in_dst" : 0,
                                          "offset_sec" : -10800,
                                          "offset_string" : -300,
                                          "short_name" : "BRT"
                                       }
                                    },
                                    "bounds" : {
                                       "northeast" : {
                                          "lat" : -23.5370283,
                                          "lng" : -46.8357228
                                       },
                                       "southwest" : {
                                          "lat" : -23.5373732,
                                          "lng" : -46.8374628
                                       }
                                    },
                                    "components" : {
                                       "city" : "Carapicuíba",
                                       "country" : "Brazil",
                                       "country_code" : "BR",
                                       "county" : "RMSP",
                                       "road" : "Rua Cafelândia",
                                       "state" : "SP"
                                    },
                                    "confidence" : 10,
                                    "formatted" : "Rua Cafelândia, Carapicuíba, RMSP, SP, Brazil",
                                    "geometry" : {
                                       "lat" : -23.5373732,
                                       "lng" : -46.8374628
                                    }
                                }
                        ]
                    });

                    mock.verify();
                    done();
                });
            });

        });

        // @ts-expect-error TS(2582): Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
        describe('#reverse' , () => {
            // @ts-expect-error TS(2582): Cannot find name 'test'. Do you need to install ty... Remove this comment to see the full error message
            test('Should return geocoded address', (done: any) => {
                var mock = sinon.mock(mockedHttpAdapter);
                mock.expects('get').once().callsArgWith(2, false, {
                    "status" : {
                       "code" : 200,
                       "message" : "OK"
                    },
                    "results" : [{
                                    "annotations" : {
                                       "geohash" : "u33db8bfx487rtu007b1",
                                       "timezone" : {
                                          "name" : "Europe/Berlin",
                                          "now_in_dst" : 1,
                                          "offset_sec" : 7200,
                                          "offset_string" : 200,
                                          "short_name" : "CEST"
                                       }
                                    },
                                    "bounds" : {
                                       "northeast" : {
                                          "lat" : 52.5193835,
                                          "lng" : 13.3831142
                                       },
                                       "southwest" : {
                                          "lat" : 52.5190883,
                                          "lng" : 13.3823801
                                       }
                                    },
                                    "components" : {
                                       "city" : "Berlin",
                                       "city_district" : "Mitte",
                                       "country" : "Germany",
                                       "country_code" : "de",
                                       "house" : "Deutscher Bundestag",
                                       "house_number" : 10,
                                       "postcode" : 10117,
                                       "road" : "Reichstagufer",
                                       "state" : "Berlin",
                                       "suburb" : "Mitte"
                                    },
                                    "geometry" : {
                                       "lat" : 52.51921145,
                                       "lng" : 13.3826786867678
                                     }
                                }]
                    }
                );
                var ocgAdapter = new OpenCageGeocoder(mockedHttpAdapter, 'API_KEY');
                ocgAdapter.reverse({lat:13.3826786867678, lon:52.51921145}, function(err: any, results: any) {
                        err.should.to.equal(false);
                        results[0].should.to.deep.equal({
                            "latitude": 52.51921145,
                            "longitude": 13.3826786867678,
                            "country": "Germany",
                            "city": "Berlin",
                            "state": "Berlin",
                            "zipcode": 10117,
                            "streetName": "Reichstagufer",
                            "streetNumber": 10,
                            "countryCode": "de",
                            "county" : undefined,
                            "extra" : {
                                "confidence": 0,
                                "confidenceKM": Number.NaN
                            }
                        });
                        mock.verify();
                        done();
                });
            });
        });
    });
})();
