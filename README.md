# Query Polygon Boundaries

This RESTful API enables one to query HERE map content, specifically admin level polygon data in GeoJSON format. This API wraps responses from the [HERE Geocoder API](https://developer.here.com/documentation/geocoder/topics/quick-start-geocode.html) and converts the polygon shape data from [WKT](https://en.wikipedia.org/wiki/Well-known_text) format to [GeoJSON](https://en.wikipedia.org/wiki/GeoJSON) format.

This service is great for obtaining data to use with your favorite web map renderers like HERE XYZ, Tangram, Leaflet, deck.gl, Google Maps, and Mapbox.

## Prerequisites
A valid App Id and App Code from the [HERE Developer Portal](https://developer.here.com/) is required. The free tier allows for up to 250K transactions/month.

## Installation

    git clone https://github.com/dbabbs/query-geojson-polygons.git
    cd query-geojson-polygons
    npm install

## Running

    npm start

## Parameters

| Parameter | Required | Accepted Values | Description |
|---|---|---|---|
| `here_id` | Yes | A valid HERE Developer App Id | |
| `here_code` | Yes | A valid HERE Developer App Code | |
| `admin_level` | No | `country`, `state`, `county`, `city`, `district`, `postalCode` | The desired admin level of the polygon data. For example, if you would like city polygon data for _Seattle, WA_, use `city`. If `admin_level` is not passed, the API will return the admin level data for the top result in the geocoder. |
| `location` | Yes | A location string | The desired region / query. Examples: *98122*, *Seattle, WA*, *Hong Kong*, *Brazil*, *Virginia*. |
| `response_type` | No | `feature`, `geometry`, `feature_collection` | The desired GeoJSON object type. If the value is not provided, the API will return a `feature`. |

## Examples

#### Querying State of Washington feature
```
{LOCAL-SERVER}/query
?here_id={HERE-ID}
&here_code={HERE-CODE}
&location=Washington State
&response_type=feature
```
#### Querying City of San Francisco geometry
```
{LOCAL-SERVER}/query
?here_id={HERE-ID}
&here_code={HERE-CODE}
&location=San Francisco,CA
&response_type=geometry
```

### Querying State of Louisiana with the city name of New Orleans

Since New Orleans is a city in the state of Louisiana, the API will return the polygon data for the state of New Orleans using using `admin_level=state`.
```
{LOCAL-SERVER}/query
?here_id={HERE-ID}
&here_code={HERE-CODE}
&location= New Orleans
&admin_level=state
```

## Demo

This repository includes a demo of the API to be used with Leaflet. Instructions for running the demo:

Navigate to the demo directory
```
cd demo
```
Start a local server for the front end code.
```
python -m SimpleHTTPServer 8888
```
Navigate to `localhost:8888` or to the port you configured.

Inside of `index.js`, be sure to insert your HERE Developer credentials into the `hereCredentials` object. These credentials authenticate the Map Tile API for Leaflet and the Polygon Query API.
```
const hereCredentials: {
   id: '',
   code: ''
}
```


## Data Usage

When using data from this API, please comply with all terms listed on the [HERE Developer Portal FAQ](https://developer.here.com/faqs#licensing-terms).
