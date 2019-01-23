const express = require('express');
const bodyParser = require('body-parser');
const fetch = require('node-fetch');
const wkt = require('terraformer-wkt-parser');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(bodyParser.urlencoded({
   extended: true
}));
app.use(bodyParser.json());

/*
Accepted Parameters:
 - here_id: HERE Developer Portal App Id. (String) [REQUIRED]
 - here_code: HERE Developer Portal App Code (String) [REQUIRED]
 - admin_level: Admin level for polygon data. (String) Options: country, state, county, city, district, postalCode
 - location: Preferred location of the polygon data (String) [REQUIRED]
 - response_type: Default geojson object. (String) Options: feature, feature_collection, geometry. Default: feature
*/

const geocode = (params) => `https://geocoder.api.here.com/6.2/geocode.json?app_id=${params.here_id}&app_code=${params.here_code}&searchtext=${params.location}&additionaldata=IncludeShapeLevel,${params.admin_level}`;

app.get('/query', (req, res) => {
   const params = {
      here_id: req.query.here_id || '',
      here_code: req.query.here_code || '',
      admin_level: req.query.admin_level || 'default',
      location: req.query.location || '',
      response_type: req.query.response_type || 'feature'
   };


   //Check if location is valid
   if (params.location === '') {
      res.send({
         error: 'Please supply a location parameter.'
      });
      return;
   }
   params.location = params.location.split(' ').join('+');


   //Check if response_type is valid
   if (
      params.response_type !== 'geometry' &&
      params.response_type !== 'feature' &&
      params.response_type !== 'feature_collection' &&
      params.response_type !== ''
   ) {
      res.send({
         error: 'If the response_type parameter is supplied, it must equal either: geometry, feature, or feature_collection.'
      });
      return;
   }

   //Check if admin_level is valid
   if (
      params.admin_level !== 'country' &&
      params.admin_level !== 'state' &&
      params.admin_level !== 'county' &&
      params.admin_level !== 'city' &&
      params.admin_level !== 'district' &&
      params.admin_level !== 'postalCode' &&
      params.admin_level !== 'default' &&
      params.admin_level !== ''
   ) {
      res.send({
         error: 'If the admin_level parameter is supplied, it must equal either: country, state, county, city, district, postalCode, or default.'
      });
      return;
   }

   fetch(geocode(params))
      .then(geocodeRes => geocodeRes.json())
      .then(geocodeRes => {

         if (geocodeRes.Response.View.length === 0) {
            res.send({
               error: 'No results found for the query ' + req.query.location
            });
            return;
         }
         if (!geocodeRes.Response.View[0].Result[0].Location.hasOwnProperty('Shape')) {
            res.send({
               error: 'No shape data available for the query ' + req.query.location
            });
            // return;
         }

         const  wellKnownText = geocodeRes.Response.View[0].Result[0].Location.Shape.Value;
         const labels = geocodeRes.Response.View[0].Result[0].Location.Address;
         const geometry = wkt.parse(wellKnownText);

         if (params.response_type === 'geometry') {
            res.send(geometry);
         } else {

            let obj = {
               type: 'Feature',
               geometry: geometry,
               properties: {}
            };
            if (params.admin_level === 'country') {
               obj.properties = {
                  admin_level: params.admin_level,
                  country: labels.Country
               };
            } else if (params.admin_level === 'state') {
               obj.properties = {
                  admin_level: params.admin_level,
                  country: labels.Country,
                  state: labels.State
               }
            } else if (params.admin_level === 'county') {
               obj.properties = {
                  admin_level: params.admin_level,
                  country: labels.County,
                  state: labels.State,
                  county: labels.County
               };
            } else if (params.admin_level === 'city') {
               obj.properties = {
                  admin_level: params.admin_level,
                  country: labels.Country,
                  state: labels.State,
                  county: labels.County,
                  city: labels.City
               };
            } else if (params.admin_level === 'district') {
               obj.properties = {
                  admin_level: params.admin_level,
                  country: labels.Country,
                  state: labels.State,
                  county: labels.County,
                  city: labels.City,
                  district: labels.District
               };
            } else if (params.admin_level === 'postalCode') {
               obj.properties = {
                  admin_level: params.admin_level,
                  country: labels.Country,
                  state: labels.State,
                  county: labels.County,
                  city: labels.City,
                  district: labels.District,
                  postal_code: labels.PostalCode
               };
            }

            if (params.response_type.toLowerCase() === 'feature') {
               res.send(obj);
            } else {
               res.send({
                  type: "FeatureCollection",
                  features: [obj]
               });
            }
         }

      }).catch(error => {

         if (params.here_id === '' || params.here_code == '') {
            res.send({
               error: 'HERE Developer credentials are missing. Please visit developer.here.com to sign up for an account'
            });
         } else {
            res.send({
               error: 'Please ensure the supplied HERE Developer credentials are valid'
            });
         }
      });
})

app.listen(PORT, () => console.log(`Listening on ${ PORT }`));
