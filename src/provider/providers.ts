export const providers = [
  'agol',
  'freegeoip',
  'datasciencetoolkit',
  'geocodio',
  'google',
  'here',
  'locationiq',
  'mapbox',
  'mapquest',
  'mapzen',
  'nominatimmapquest',
  'opencage',
  'opendatafrance',
  'openmapquest',
  'openstreetmap',
  'pickpoint',
  'smartystreets',
  'teleport',
  'tomtom',
  'virtualearth',
  'yandex'
] as const;

export type Provider = (typeof providers)[number];
