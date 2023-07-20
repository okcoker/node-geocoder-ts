import type { ResultData, Formatter, FormatterOptions } from '../../types';

export interface Options extends FormatterOptions {
  name: 'gpx';
}

class GpxFormatter implements Formatter<Options> {
  options: Omit<Options, 'name'>;

  constructor(options: Omit<Options, 'name'> = {}) {
    this.options = options;
  }

  format(data: ResultData[]) {
    let gpx = '<?xml version="1.0" encoding="UTF-8"?>\n';
    gpx +=
      '<gpx version="1.1" xmlns="http://www.topografix.com/GPX/1/1" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"';
    gpx +=
      ' xsi:schemaLocation="http://www.topografix.com/GPX/1/1 http://www.topografix.com/GPX/1/1/gpx.xsd"';
    gpx += ' creator="geocoder.js">';

    data.forEach(data => {
      gpx += '<wpt lat="' + data.latitude + '" lon="' + data.longitude + '">';
      gpx += '<name></name>';
      gpx += '</wpt>';
    });

    gpx += '</gpx>';

    return gpx;
  }
}

export default GpxFormatter;
