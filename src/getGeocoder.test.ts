import GoogleGeocoder from 'src/provider/google/GoogleProvider';
import HereGeocoder from 'src/provider/here/HereProvider';
import getGeocoder from 'src/getGeocoder';
import DataScienceToolkitProvider from 'src/provider/datasciencetoolkit/DataScienceToolkitProvider';
import OpenStreetMapProvider from 'src/provider/openstreetmap/OpenStreetMapProvider';
import LocationIQGeocoder from 'src/provider/locationiq/LocationIQProvider';
import PickPointGeocoder from 'src/provider/pickpoint/PickPointProvider';

import FetchAdapter from 'src/httpadapter/FetchAdapter';

import GpxFormatter from 'src/formatter/GpxFormatter';
import StringFormatter from 'src/formatter/StringFormatter';

import { Provider } from 'src/provider/providers';

describe('GeocoderFactory', () => {
  describe('getGeocoder', () => {
    test('called with "google", and extra business key must return google geocoder with business key', () => {
      const geocoder = getGeocoder('google', {
        clientId: 'CLIENT_ID',
        apiKey: 'API_KEY'
      });

      const adapter = geocoder._adapter;

      expect(adapter).toBeInstanceOf(GoogleGeocoder);
      expect(adapter.options.clientId).toEqual('CLIENT_ID');
      expect(adapter.options.apiKey).toEqual('API_KEY');
      expect(adapter.httpAdapter).toBeInstanceOf(FetchAdapter);
    });

    test('called with "google", and extra business key must return google geocoder with business key', () => {
      const geocoder = getGeocoder({
        provider: 'google',
        clientId: 'CLIENT_ID',
        apiKey: 'API_KEY'
      });

      const adapter = geocoder._adapter;

      expect(adapter).toBeInstanceOf(GoogleGeocoder);
      expect(adapter.options.clientId).toEqual('CLIENT_ID');
      expect(adapter.options.apiKey).toEqual('API_KEY');
      expect(adapter.httpAdapter).toBeInstanceOf(FetchAdapter);
    });

    test('called with "google", "fetch" and extra business key and excludePartialMatches must return google geocoder with fetch adapter and business key and exclude partial matches', () => {
      const geocoder = getGeocoder('google', {
        clientId: 'CLIENT_ID',
        apiKey: 'API_KEY',
        excludePartialMatches: true
      });

      const adapter = geocoder._adapter;

      expect(adapter).toBeInstanceOf(GoogleGeocoder);
      expect(adapter.options.clientId).toEqual('CLIENT_ID');
      expect(adapter.options.apiKey).toEqual('API_KEY');
      expect(adapter.options.excludePartialMatches).toEqual(true);
      expect(adapter.httpAdapter).toBeInstanceOf(FetchAdapter);
    });

    test('called with "google" and extra business key and excludePartialMatches must return google geocoder with business key and exclude partial matches', () => {
      const geocoder = getGeocoder('google', {
        clientId: 'CLIENT_ID',
        apiKey: 'API_KEY',
        excludePartialMatches: true
      });

      const adapter = geocoder._adapter;

      expect(adapter).toBeInstanceOf(GoogleGeocoder);
      expect(adapter.options.clientId).toEqual('CLIENT_ID');
      expect(adapter.options.apiKey).toEqual('API_KEY');
      expect(adapter.options.excludePartialMatches).toEqual(true);
      expect(adapter.httpAdapter).toBeInstanceOf(FetchAdapter);
    });

    test('called with "google", "http", extra language key and extra region must return google geocoder with options language', () => {
      const geocoder = getGeocoder('google', {
        language: 'fr',
        region: 'de'
      });

      const adapter = geocoder._adapter;

      expect(adapter).toBeInstanceOf(GoogleGeocoder);
      expect(adapter.options.language).toEqual('fr');
      expect(adapter.options.region).toEqual('de');
      expect(adapter.httpAdapter).toBeInstanceOf(FetchAdapter);
    });

    test('called with "google" and "http" and "gpx" must return google geocoder with gpx formatter', () => {
      const geocoder = getGeocoder('google', {
        formatter: 'gpx'
      });

      const adapter = geocoder._adapter;
      const formatter = geocoder._formatter!;

      expect(adapter).toBeInstanceOf(GoogleGeocoder);
      expect(adapter.httpAdapter).toBeInstanceOf(FetchAdapter);
      expect(formatter).toBeInstanceOf(GpxFormatter);
    });

    test('called with "google" and "http" and "string" must return google geocoder with string formatter', () => {
      const geocoder = getGeocoder('google', {
        formatter: 'string',
        formatterOptions: {
          pattern: 'PATTERN'
        }
      });

      const adapter = geocoder._adapter;
      const formatter = geocoder._formatter!;

      expect(adapter).toBeInstanceOf(GoogleGeocoder);
      expect(adapter.httpAdapter).toBeInstanceOf(FetchAdapter);
      expect(formatter).toBeInstanceOf(StringFormatter);
    });

    test('called with "google" must return google geocoder with fetch adapter', () => {
      const geocoder = getGeocoder('google');

      const adapter = geocoder._adapter;

      expect(adapter).toBeInstanceOf(GoogleGeocoder);
      expect(adapter.httpAdapter).toBeInstanceOf(FetchAdapter);
    });

    test('called with "here", "http" and extra business key must return here geocoder with business key', () => {
      const geocoder = getGeocoder({
        provider: 'here',
        appId: 'APP_ID',
        appCode: 'APP_CODE'
      });

      const adapter = geocoder._adapter;

      expect(adapter).toBeInstanceOf(HereGeocoder);
      expect(adapter.options.appId).toEqual('APP_ID');
      expect(adapter.options.appCode).toEqual('APP_CODE');
      expect(adapter.httpAdapter).toBeInstanceOf(FetchAdapter);
    });

    test('called with "here", "https" and extra business key must return here geocoder with business key', () => {
      const geocoder = getGeocoder('here', {
        appId: 'APP_ID',
        appCode: 'APP_CODE'
      });

      const adapter = geocoder._adapter;

      expect(adapter).toBeInstanceOf(HereGeocoder);
      expect(adapter.options.appId).toEqual('APP_ID');
      expect(adapter.options.appCode).toEqual('APP_CODE');
      expect(adapter.httpAdapter).toBeInstanceOf(FetchAdapter);
    });

    test('called with "here" and "http" and language must return here geocoder with language', () => {
      const geocoder = getGeocoder('here', {
        appId: 'APP_ID',
        appCode: 'APP_CODE',
        language: 'en'
      });

      const adapter = geocoder._adapter;

      expect(adapter).toBeInstanceOf(HereGeocoder);
      expect(adapter.httpAdapter).toBeInstanceOf(FetchAdapter);
      expect(adapter.options.language).toEqual('en');
    });

    test('called with "here" and "http" and politicalView must return here geocoder with politicalView', () => {
      const geocoder = getGeocoder('here', {
        appId: 'APP_ID',
        appCode: 'APP_CODE',
        politicalView: 'GRE'
      });

      const adapter = geocoder._adapter;

      expect(adapter).toBeInstanceOf(HereGeocoder);
      expect(adapter.httpAdapter).toBeInstanceOf(FetchAdapter);
      expect(adapter.options.politicalView).toEqual('GRE');
    });

    test('called with "here" and "http" and country must return here geocoder with  country', () => {
      const geocoder = getGeocoder('here', {
        appId: 'APP_ID',
        appCode: 'APP_CODE',
        country: 'FR'
      });

      const adapter = geocoder._adapter;

      expect(adapter).toBeInstanceOf(HereGeocoder);
      expect(adapter.httpAdapter).toBeInstanceOf(FetchAdapter);
      expect(adapter.options.country).toEqual('FR');
    });

    test('called with "here" and "http" and state must return here geocoder with state', () => {
      const geocoder = getGeocoder('here', {
        appId: 'APP_ID',
        appCode: 'APP_CODE',
        state: 'Île-de-France'
      });

      const adapter = geocoder._adapter;

      expect(adapter).toBeInstanceOf(HereGeocoder);
      expect(adapter.httpAdapter).toBeInstanceOf(FetchAdapter);
      expect(adapter.options.state).toEqual('Île-de-France');
    });

    test('called with "here" and "http" and "gpx" must return here geocoder with gpx formatter', () => {
      const geocoder = getGeocoder('here', {
        appId: 'APP_ID',
        appCode: 'APP_CODE',
        formatter: 'gpx'
      });

      const adapter = geocoder._adapter;
      const formatter = geocoder._formatter!;

      expect(adapter).toBeInstanceOf(HereGeocoder);
      expect(adapter.httpAdapter).toBeInstanceOf(FetchAdapter);
      expect(formatter).toBeInstanceOf(GpxFormatter);
    });

    test('called with "here" and "http" and "string" must return here geocoder with string formatter', () => {
      const geocoder = getGeocoder('here', {
        appId: 'APP_ID',
        appCode: 'APP_CODE',
        formatter: 'string',
        formatterOptions: {
          pattern: 'PATTERN'
        }
      });

      const adapter = geocoder._adapter;
      const formatter = geocoder._formatter!;

      expect(adapter).toBeInstanceOf(HereGeocoder);
      expect(adapter.httpAdapter).toBeInstanceOf(FetchAdapter);
      expect(formatter).toBeInstanceOf(StringFormatter);
    });

    test('called with "datasciencetoolkit" and "http" must return datasciencetoolkit geocoder', () => {
      const geocoder = getGeocoder('datasciencetoolkit');

      const adapter = geocoder._adapter;

      expect(adapter).toBeInstanceOf(DataScienceToolkitProvider);
      expect(adapter.httpAdapter).toBeInstanceOf(FetchAdapter);
    });

    test('called with "datasciencetoolkit" "http" and "host" option must return datasciencetoolkit geocoder with host extra', () => {
      const geocoder = getGeocoder('datasciencetoolkit', {
        host: 'raoul.io'
      });

      const adapter = geocoder._adapter;

      expect(adapter).toBeInstanceOf(DataScienceToolkitProvider);
      expect(adapter.httpAdapter).toBeInstanceOf(FetchAdapter);
      expect(adapter.options.host).toEqual('raoul.io');
    });

    test('called with "openstreetmap" and "http" must return openstreetmap geocoder with adapter', () => {
      const geocoder = getGeocoder('openstreetmap');

      const adapter = geocoder._adapter;

      expect(adapter).toBeInstanceOf(OpenStreetMapProvider);
      expect(adapter.httpAdapter).toBeInstanceOf(FetchAdapter);
    });

    test('called with "locationiq" and "http" must return locationiq geocoder with adapter', () => {
      const geocoder = getGeocoder('locationiq', {
        apiKey: 'API_KEY'
      });

      const adapter = geocoder._adapter;

      expect(adapter).toBeInstanceOf(LocationIQGeocoder);
      expect(adapter.httpAdapter).toBeInstanceOf(FetchAdapter);
    });

    test('called with "zaertyazeaze" must throw an error', () => {
      expect(() => {
        getGeocoder('zaertyazeaze' as unknown as Provider);
      }).toThrow('No geocoder provider found for: zaertyazeaze');
    });

    test('called with "google", "https" and extra timeout must return google geocoder with http adapter and timeout', () => {
      const timeout = 5 * 1000;
      const geocoder = getGeocoder('google', {
        clientId: 'CLIENT_ID',
        apiKey: 'API_KEY',
        timeout: timeout
      });

      const adapter = geocoder._adapter;

      expect(adapter).toBeInstanceOf(GoogleGeocoder);
      expect(adapter.httpAdapter.options.timeout!).toEqual(timeout);
      expect(adapter.httpAdapter).toBeInstanceOf(FetchAdapter);
    });

    test('called with "pickpoint" and API key must return pickpoint geocoder with fetch adapter', () => {
      const geocoder = getGeocoder('pickpoint', {
        apiKey: 'API_KEY'
      });

      const adapter = geocoder._adapter;

      expect(adapter).toBeInstanceOf(PickPointGeocoder);
      expect(adapter.httpAdapter).toBeInstanceOf(FetchAdapter);
    });
  });
});
