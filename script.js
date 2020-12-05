mapboxgl.accessToken =
  'pk.eyJ1IjoibWlhbWllZHRlY2giLCJhIjoiY2tocXh0NHMwMGViajJ4bWN5NWZxMjFqOCJ9.C44hy16LPWVJlKlX-4Ko5A';
var map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/mapbox/streets-v11',
  center: [-80.34858076, 25.57276101],
  zoom: 11.15
});

function loadImages(callback) {
  map.loadImage('/images/green-marker.png', (error, greenMarkerImage) => {
    if (error) {
      callback(error);
      return;
    }
    map.loadImage('/images/yellow-marker.png', (error, yellowMarkerImage) => {
      if (error) {
        callback(error);
        return;
      }
      map.loadImage('/images/red-marker.png', (error, redMarkerImage) => {
        if (error) {
          callback(error);
          return;
        }
        callback(null, greenMarkerImage, yellowMarkerImage, redMarkerImage);
      });
    });
  })
}

map.on('load', function () {
  loadImages(
    function (error, greenMarkerImage, yellowMarkerImage, redMarkerImage) {
      if (error) throw error;
      map.addImage('A', greenMarkerImage);
      map.addImage('B', yellowMarkerImage);
      map.addImage('C', redMarkerImage);
      map.addImage('D', redMarkerImage);
      map.addImage('F', redMarkerImage);

      fetch('/schools.json')
        .then(function (res) {
          return res.json()
        })
        .then(function (schools) {
          map.addSource('places', {
            'type': 'geojson',
            'data': {
              'type': 'FeatureCollection',
              'features': schools
            }
          })
          map.addSource('2018', {
            'type': 'geojson',
            'data': {
              'type': 'FeatureCollection',
              'features': schools
            }
          })
          map.addSource('2019', {
            'type': 'geojson',
            'data': {
              'type': 'FeatureCollection',
              'features': schools
            }
          })
        })
        .then(function () {
          // Add a layer showing the places.
          // map.addLayer({
          //   'id': 'places',
          //   'type': 'symbol',
          //   'source': 'places',
          //   'layout': {
          //     'icon-image': ["get", "Grade_2019"],
          //     'icon-allow-overlap': true,
          //     'visibility': 'visible'
          //   }
          // });
          map.addLayer({
            'id': '2018',
            'type': 'symbol',
            'source': '2018',
            'layout': {
              'icon-image': ["get", "Grade_2018"],
              'icon-allow-overlap': true,
              'visibility': 'visible'
            }
          });
          map.addLayer({
            'id': '2019',
            'type': 'symbol',
            'source': '2019',
            'layout': {
              'icon-image': ["get", "Grade_2019"],
              'icon-allow-overlap': true,
              'visibility': 'visible'
            }
          });
        })
    }
  );

  // Create a popup, but don't add it to the map yet.
  var popup = new mapboxgl.Popup({
    closeButton: true,
    closeOnClick: true
  });

  // Process School Feature Properties To Html
  const propertiesToHTMLString = (properties) => {
    const parent = document.createElement('div')
    const ul = document.createElement('ul')

    const createListItem = (title, value) => {
      const li = document.createElement('li')
      li.innerHTML = `<strong>${title}</strong>: ${value}`
      return li
    }

    Object.keys(properties).map((key) => {
      ul.appendChild(createListItem(key, properties[key]))
    })
    parent.appendChild(ul)

    return parent.innerHTML
  }

  function callback(e) {
    map.getCanvas().style.cursor = 'pointer';

    const coordinates = e.features[0].geometry.coordinates.slice();
    const properties = e.features[0].properties;

    // Ensure that if the map is zoomed out such that multiple
    // copies of the feature are visible, the popup appears
    // over the copy being pointed to.
    while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
      coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
    }

    // Populate the popup and set its coordinates
    // based on the feature found.
    const content = propertiesToHTMLString(properties)
    popup.setLngLat(coordinates).setHTML(content).addTo(map);
  }

  map.on('click', '2018', callback);
  map.on('click', '2019', callback);

});

// enumerate ids of the layers
var toggleableLayerIds = ['2018', '2019'];

// set up the corresponding toggle button for each layer
for (var i = 0; i < toggleableLayerIds.length; i++) {
  var id = toggleableLayerIds[i];

  var link = document.createElement('a');
  link.href = '#';
  link.className = 'active';
  link.textContent = id;

  link.onclick = function (e) {
    var clickedLayer = this.textContent;
    e.preventDefault();
    e.stopPropagation();

    var visibility = map.getLayoutProperty(clickedLayer, 'visibility');

    // toggle layer visibility by changing the layout object's visibility property
    if (visibility === 'visible') {
      map.setLayoutProperty(clickedLayer, 'visibility', 'none');
      this.className = '';
    } else {
      this.className = 'active';
      map.setLayoutProperty(clickedLayer, 'visibility', 'visible');
    }
  };

  var layers = document.getElementById('menu');
  layers.appendChild(link);
}

