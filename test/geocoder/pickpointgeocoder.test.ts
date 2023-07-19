(function () {
    var chai = require('chai'),
        should = chai.should(),
        expect = chai.expect,
        sinon = require('sinon');

    var PickPointGeocoder = require('../../lib/geocoder/pickpointgeocoder.js');

    var mockedHttpAdapter = {
        get: sinon.stub(),
        supportsHttps: sinon.stub()
    };

    // @ts-expect-error TS(2582): Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
    describe('PickPointGeocoder', () => {

        // @ts-expect-error TS(2582): Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
        describe('#constructor', () => {

            // @ts-expect-error TS(2582): Cannot find name 'test'. Do you need to install ty... Remove this comment to see the full error message
            test('should be an instance of PickPointGeocoder', () => {
                mockedHttpAdapter.supportsHttps.returns(true);
                var geocoder = new PickPointGeocoder(mockedHttpAdapter, {apiKey: 'API_KEY'});
                geocoder.should.be.instanceof(PickPointGeocoder);
            });

            // @ts-expect-error TS(2582): Cannot find name 'test'. Do you need to install ty... Remove this comment to see the full error message
            test('an http adapter must be set', () => {
                expect(function () {
                    new PickPointGeocoder();
                }).to.throw(Error, 'PickPointGeocoder need an httpAdapter');
            });

            // @ts-expect-error TS(2582): Cannot find name 'test'. Do you need to install ty... Remove this comment to see the full error message
            test('the adapter should support https', () => {
                mockedHttpAdapter.supportsHttps.returns(false);
                expect(function () {
                    new PickPointGeocoder(mockedHttpAdapter);
                }).to.throw(Error, 'You must use https http adapter');
            });

            // @ts-expect-error TS(2582): Cannot find name 'test'. Do you need to install ty... Remove this comment to see the full error message
            test('an apiKey must be set', () => {
                mockedHttpAdapter.supportsHttps.returns(true);
                expect(function () {
                    new PickPointGeocoder(mockedHttpAdapter);
                }).to.throw(Error, 'PickPointGeocoder needs an apiKey');
            });

        });

    });

})();
