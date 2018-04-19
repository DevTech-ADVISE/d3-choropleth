const mapGeoKey = {
  'KOS': 'CS-KM'
}

// Get the value that the geo key is mapped to, if it doesn't exist just use the original key as default
// The purpose of this is to map values in our data that don't match our geo json, for example our data has Kosovo's country code as 'CS-KM' but our geojson is 'KOS'
const mapGeoKeyToDataKey = (geoKey) => mapGeoKey[geoKey] || geoKey

export { mapGeoKeyToDataKey }
