// Create a map centered around Philadelphia
var map = L.map('map').setView([39.9526, -75.1652], 12);

// Add a base layer
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

// Load the GeoJSON data
fetch('merged_geojson.json')
    .then(response => response.json())
    .then(data => {
        // Get the range of average review counts
        let averageReviewCounts = data.features.map(f => f.properties.average_review_count);
        let maxReviewCount = Math.max(...averageReviewCounts);
        let minReviewCount = Math.min(...averageReviewCounts);

        // Define the style for the choropleth
        function style(feature) {
            return {
                fillColor: getColor(feature.properties.average_review_count),
                weight: 0.5,
                opacity: 1,
                color: 'black',
                dashArray: '',
                fillOpacity: 0.7
            };
        }

        // Get color based on average review count
        function getColor(d) {
            return d > 1200 ? '#800026' :
                   d > 1000 ? '#BD0026' :
                   d > 800  ? '#E31A1C' :
                   d > 600  ? '#FC4E2A' :
                   d > 400  ? '#FD8D3C' :
                   d > 200  ? '#FEB24C' :
                   d > 0    ? '#FFEDA0' :
                              '#B2BEB5';
        }

        // Add the GeoJSON layer
        L.geoJson(data, {
            style: style,
            onEachFeature: function (feature, layer) {
                layer.bindTooltip('<b>Neighborhood:</b> ' + feature.properties.name + '<br>' +
                                  '<b>Average Reviews:</b> ' + feature.properties.average_review_count + '<br>' +
                                  '<b>Restaurant Count:</b> ' + feature.properties.restaurant_count);
            }
        }).addTo(map);

        // Add a legend to the map
        var legend = L.control({position: 'bottomright'});

        legend.onAdd = function (map) {
            var div = L.DomUtil.create('div', 'info legend'),
                grades = [0, 200, 400, 600, 800, 1000, 1200],
                labels = [],
                from, to;

            div.innerHTML += '<h4>Average Reviews</h4>'; // Add a title to the legend

            for (var i = 0; i < grades.length - 1; i++) {
                from = grades[i];
                to = grades[i + 1];

                labels.push(
                    '<i style="background:' + getColor(from + 1) + '"></i> ' +
                    from + (to ? '&ndash;' + to : '+'));
            }

            div.innerHTML += labels.join('<br>');
            return div;
        };

        legend.addTo(map);
    });
