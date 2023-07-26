# Node Geocoder TS

<!-- [![Build Status](https://img.shields.io/travis/nchaulet/node-geocoder.svg?style=flat-square)](https://travis-ci.org/nchaulet/node-geocoder) -->
<!-- ![Dependency status](https://img.shields.io/david/nchaulet/node-geocoder.svg?style=flat-square) -->
<!-- [![npm version](https://img.shields.io/npm/v/node-geocoder.svg?style=flat-square)](https://www.npmjs.com/package/node-geocoder) -->

Node library for geocoding and reverse geocoding.

This is based on the original [node-geocoder](https://github.com/nchaulet/node-geocoder) library and is fully rewritten in TypeScript. The API is not fully backwards compatible with the JS version.

There have been, and will be a few major changes.

- [x] Fully re-written in TypeScipt
- [x] Restructured project
- [x] Callbacks have been removed in favor of promises
- [x] Here provider has been updated with a `version` option (defaults to v7)
- [x] Sinon and Chai were removed as dependencies in favor of Just Jest™
- [x] add `options.formatterOptions` to be passed to whatever `options.formatter` is provided
- [ ] Potentially create general option shape that can map to all provider options
- [ ] Update `reverse()` params to use `longitude` & `latitude` instead of `lon`/`lat`
- [ ] Remove instaces of `_reverse()` in favor of `reverse()`
- [ ] Create provider-specific option types for each `geocode` and `reverse` method
- [ ] Create integration tests for every provider
- [ ] Update APIs (ie SmartyStreets is now Smarty and has a different endpoint)
- [ ] Add reverse geocoding to TomTom provider
- [ ] Add reverse geocoding to Yandex provider
- [ ] Add [RapidAPI](https://rapidapi.com/GeocodeSupport/api/forward-reverse-geocoding)
- [ ] Add [Maps.co](https://geocode.maps.co/)
- [ ] Add [Geonames](http://www.geonames.org/export/geocode.html)
- [ ] Migrate NominatimMapQuestProvider to Nominatim (with `mapquest` and `osm` server options)


## Installation (nodejs library)

    npm install node-geocoder

## Usage example

```javascript
const createGeocoder = require('node-geocoder-ts');
const geocoder = createGeocoder({
  provider: 'google',

  // Optional depending on the providers
  fetch: customFetchImplementation,
  apiKey: 'YOUR_API_KEY', // for Mapquest, OpenCage, Google Premier
  formatter: null // 'gpx', 'string', ...
});

// Using callback
const res = await geocoder.geocode('29 champs elysée paris');

// output :
[
  {
    latitude: 48.8698679,
    longitude: 2.3072976,
    country: 'France',
    countryCode: 'FR',
    city: 'Paris',
    zipcode: '75008',
    streetName: 'Champs-Élysées',
    streetNumber: '29',
    administrativeLevels: {
      level1long: 'Île-de-France',
      level1short: 'IDF',
      level2long: 'Paris',
      level2short: '75'
    },
    provider: 'google'
  }
];
```

## Advanced usage (only google, here, mapquest, locationiq, and opencage providers)

```javascript
const result = await geocoder.geocode({
  address: '29 champs elysée',
  country: 'France',
  zipcode: '75008'
});

// OpenCage advanced usage example
const result = await geocoder.geocode({
  address: '29 champs elysée',
  countryCode: 'fr',
  minConfidence: 0.5,
  limit: 5
});

// Reverse example

const result = await geocoder.reverse({ lat: 45.767, lon: 4.833 });

// Batch geocode

const batchResult = await geocoder.batchGeocode([
  '13 rue sainte catherine',
  'another address'
]);

// Set specific http request headers:
const nodeFetch = require('node-fetch');

const geocoder = createGeocoder({
  provider: 'google',
  fetch: function fetch(url, options) {
    return nodeFetch(url, {
      ...options,
      headers: {
        'user-agent': 'My application <email@domain.com>',
        'X-Specific-Header': 'Specific value'
      }
    });
  }
});
```

## Geocoder Providers (in alphabetical order)
Service | Provider | Forward Geocoding | Reverse Geocoding | Authentication
-|-|-|-|-
[ArcGis](https://developers.arcgis.com/documentation/mapping-apis-and-services/geocoding/) | `agol` | ✅ | ✅ |  `clientId`, `clientSecret`
[Data Science Toolkit](http://dstk.britecorepro.com/) | `datasciencetoolkit` | ✅ | ✅ |
[FreeGeoIP.net](https://geocoder.readthedocs.io/providers/FreeGeoIP.html) | `freegeoip` | ✅ (IP only)|  |
[Geocodio](https://www.geocod.io/) | `geocodio` | ✅ (US & CA) | ✅ (US & CA) |
[Google](https://developers.google.com/maps/documentation/geocoding) | `google` | ✅ | ✅ | `apiKey`
[Here](https://developer.here.com/documentation/geocoding-search-api/dev_guide/topics/endpoint-geocode-brief.html) | `here` | ✅ | ✅ | `apiKey`
[LocationIQ](https://locationiq.com/docs#forward_usage) | `locationiq` | ✅ | ✅ | `apiKey`
[Mapbox](https://docs.mapbox.com/api/search/geocoding/) | `mapbox` | ✅ | ✅ | `apiKey`
[MapQuest](https://developer.mapquest.com/documentation/geocoding-api/) | `mapquest` | ✅ | ✅ | `apiKey`
[OpenCage](https://opencagedata.com/api#quickstart) | `opencage` | ✅ | ✅ | `apiKey`
[OpenDataFrance](https://adresse.data.gouv.fr/api/) | `opendatafrance` | ✅ | ✅ | `apiKey`
[OpenStreetMap] | `openstreetmap` | ✅ | ✅ |
[PickPoint](https://docs.pickpoint.io/openapi/reference/v2/overview/) | `pickpoint` | ✅ | ✅ | `apiKey`
[Smarty](https://www.smarty.com/products/single-address#demo) | `smartystreets` | ✅ | |  `authId`, `authToken`
[Teleport](https://developers.teleport.org/api/reference/) | `teleport` | ✅ | ✅ |
[TomTom](https://developer.tomtom.com/geocoding-api/documentation/geocode) | `tomtom` | ✅ |  | `apiKey`
[VirtualEarth](https://learn.microsoft.com/en-us/bingmaps/rest-services/locations/find-a-location-by-address) | `virtualearth` | ✅ | ✅ | `apiKey`
[Yandex](https://yandex.com/dev/geocode/doc/en/) | `yandex` | ✅ |  | `apiKey`

<!-- - `nominatimmapquest`: Same geocoder as `openstreetmap`, but queries the MapQuest servers. You need to specify `options.apiKey` -->
<!-- - `openmapquest` : Open MapQuestGeocoder (based on OpenStreetMapProvider). Supports address geocoding and reverse geocoding. Needs an apiKey -->

## Fetch option

With the `options.fetch` you can provide your own method to fetch data. This method should be compatible with the [Fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API).

This allow you to specify a proxy to use, a custom timeout, specific headers, ...

## Formatter

- `gpx` : format result using GPX format
- `string` : format result to an String array (you need to specify `options.formatterPattern` key)
  - `%P` country
  - `%p` country code
  - `%n` street number
  - `%S` street name
  - `%z` zip code
  - `%T` State
  - `%t` state code
  - `%c` City

### Extending node geocoder

You can add new geocoders by implementing the two methods `geocode` and `reverse`:

```javascript
const geocoder = {
    geocode: function(value, callback) { ... },
    reverse: function(query, callback) { var lat = query.lat; var lon = query.lon; ... }
}
```

You can also add formatter implementing the following interface

```javascript
const formatter = {
  format: function(data) {
    return formattedData;
  }
};
```

### Contributing

You can improve this project by adding new geocoders.

To run tests just `npm test`.

To check code style just run `npm run lint`.
