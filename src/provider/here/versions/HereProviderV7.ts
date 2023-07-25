import ValueError from 'src/utils/error/ValueError';
import BaseAbstractProviderAdapter from '../../BaseAbstractProviderAdapter';
import type {
  HTTPAdapter,
  BaseAdapterOptions,
  ReverseQuery,
  GeocodeQuery,
  ResultData,
  Result
} from 'src/types';
import ResultError from 'src/utils/error/ResultError';

export interface Options extends BaseAdapterOptions {
  provider: 'here';
  apiKey?: string;
}

export type HereV7HeaderParams = {
  /**
   * Used to correlate requests with their responses within a customer's application, for logging and error reporting.

Format: Free string, but a valid UUIDv4 is recommended.
   */
  XRequestId: string;
};

export type HereV7ReverseGeocodeQuery = ReverseQuery & {
  /**
   * Example: 42
BETA Takes the "bearing" into account for matching nearby street results.

Bearing expresses the direction in which an asset is heading in degrees starting at true north and continuing clockwise around the compass.North is 0 degrees, east is 90 degrees, south is 180 degrees, west is 270 degrees.Values are expected to be of type Integer.

When this parameter is provided, all results will be of type street.It is not necessary to provide types = street explicitly.

The following constraints apply:

If a types parameter is provided, the only accepted value is types = street.
   */
  bearing?: number;

  /**
   * Search within a geographic area. This is a hard filter. Results will be returned if they are located within the specified area.
   */
  radius?: number;

  /**
   * Default: 1
Maximum number of results to be returned.
   */
  limit?: number;

  /**
   * Items Enum:"address" "area" "city" "street"
Limit the result items to the specified types.

Provide one of the supported values or a comma separated list.

The following constraints apply:

If a bearing parameter is provided, the types parameter will accept types=street only.
Description of supported values:

address: restricting results to result types houseNumber, street, postalCodePoint, or addressBlock. Result type "intersection" is excluded from this list because it is not supported in reverse geocoder.
area: restricting results to result types locality or administrativeArea including all the sub-types
city: restricting results to result type locality and locality type city
street: restricting results to result type street
   */
  types?: string[];

  /**
   * Items Value: "unnamedStreets"
ALPHA Consider certain kinds of results, that would not be provided by default.
Description of supported values:

ALPHA unnamedStreets: Enables the retrieval of unnamed street results.
   */
  with?: string[];

  /**
   * Select the language to be used for result rendering from a list of BCP 47 compliant language codes.
   */
  lang?: string[];

  /**
   * Toggle the political view.

This parameter accepts a single ISO 3166-1 alpha-3 country code in all uppercase.

If a valid 3-letter country code is provided for which GS7 does not have a dedicated political view, it will fallback to the default view.

If an invalid value is provided for the politicalView parameter, GS7 will respond with a "400" error code.

The following political views are currently supported:

ARG: Argentina's view on the Southern Patagonian Ice Field and Tierra Del Fuego, including the Falkland Islands, South Georgia, and South Sandwich Islands
EGY: Egypt's view on Bir Tawil
IND: India's view on Gilgit-Baltistan
KEN: Kenya's view on the Ilemi Triangle
MAR: Morocco's view on Western Sahara
PAK: Pakistan's view on Jammu and Kashmir and the Junagadh Area
RUS: Russia's view on Crimea
SDN: Sudan's view on the Halaib Triangle
SRB: Serbia's view on Kosovo, Vukovar, and Sarengrad Islands
SUR: Suriname's view on the Courantyne Headwaters and Lawa Headwaters
SYR: Syria's view on the Golan Heights
TUR: Turkey's view on Cyprus and Northern Cyprus
TZA: Tanzania's view on Lake Malawi
URY: Uruguay's view on Rincon de Artigas
VNM: Vietnam's view on the Paracel Islands and Spratly Islands
   */
  politicalView?: string;

  /**
   * Items Enum: "countryInfo" "streetInfo" "tz"
Select additional fields to be rendered in the response.Please note that some of the fields involve additional webservice calls and can increase the overall response time.
The value is a comma - separated list of the sections to be enabled.For some sections there is a long and a short ID.

Description of supported values:
countryInfo: For each result item renders additional block with the country info, such as ISO 3166 - 1 alpha - 2 and ISO 3166 - 1 alpha - 3 country code.
  streetInfo: For each result item renders additional block with the street name decomposed into its parts like the base name, the street type, etc.
    tz: Renders result items with additional time zone information.
   */
  show?: string[];

  headerParams: HereV7HeaderParams;
};

export type HereV7GeocodeQuery = GeocodeQuery & {
  /**
 * Specify the center of the search context expressed as coordinates.

Format: {latitude},{longitude}

Type: {decimal},{decimal}

Example: -13.163068,-72.545128 (Machu Picchu Mountain, Peru)
 */
  at?: string;

  /**
   * Search within a geographic area. This is a hard filter. Results will be returned if they are located within the specified area.

A geographic area can be

a country (or multiple countries), provided as comma-separated ISO 3166-1 alpha-3 country codes

The country codes are to be provided in all uppercase.

Format: countryCode:{countryCode}[,{countryCode}]*

Examples:

countryCode:USA
countryCode:CAN,MEX,USA
   */
  in?: string;

  /**
   * Default: 20
Maximum number of results to be returned.
   */
  limit?: number;

  /**
   * Example: "Invalidenstraße 116 Berlin"
Enter a free-text query

Examples:

125, Berliner, berlin
Beacon, Boston, Hospital
Schnurrbart German Pub and Restaurant, Hong Kong
Note: Either q or qq-parameter is required on this endpoint. Both parameters can be provided in the same request.
   */
  q?: string;

  /**
   * Enter a qualified query. A qualified query is similar to a free-text query, but in a structured manner. It can take multiple sub-parameters, separated by semicolon, allowing to specify different aspects of a query.

Currently supported sub-parameters are country, state, county, city, district, street, houseNumber, and postalCode.

Format: {sub-parameter}={string}[;{sub-parameter}={string}]*

Examples:

city=Berlin;country=Germany;street=Friedrichstr;houseNumber=20
city=Berlin;country=Germany
postalCode=10969
Note: Either q or qq-parameter is required on this endpoint. Both parameters can be provided in the same request.
   */
  qq?: string;

  /**
   * Items Enum:"address" "area" "city" "houseNumber" "postalCode" "street"
BETA A comma-separated list of the types that should be included in the response.

If this parameter is not set, all types are considered for the response.

Description of supported values:

BETA address: restricting results to result types houseNumber, street, postalCodePoint, intersection, or addressBlock
BETA area: restricting results to result types locality or administrativeArea including all the sub-types
BETA city: restricting results to result type locality and locality type city
BETA houseNumber: restricting results to result type: houseNumber, including house number types PA (Point Address) and interpolated, including exact house number matches and house number fallbacks
BETA postalCode: restricting results to postal codes: either result type postalCodePoint or result type locality with locality type postalCode.

Note that in Ireland and Singapore, where each address has unique postal code, postalCodePoint results are replaced by houseNumber results.

BETA street: restricting results to result type street
   */
  types?: string[];

  /**
   * Select the language to be used for result rendering from a list of BCP 47 compliant language codes.
   */
  lang?: string[];

  /**
   * Toggle the political view.

This parameter accepts a single ISO 3166-1 alpha-3 country code in all uppercase.

If a valid 3-letter country code is provided for which GS7 does not have a dedicated political view, it will fallback to the default view.

If an invalid value is provided for the politicalView parameter, GS7 will respond with a "400" error code.

The following political views are currently supported:

ARG: Argentina's view on the Southern Patagonian Ice Field and Tierra Del Fuego, including the Falkland Islands, South Georgia, and South Sandwich Islands
EGY: Egypt's view on Bir Tawil
IND: India's view on Gilgit-Baltistan
KEN: Kenya's view on the Ilemi Triangle
MAR: Morocco's view on Western Sahara
PAK: Pakistan's view on Jammu and Kashmir and the Junagadh Area
RUS: Russia's view on Crimea
SDN: Sudan's view on the Halaib Triangle
SRB: Serbia's view on Kosovo, Vukovar, and Sarengrad Islands
SUR: Suriname's view on the Courantyne Headwaters and Lawa Headwaters
SYR: Syria's view on the Golan Heights
TUR: Turkey's view on Cyprus and Northern Cyprus
TZA: Tanzania's view on Lake Malawi
URY: Uruguay's view on Rincon de Artigas
VNM: Vietnam's view on the Paracel Islands and Spratly Islands
   */
  politicalView?: string;

  /**
   * tems Enum:"countryInfo" "parsing" "streetInfo" "tz"
Select additional fields to be rendered in the response. Please note that some of the fields involve additional webservice calls and can increase the overall response time.

The value is a comma-separated list of the sections to be enabled. For some sections there is a long and a short ID.

Description of supported values:

countryInfo: For each result item renders additional block with the country info, such as ISO 3166-1 alpha-2 and ISO 3166-1 alpha-3 country code.
parsing
streetInfo: For each result item renders additional block with the street name decomposed into its parts like the base name, the street type, etc.
tz: Renders result items with additional time zone information.
   */
  show?: string[];

  headerParams: HereV7HeaderParams;
};

export type HereV7FieldScore = {
  /**
   * Indicates how good the result country name or[ISO 3166 - 1 alpha - 3] country code matches to the freeform or qualified input.
   */
  country?: number;

  /**
   * Indicates how good the result[ISO 3166 - 1 alpha - 3] country code matches to the freeform or qualified input.
   */
  countryCode?: number;

  /**
   * Indicates how good the result state name matches to the freeform or qualified input.
   */
  state?: number;

  /**
   * Indicates how good the result state code matches to the freeform or qualified input.
   */
  stateCode?: number;

  /**
   * Indicates how good the result county name matches to the freeform or qualified input.
   */
  county?: number;

  /**
   * Indicates how good the result county code matches to the freeform or qualified input.
   */
  countyCode?: number;

  /**
   * Indicates how good the result city name matches to the freeform or qualified input.
   */
  city?: number;

  /**
   * Indicates how good the result district name matches to the freeform or qualified input.
   */
  district?: number;

  /**
   * Indicates how good the result sub - district name matches to the freeform or qualified input.
   */
  subdistrict?: number;

  /**
   * Indicates how good the result street names match to the freeform or qualified input.If the input contains multiple street names, the field score is calculated and returned for each of them individually.
   */
  streets?: number[];

  /**
   * Indicates how good the result block name matches to the freeform or qualified input.
   */
  block?: number;

  /**
   * Indicates how good the result sub - block name matches to the freeform or qualified input.
   */
  subblock?: number;

  /**
   * Indicates how good the result house number matches to the freeform or qualified input.It may happen, that the house number, which one is looking for, is not yet in the map data.For such cases, the / geocode returns the nearest known house number on the same street.This represents the numeric difference between the requested and the returned house numbers.
   */
  houseNumber?: number;

  /**
   *
Indicates how good the result postal code matches to the freeform or qualified input.
   */
  postalCode?: number;

  /**
   * Indicates how good the result building name matches to the freeform or qualified input.
   */
  building?: number;

  /**
   * Indicates how good the result unit(such as a micro point address) matches to the freeform or qualified input.
   */
  unit: number;

  /**
   * Indicates how good the result place name matches to the freeform or qualified input.
   */
  placeName: number;

  /**
   * Indicates how good the result ontology name matches to the freeform or qualified input.
   */
  ontologyName: number;
};

export type HereV7ParsingMatch = {
  /**
   * First index of the matched range(0 - based indexing, inclusive)
   */
  start: number;

  /**
   * One past the last index of the matched range(0 - based indexing, exclusive); The difference between end and start gives the length of the term
   */
  end: number;

  /**
   * Matched term in the input string
   */
  value: string;

  /**
   * Enum: "country" "state" "county" "city" "district" "street" "houseNumber" "postalCode"
The matched qualified query field type.If this is not returned, then matched value refers to the freetext query
   */
  qq?: string;
};

export type HereV7Parsing = {
  /**
   * Place name matches
   */
  placeName?: HereV7ParsingMatch[];

  /**
   * Country matches
   */
  country?: HereV7ParsingMatch[];
  /**
   * State matches
   */
  state?: HereV7ParsingMatch[];

  /**
   * County matches
   */
  county?: HereV7ParsingMatch[];

  /**
   * City matches
   */
  city?: HereV7ParsingMatch[];

  /**
   * District matches
   */
  district?: HereV7ParsingMatch[];

  /**
   * Subdistrict matches
   */
  subdistrict?: HereV7ParsingMatch[];

  /**
   * Street matches
   */
  street?: HereV7ParsingMatch[];

  /**
   * Block matches
   */
  block?: HereV7ParsingMatch[];

  /**
   * Subblock matches
   */
  subblock?: HereV7ParsingMatch[];

  /**
   * HouseNumber matches
   */
  houseNumber?: HereV7ParsingMatch[];

  /**
   * PostalCode matches
   */
  postalCode?: HereV7ParsingMatch[];

  /**
   * Building matches
   */
  building?: HereV7ParsingMatch[];

  /**
   * secondaryUnits matches
   */
  secondaryUnits?: HereV7ParsingMatch[];

  /**
   * Ontology name matches
   */
  ontologyName?: HereV7ParsingMatch[];
};

export type HereV7CountryInfo = {
  /**
   * ISO 3166 - 1 alpha - 2 country code
   */
  alpha2: string;

  /**
   * ISO 3166 - 1 alpha - 3 country code
   */
  alpha3: string;
};

export type HereV7StreetDetail = {
  /**
   * Base name part of the street name.
   */
  baseName?: string;

  /**
   * Street type part of the street name.
   */
  streetType?: string;

  /**
   * Defines if the street type is before or after the base name.
   */
  streetTypePrecedes?: boolean;

  /**
   * Defines if the street type is attached or unattached to the base name.
   */
  streetTypeAttached?: boolean;

  /**
   * A prefix is a directional identifier that precedes, but is not included in, the base name of a road.
   */
  prefix?: string;

  /**
   * A suffix is a directional identifier that follows, but is not included in, the base name of a road.
   */
  suffix?: string;

  /**
   * Indicates the official directional identifiers assigned to highways, typically either "North/South" or "East/West"
   */
  direction?: string;

  /**
   * BCP 47 compliant language code
   */
  language?: string;
};

export type HereV7Scoring = {
  /**
   * Indicates how good the input matches the returned address.It is equal to 1 if all input tokens are recognized and matched.
   */
  queryScore?: number;

  /**
   * Indicates how good the individual result fields match to the corresponding part of the query.Is included only for the result fields that are actually matched to the query.
   */
  fieldScore?: HereV7FieldScore;
};

export type HereV7Timezone = {
  /**
   * The name of the time zone as defined in the tz database.For example: "Europe/Berlin"
   */
  name: string;

  /**
   * The UTC offset for this time zone at request time.For example "+02:00"
   */
  utcOffset: string;
};

export type HereV7FoodType = {
  /**
   * Identifier number for an associated category. For example: "900-9300-0000"
   */
  id: string;

  /**
   * Name of the place category in the result item language.
   */
  name?: string;

  /**
   * Whether or not it is a primary category. This field is visible only when the value is 'true'.
   */
  primary?: boolean;
};

export type HereV7Category = {
  /**
   * Identifier number for an associated category.For example: "900-9300-0000"
   */
  id: string;

  /**
   * Name of the place category in the result item language.
   */
  name?: string;

  /**
   * Whether or not it is a primary category.This field is visible only when the value is 'true'.
   */
  primary?: boolean;
};

export type HereV7BoundingBox = {
  /**
   * Longitude of the western - side of the box.For example: "8.80068"
   */
  west: number;

  /**
   * Latitude of the southern - side of the box.For example: "52.19333"
   */
  south: number;

  /**
   * Longitude of the eastern - side of the box.For example: "8.8167"
   */
  east: number;

  /**
   * Latitude of the northern - side of the box.For example: "52.19555"
   */
  north: number;
};

export type HereV7LatLng = {
  /**
   * Latitude of the address.For example: "52.19404"
   */
  lat: number;

  /**
   * Longitude of the address.For example: "8.80135"
   */
  lng: number;
};

export type HereV7Address = {
  /**
   * Assembled address value built out of the address components according to the regional postal rules.These are the same rules for all endpoints.It may not include all the input terms.For example: "Schulstraße 4, 32547 Bad Oeynhausen, Germany"
   */
  label?: string;

  /**
   * A three - letter country code.For example: "DEU"
   */
  countryCode?: string;

  /**
   * The localised country name.For example: "Deutschland"
   */
  countryName?: string;

  /**
   * A state code or state name abbreviation – country specific.For example, in the United States it is the two letter state abbreviation: "CA" for California.
   */
  stateCode?: string;

  /**
   * The state division of a country.For example: "North Rhine-Westphalia"
   */
  state?: string;

  /**
   * A county code or county name abbreviation – country specific.For example, for Italy it is the province abbreviation: "RM" for Rome.
   */
  countyCode?: string;

  /**
   * A division of a state; typically, a secondary - level administrative division of a country or equivalent.
   */
  county?: string;

  /**
   * The name of the primary locality of the place.For example: "Bad Oyenhausen"
   */
  city?: string;

  /**
   *
  A division of city; typically an administrative unit within a larger city or a customary name of a city's neighborhood. For example: "Bad Oyenhausen"
  */
  district?: string;

  /**
   * A subdivision of a district.For example: "Minden-Lübbecke"
   */
  subdistrict?: string;

  /**
   * Name of street.For example: "Schulstrasse"
   */
  street?: string;

  /**
   * Names of streets in case of intersection result.For example: ["Friedrichstraße", "Unter den Linden"]
   */
  streets?: string[];

  /**
   * Name of block.
   */
  block?: string;

  /**
   * Name of sub - block.
   */
  subblock?: string;

  /**
   * An alphanumeric string included in a postal address to facilitate mail sorting, such as post code, postcode, or ZIP code.For example: "32547"
   */
  postalCode?: string;

  /**
   * House number.For example: "4"
   */
  houseNumber?: string;

  /**
   * Name of building.
   */
  building?: string;
};

export type HereV7GeocodeResponseItem = {
  /**
   * The localized display name of this result item.
   */
  title: string;

  /**
   * The unique identifier for the result item.This ID can be used for a Look Up by ID search as well.
   */
  id: string;

  /**
   * ISO3 country code of the item political view(default for international).This response element is populated when the politicalView parameter is set in the query
   */
  politicalView?: string;

  /**
   * Enum: "administrativeArea" "locality" "street" "intersection" "addressBlock" "houseNumber" "postalCodePoint" "place"
   */
  resultType?: string;

  /**
   * Enum: "PA" "interpolated"
PA - a Point Address represents an individual address as a point object.Point Addresses are coming from trusted sources.We can say with high certainty that the address exists and at what position.A Point Address result contains two types of coordinates.One is the access point(or navigation coordinates), which is the point to start or end a drive.The other point is the position or display point.This point varies per source and country.The point can be the rooftop point, a point close to the building entry, or a point close to the building, driveway or parking lot that belongs to the building.
  interpolated - an interpolated address.These are approximate positions as a result of a linear interpolation based on address ranges.Address ranges, especially in the USA, are typical per block.For interpolated addresses, we cannot say with confidence that the address exists in reality.But the interpolation provides a good location approximation that brings people in most use cases close to the target location.The access point of an interpolated address result is calculated based on the address range and the road geometry.The position(display) point is pre - configured offset from the street geometry.Compared to Point Addresses, interpolated addresses are less accurate.
   */
  houseNumberType?: string;

  /**
   * Enum: "block" "subblock"
   */
  addressBlockType?: string;

  /**
   * Enum: "postalCode" "subdistrict" "district" "city"
   */
  localityType?: string;

  /**
   * Enum: "county" "state" "country"
   */
  administrativeAreaType?: string;

  /**
   * Postal address of the result item.
   */
  address: HereV7Address;

  /**
   * The coordinates(latitude, longitude) of a pin on a map corresponding to the searched place.
   */
  position?: HereV7LatLng;

  /**
   * Coordinates of the place you are navigating to (for example, driving or walking). This is a point on a road or in a parking lot.
   */
  access?: HereV7LatLng[];

  /**
   * The distance \"as the crow flies\" from the search center to this result item in meters. For example: \"172039\".
   *
   * When searching along a route this is the distance along the route plus the distance from the route polyline to this result item.
   */
  distance?: number;

  /**
   * The bounding box enclosing the geometric shape(area or line) that an individual result covers.place typed results have no mapView.
   */
  mapView?: HereV7BoundingBox;

  /**
   * The list of categories assigned to this place.
   */
  categories?: HereV7Category[];

  /**
   * The list of food types assigned to this place.
   */
  foodTypes?: HereV7FoodType[];

  /**
   * If true, indicates that the requested house number was corrected to match the nearest known house number.This field is visible only when the value is true.
   */
  houseNumberFallback?: boolean;

  /**
   * Provides time zone information for this place. (rendered only if 'show=tz' is provided.)
   */
  timeZone?: HereV7Timezone;

  /**
   * Indicates for each result how good the result matches to the original query.This can be used by the customer application to accept or reject the results depending on how "expensive" is the mistake for their use case
   */
  scoring?: HereV7Scoring;

  /**
   * Parsed terms and their positions in the input query(only rendered if 'show=parsing' is provided.)
   */
  parsing?: HereV7Parsing;

  /**
   * Street Details(only rendered if 'show=streetInfo' is provided.)
   */
  streetInfo?: HereV7StreetDetail[];

  /**
   * Country Details(only rendered if 'show=countryInfo' is provided.)
   */
  countryInfo?: HereV7CountryInfo;
};

export type HereV7GeocodeResponse = {
  /**
   * Array of object
The results are presented as a JSON list of candidates in ranked order(most - likely to least - likely) based on the matched location criteria.
   */
  items: HereV7GeocodeResponseItem[];
};

export type HereV7ErrorResponse = {
  /**
   * The HTTP status code
   */
  status: number;

  /**
   * Human - readable error description
   */
  title: string;

  /**
   * Error code
   */
  code?: string;

  /**
   * Human - readable explanation for the error
   */
  cause?: string;

  /**
   * Human - readable action for the user
   */
  action?: string;

  /**
   * Auto - generated ID univocally identifying this request
   */
  correlationId: string;

  /**
   * Request identifier provided by the user
   */
  requestId: string;
};

class HereProviderV7 extends BaseAbstractProviderAdapter<Options> {
  // Here geocoding API endpoint
  _geocodeEndpoint = 'https://geocode.search.hereapi.com/v1/geocode';

  // Here reverse geocoding API endpoint
  _reverseEndpoint = 'https://revgeocode.search.hereapi.com/v1/revgeocode';

  constructor(
    httpAdapter: HTTPAdapter,
    options: Omit<Options, 'provider'> = {}
  ) {
    super(httpAdapter, { ...options, provider: 'here' } as Options);

    if (!options.apiKey) {
      throw new Error('You must specify apiKey to use Here Geocoder');
    }
  }

  override async _geocode(query: HereV7GeocodeQuery): Promise<Result> {
    const fetchOptions: RequestInit = {};

    let params = this.getBaseRequestParams();
    if (typeof query === 'string') {
      params.q = query;
    } else {
      const { headerParams, ...rest } = query;

      if (headerParams.XRequestId) {
        fetchOptions.headers = {};
        fetchOptions.headers['X-Request-Id'] = headerParams.XRequestId;
      }

      params = {
        ...params,
        ...rest
      };
    }

    const result = await this.httpAdapter.get<
      HereV7GeocodeResponse | HereV7ErrorResponse
    >(this._geocodeEndpoint, params, fetchOptions);

    if (!result) {
      throw new ResultError(this);
    }

    if (isErrorResponse(result)) {
      throw new ValueError(result.title);
    }

    // Format each geocoding result
    const results = result.items.map((data: HereV7GeocodeResponseItem) => {
      return this._formatResult(data);
    });

    return {
      data: results,
      raw: result
    };
  }

  override async _reverse({
    headerParams,
    ...query
  }: HereV7ReverseGeocodeQuery): Promise<Result> {
    const lat = query.lat;
    const lng = query.lon;
    const fetchOptions: RequestInit = {};
    let params = this.getBaseRequestParams();

    if (query.radius) {
      params.in = `circle:${lat},${lng};r=${query.radius}`;
    } else {
      params.at = `${lat},${lng}`;
    }

    if (headerParams.XRequestId) {
      fetchOptions.headers = {};
      fetchOptions.headers['X-Request-Id'] = headerParams.XRequestId;
    }

    params = {
      ...params,
      ...query
    };

    const result = await this.httpAdapter.get<HereV7GeocodeResponse>(
      this._reverseEndpoint,
      params,
      fetchOptions
    );

    if (!result) {
      throw new ResultError(this);
    }

    if (isErrorResponse(result)) {
      throw new ValueError(result.title);
    }

    // Format each geocoding result
    const results = result.items.map((data: HereV7GeocodeResponseItem) => {
      return this._formatResult(data);
    });

    return {
      data: results,
      raw: result
    };
  }

  _formatResult(result: HereV7GeocodeResponseItem): ResultData {
    const address = result.address;
    const extractedObj: ResultData = {
      formattedAddress: address.label,
      latitude: result.position?.lat,
      longitude: result.position?.lng,
      country: address.countryName,
      countryCode: address.countryCode,
      state: address.state,
      county: address.county,
      city: address.city,
      zipcode: address.postalCode,
      district: address.district,
      streetName: address.street,
      streetNumber: address.houseNumber,
      building: address.building,
      extra: {
        hereId: result.id,
        confidence: result.scoring?.queryScore || 0
      }
    };

    return extractedObj;
  }

  private getBaseRequestParams(): Record<string, any> {
    const params: Record<string, any> = {
      apiKey: this.options.apiKey
    };

    return params;
  }

  // override async _batchGeocode(values: GeocodeQuery[]): Promise<BatchResult> {
  //   const jobId = await this.__createJob(values);
  //   await this.__pollJobStatus(jobId);
  //   const rawResults = await this._getJobResults(jobId);
  //   const results = this.__parseBatchResults(rawResults);
  //   return results;
  // }
}

function isErrorResponse(obj: any): obj is HereV7ErrorResponse {
  return obj && typeof obj.status === 'number';
}

export default HereProviderV7;
