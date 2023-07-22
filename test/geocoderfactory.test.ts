import chai from 'chai';

import GoogleGeocoder from 'lib/geocoder/googlegeocoder';
import HereGeocoder from 'lib/geocoder/heregeocoder';
import getGeocoder from 'lib/geocoderfactory';
import DataScienceToolkitGeocoder from 'lib/geocoder/datasciencetoolkitgeocoder';
import OpenStreetMapGeocoder from 'lib/geocoder/openstreetmapgeocoder';
import LocationIQGeocoder from 'lib/geocoder/locationiqgeocoder';
import PickPointGeocoder from 'lib/geocoder/pickpointgeocoder';

import FetchAdapter from 'lib/httpadapter/fetchadapter';

chai.should();
const expect = chai.expect;

import GpxFormatter from 'lib/formatter/gpxformatter';
import StringFormatter from 'lib/formatter/stringformatter';

import { Provider } from 'lib/providers';

describe('GeocoderFactory', () => {
  describe('getGeocoder', () => {
    test('called with "google", and extra business key must return google geocoder with business key', () => {
      const geocoder = getGeocoder('google', {
        clientId: 'CLIENT_ID',
        apiKey: 'API_KEY'
      });

      const geocoderAdapter = geocoder._adapter;

      geocoderAdapter.should.be.instanceof(GoogleGeocoder);
      geocoderAdapter.options.clientId.should.be.equal('CLIENT_ID');
      geocoderAdapter.options.apiKey.should.be.equal('API_KEY');
      geocoderAdapter.httpAdapter.should.be.instanceof(FetchAdapter);
    });

    test('called with "google", and extra business key must return google geocoder with business key', () => {
      const geocoder = getGeocoder({
        provider: 'google',
        clientId: 'CLIENT_ID',
        apiKey: 'API_KEY'
      });

      const geocoderAdapter = geocoder._adapter;

      geocoderAdapter.should.be.instanceof(GoogleGeocoder);
      geocoderAdapter.options.clientId.should.be.equal('CLIENT_ID');
      geocoderAdapter.options.apiKey.should.be.equal('API_KEY');
      geocoderAdapter.httpAdapter.should.be.instanceof(FetchAdapter);
    });

    test('called with "google", "fetch" and extra business key and excludePartialMatches must return google geocoder with fetch adapter and business key and exclude partial matches', () => {
      const geocoder = getGeocoder('google', {
        clientId: 'CLIENT_ID',
        apiKey: 'API_KEY',
        excludePartialMatches: true
      });

      const geocoderAdapter = geocoder._adapter;

      geocoderAdapter.should.be.instanceof(GoogleGeocoder);
      geocoderAdapter.options.clientId.should.be.equal('CLIENT_ID');
      geocoderAdapter.options.apiKey.should.be.equal('API_KEY');
      geocoderAdapter.options.excludePartialMatches.should.be.equal(true);
      geocoderAdapter.httpAdapter.should.be.instanceof(FetchAdapter);
    });

    test('called with "google" and extra business key and excludePartialMatches must return google geocoder with business key and exclude partial matches', () => {
      const geocoder = getGeocoder('google', {
        clientId: 'CLIENT_ID',
        apiKey: 'API_KEY',
        excludePartialMatches: true
      });

      const geocoderAdapter = geocoder._adapter;

      geocoderAdapter.should.be.instanceof(GoogleGeocoder);
      geocoderAdapter.options.clientId.should.be.equal('CLIENT_ID');
      geocoderAdapter.options.apiKey.should.be.equal('API_KEY');
      geocoderAdapter.options.excludePartialMatches.should.be.equal(true);
      geocoderAdapter.httpAdapter.should.be.instanceof(FetchAdapter);
    });

    test('called with "google", "http", extra language key and extra region must return google geocoder with options language', () => {
      const geocoder = getGeocoder('google', {
        language: 'fr',
        region: 'de'
      });

      const geocoderAdapter = geocoder._adapter;

      geocoderAdapter.should.be.instanceof(GoogleGeocoder);
      geocoderAdapter.options.language.should.be.equal('fr');
      geocoderAdapter.options.region.should.be.equal('de');
      geocoderAdapter.httpAdapter.should.be.instanceof(FetchAdapter);
    });

    test('called with "google" and "http" and "gpx" must return google geocoder with gpx formatter', () => {
      const geocoder = getGeocoder('google', {
        formatter: 'gpx'
      });

      const geocoderAdapter = geocoder._adapter;
      const formatter = geocoder._formatter!;

      geocoderAdapter.should.be.instanceof(GoogleGeocoder);
      geocoderAdapter.httpAdapter.should.be.instanceof(FetchAdapter);
      formatter.should.be.instanceof(GpxFormatter);
    });

    test('called with "google" and "http" and "string" must return google geocoder with string formatter', () => {
      const geocoder = getGeocoder('google', {
        formatter: 'string',
        formatterOptions: {
          pattern: 'PATTERN'
        }
      });

      const geocoderAdapter = geocoder._adapter;
      const formatter = geocoder._formatter!;

      geocoderAdapter.should.be.instanceof(GoogleGeocoder);
      geocoderAdapter.httpAdapter.should.be.instanceof(FetchAdapter);
      formatter!.should.be.instanceof(StringFormatter);
    });

    test('called with "google" must return google geocoder with fetch adapter', () => {
      const geocoder = getGeocoder('google');

      const geocoderAdapter = geocoder._adapter;

      geocoderAdapter.should.be.instanceof(GoogleGeocoder);
      geocoderAdapter.httpAdapter.should.be.instanceof(FetchAdapter);
    });

    test('called with "here", "http" and extra business key must return here geocoder with business key', () => {
      const geocoder = getGeocoder({
        provider: 'here',
        apiKey: '',
        appId: 'APP_ID',
        appCode: 'APP_CODE'
      });

      const geocoderAdapter = geocoder._adapter;

      geocoderAdapter.should.be.instanceof(HereGeocoder);
      geocoderAdapter.options.appId.should.be.equal('APP_ID');
      geocoderAdapter.options.appCode.should.be.equal('APP_CODE');
      geocoderAdapter.httpAdapter.should.be.instanceof(FetchAdapter);
    });

    test('called with "here", "https" and extra business key must return here geocoder with business key', () => {
      const geocoder = getGeocoder('here', {
        apiKey: '',
        appId: 'APP_ID',
        appCode: 'APP_CODE'
      });

      const geocoderAdapter = geocoder._adapter;

      geocoderAdapter.should.be.instanceof(HereGeocoder);
      geocoderAdapter.options.appId.should.be.equal('APP_ID');
      geocoderAdapter.options.appCode.should.be.equal('APP_CODE');
      geocoderAdapter.httpAdapter.should.be.instanceof(FetchAdapter);
    });

    test('called with "here" and "http" and language must return here geocoder with language', () => {
      const geocoder = getGeocoder('here', {
        apiKey: '',
        appId: 'APP_ID',
        appCode: 'APP_CODE',
        language: 'en'
      });

      const geocoderAdapter = geocoder._adapter;

      geocoderAdapter.should.be.instanceof(HereGeocoder);
      geocoderAdapter.httpAdapter.should.be.instanceof(FetchAdapter);
      geocoderAdapter.options.language.should.be.equal('en');
    });

    test('called with "here" and "http" and politicalView must return here geocoder with politicalView', () => {
      const geocoder = getGeocoder('here', {
        apiKey: '',
        appId: 'APP_ID',
        appCode: 'APP_CODE',
        politicalView: 'GRE'
      });

      const geocoderAdapter = geocoder._adapter;

      geocoderAdapter.should.be.instanceof(HereGeocoder);
      geocoderAdapter.httpAdapter.should.be.instanceof(FetchAdapter);
      geocoderAdapter.options.politicalView.should.be.equal('GRE');
    });

    test('called with "here" and "http" and country must return here geocoder with  country', () => {
      const geocoder = getGeocoder('here', {
        apiKey: '',
        appId: 'APP_ID',
        appCode: 'APP_CODE',
        country: 'FR'
      });

      const geocoderAdapter = geocoder._adapter;

      geocoderAdapter.should.be.instanceof(HereGeocoder);
      geocoderAdapter.httpAdapter.should.be.instanceof(FetchAdapter);
      geocoderAdapter.options.country.should.be.equal('FR');
    });

    test('called with "here" and "http" and state must return here geocoder with state', () => {
      const geocoder = getGeocoder('here', {
        apiKey: '',
        appId: 'APP_ID',
        appCode: 'APP_CODE',
        state: 'Île-de-France'
      });

      const geocoderAdapter = geocoder._adapter;

      geocoderAdapter.should.be.instanceof(HereGeocoder);
      geocoderAdapter.httpAdapter.should.be.instanceof(FetchAdapter);
      geocoderAdapter.options.state.should.be.equal('Île-de-France');
    });

    test('called with "here" and "http" and "gpx" must return here geocoder with gpx formatter', () => {
      const geocoder = getGeocoder('here', {
        apiKey: '',
        appId: 'APP_ID',
        appCode: 'APP_CODE',
        formatter: 'gpx'
      });

      const geocoderAdapter = geocoder._adapter;
      const formatter = geocoder._formatter!;

      geocoderAdapter.should.be.instanceof(HereGeocoder);
      geocoderAdapter.httpAdapter.should.be.instanceof(FetchAdapter);
      formatter.should.be.instanceof(GpxFormatter);
    });

    test('called with "here" and "http" and "string" must return here geocoder with string formatter', () => {
      const geocoder = getGeocoder('here', {
        apiKey: '',
        appId: 'APP_ID',
        appCode: 'APP_CODE',
        formatter: 'string',
        formatterOptions: {
          pattern: 'PATTERN'
        }
      });

      const geocoderAdapter = geocoder._adapter;
      const formatter = geocoder._formatter!;

      geocoderAdapter.should.be.instanceof(HereGeocoder);
      geocoderAdapter.httpAdapter.should.be.instanceof(FetchAdapter);
      formatter.should.be.instanceof(StringFormatter);
    });

    test('called with "datasciencetoolkit" and "http" must return datasciencetoolkit geocoder', () => {
      const geocoder = getGeocoder('datasciencetoolkit');

      const geocoderAdapter = geocoder._adapter;

      geocoderAdapter.should.be.instanceof(DataScienceToolkitGeocoder);
      geocoderAdapter.httpAdapter.should.be.instanceof(FetchAdapter);
    });

    test('called with "datasciencetoolkit" "http" and "host" option must return datasciencetoolkit geocoder with host extra', () => {
      const geocoder = getGeocoder('datasciencetoolkit', {
        host: 'raoul.io'
      });

      const geocoderAdapter = geocoder._adapter;

      geocoderAdapter.should.be.instanceof(DataScienceToolkitGeocoder);
      geocoderAdapter.httpAdapter.should.be.instanceof(FetchAdapter);
      geocoderAdapter.options.host.should.be.equal('raoul.io');
    });

    test('called with "openstreetmap" and "http" must return openstreetmap geocoder with adapter', () => {
      const geocoder = getGeocoder('openstreetmap');

      const geocoderAdapter = geocoder._adapter;

      geocoderAdapter.should.be.instanceof(OpenStreetMapGeocoder);
      geocoderAdapter.httpAdapter.should.be.instanceof(FetchAdapter);
    });

    test('called with "locationiq" and "http" must return locationiq geocoder with adapter', () => {
      const geocoder = getGeocoder('locationiq', {
        apiKey: 'API_KEY'
      });

      const geocoderAdapter = geocoder._adapter;

      geocoderAdapter.should.be.instanceof(LocationIQGeocoder, 'api-key');
      geocoderAdapter.httpAdapter.should.be.instanceof(FetchAdapter);
    });

    test('called with "zaertyazeaze" must throw an error', () => {
      expect(function () {
        getGeocoder('zaertyazeaze' as unknown as Provider);
      }).to.throw(Error, 'No geocoder provider find for : zaertyazeaze');
    });

    test('called with "google", "https" and extra timeout must return google geocoder with http adapter and timeout', () => {
      const timeout = 5 * 1000;
      const geocoder = getGeocoder('google', {
        clientId: 'CLIENT_ID',
        apiKey: 'API_KEY',
        timeout: timeout
      });

      const geocoderAdapter = geocoder._adapter;

      geocoderAdapter.should.be.instanceof(GoogleGeocoder);
      geocoderAdapter.httpAdapter.options.timeout!.should.be.equal(timeout);
      geocoderAdapter.httpAdapter.should.be.instanceof(FetchAdapter);
    });

    test('called with "pickpoint" and API key must return pickpoint geocoder with fetch adapter', () => {
      const geocoder = getGeocoder('pickpoint', {
        apiKey: 'API_KEY'
      });

      const geocoderAdapter = geocoder._adapter;

      geocoderAdapter.should.be.instanceof(PickPointGeocoder);
      geocoderAdapter.httpAdapter.should.be.instanceof(FetchAdapter);
    });
  });
});
