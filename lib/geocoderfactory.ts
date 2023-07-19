import Helper from './helper';
import Geocoder from './geocoder';

import FetchAdapter from './httpadapter/fetchadapter';
import GoogleGeocoder from './geocoder/googlegeocoder';
import HereGeocoder from './geocoder/heregeocoder';
import AGOLGeocoder from './geocoder/agolgeocoder';
import FreegeoipGeocoder from './geocoder/freegeoipgeocoder';
import DataScienceToolkitGeocoder from './geocoder/datasciencetoolkitgeocoder';
import OpenStreetMapGeocoder from './geocoder/openstreetmapgeocoder';
import PickPointGeocoder from './geocoder/pickpointgeocoder';
import LocationIQGeocoder from './geocoder/locationiqgeocoder';
import MapQuestGeocoder from './geocoder/mapquestgeocoder';
import MapzenGeocoder from './geocoder/mapzengeocoder';
import OpenMapQuestGeocoder from './geocoder/openmapquestgeocoder';
import YandexGeocoder from './geocoder/yandexgeocoder';
import GeocodioGeocoder from './geocoder/geocodiogeocoder';
import OpenCageGeocoder from './geocoder/opencagegeocoder';
import NominatimMapquestGeocoder from './geocoder/nominatimmapquestgeocoder';
import TomTomGeocoder from './geocoder/tomtomgeocoder';
import VirtualEarthGeocoder from './geocoder/virtualearth';
import SmartyStreets from './geocoder/smartystreetsgeocoder';
import TeleportGeocoder from './geocoder/teleportgeocoder';
import OpendataFranceGeocoder from './geocoder/opendatafrancegeocoder';
import MapBoxGeocoder from './geocoder/mapboxgeocoder';

/**
 * Geocoder Facotry
 */
const GeocoderFactory = {
  /**
   * Return an http adapter by name
   * @param  <string> adapterName adapter name
   * @return <object>
   */
  _getHttpAdapter: function (adapterName: any, options: any) {
    if (adapterName === 'fetch') {
      return new FetchAdapter(options);
    }
  },
  /**
   * Return a geocoder adapter by name
   * @param  <string> adapterName adapter name
   * @return <object>
   */
  _getGeocoder: function (geocoderName: any, adapter: any, extra: any) {
    if (geocoderName === 'google') {
      return new GoogleGeocoder(adapter, {
        clientId: extra.clientId,
        apiKey: extra.apiKey,
        language: extra.language,
        region: extra.region,
        excludePartialMatches: extra.excludePartialMatches,
        channel: extra.channel
      });
    }
    if (geocoderName === 'here') {
      return new HereGeocoder(adapter, {
        apiKey: extra.apiKey,
        appId: extra.appId,
        appCode: extra.appCode,
        language: extra.language,
        politicalView: extra.politicalView,
        country: extra.country,
        state: extra.state,
        production: extra.production,
        limit: extra.limit
      });
    }
    if (geocoderName === 'agol') {
      return new AGOLGeocoder(adapter, {
        client_id: extra.client_id,
        client_secret: extra.client_secret
      });
    }
    if (geocoderName === 'freegeoip') {
      return new FreegeoipGeocoder(adapter);
    }
    if (geocoderName === 'datasciencetoolkit') {
      return new DataScienceToolkitGeocoder(adapter, { host: extra.host });
    }
    if (geocoderName === 'openstreetmap') {
      return new OpenStreetMapGeocoder(adapter, {
        language: extra.language,
        osmServer: extra.osmServer
      });
    }
    if (geocoderName === 'pickpoint') {
      return new PickPointGeocoder(adapter, {
        language: extra.language,
        apiKey: extra.apiKey
      });
    }
    if (geocoderName === 'locationiq') {
      return new LocationIQGeocoder(adapter, extra.apiKey);
    }
    if (geocoderName === 'mapquest') {
      return new MapQuestGeocoder(adapter, extra.apiKey);
    }
    if (geocoderName === 'mapzen') {
      return new MapzenGeocoder(adapter, extra.apiKey);
    }
    if (geocoderName === 'openmapquest') {
      return new OpenMapQuestGeocoder(adapter, extra.apiKey);
    }
    if (geocoderName === 'yandex') {
      return new YandexGeocoder(adapter, {
        apiKey: extra.apiKey,
        language: extra.language,
        results: extra.results,
        skip: extra.skip,
        kind: extra.kind,
        bbox: extra.bbox,
        rspn: extra.rspn
      });
    }
    if (geocoderName === 'geocodio') {
      return new GeocodioGeocoder(adapter, extra.apiKey);
    }
    if (geocoderName === 'opencage') {
      return new OpenCageGeocoder(adapter, extra.apiKey, extra);
    }
    if (geocoderName === 'nominatimmapquest') {
      return new NominatimMapquestGeocoder(adapter, {
        language: extra.language,
        apiKey: extra.apiKey
      });
    }
    if (geocoderName === 'tomtom') {
      return new TomTomGeocoder(adapter, {
        apiKey: extra.apiKey,
        country: extra.country,
        limit: extra.limit
      });
    }
    if (geocoderName === 'virtualearth') {
      return new VirtualEarthGeocoder(adapter, { apiKey: extra.apiKey });
    }
    if (geocoderName === 'smartystreets') {
      return new SmartyStreets(adapter, extra.auth_id, extra.auth_token);
    }
    if (geocoderName === 'teleport') {
      return new TeleportGeocoder(adapter, extra.apiKey, extra);
    }
    if (geocoderName === 'opendatafrance') {
      return new OpendataFranceGeocoder(adapter);
    }
    if (geocoderName === 'mapbox') {
      return new MapBoxGeocoder(adapter, extra);
    }
    throw new Error('No geocoder provider find for : ' + geocoderName);
  },
  /**
   * Return an formatter adapter by name
   * @param  <string> adapterName adapter name
   * @return <object>
   */
  _getFormatter: function (formatterName: any, extra: any) {
    if (formatterName === 'gpx') {
      var GpxFormatter = require('./formatter/gpxformatter.js');

      return new GpxFormatter();
    }

    if (formatterName === 'string') {
      var StringFormatter = require('./formatter/stringformatter.js');

      return new StringFormatter(extra.formatterPattern);
    }
  },
  /**
   * Return a geocoder
   * @param  <string|object> geocoderAdapter Geocoder adapter name or adapter object
   * @param  <array>         extra           Extra parameters array
   * @return <object>
   */
  getGeocoder: function (geocoderAdapter: any, extra: any) {
    if (typeof geocoderAdapter === 'object') {
      extra = geocoderAdapter;
      geocoderAdapter = null;
    }

    if (!extra) {
      extra = {};
    }

    if (extra.provider) {
      geocoderAdapter = extra.provider;
    }

    if (!geocoderAdapter) {
      geocoderAdapter = 'google';
    }

    const httpAdapter = this._getHttpAdapter('fetch', extra);

    if (Helper.isString(geocoderAdapter)) {
      geocoderAdapter = this._getGeocoder(geocoderAdapter, httpAdapter, extra);
    }

    var formatter = extra.formatter;

    if (Helper.isString(formatter)) {
      formatter = this._getFormatter(formatter, extra);
    }

    return new Geocoder(geocoderAdapter, formatter);
  }
};

export default GeocoderFactory;
