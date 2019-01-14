const hereCredentials = {
   id: '',
   code: ''
}

//TODO: 5. Get Map Tile Url from dev poral
const hereTileUrl = `https://2.base.maps.api.here.com/maptile/2.1/maptile/newest/reduced.day/{z}/{x}/{y}/512/png8?app_id=${hereCredentials.id}&app_code=${hereCredentials.code}&ppi=320`;

const map = L.map('map', {
   center: [20,5],
   zoom: 3,
   layers: [L.tileLayer(hereTileUrl)],
   zoomControl: false,
   attributionControl: true
});

const base = '//localhost:5000/query?';
const params = {
   here_id: hereCredentials.id,
   here_code: hereCredentials.code,
   location: 'Barcelona',
   response_type: 'feature'
}

const url = base + Object.keys(params).map(key => key + '=' + params[key]).join('&');

fetch(url)
.then(res => res.json())
.then(res => {
   const geoJsonLayer = L.geoJSON(res, {
      style: {
         color: '#2DD5C9'
      }
   }).addTo(map);

   map.fitBounds(geoJsonLayer.getBounds());
})
