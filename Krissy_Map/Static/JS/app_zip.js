// Set up the map
var map = L.map('map').setView([39.9526, -75.1652], 11);

// Add a tile layer
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
}).addTo(map);

// Load GeoJSON data for Philadelphia zip codes
fetch('Static/Data/Zipcodes_Poly.geojson')  // path to GeoJSON file
    .then(response => response.json())
    .then(geojson => {
        console.log("GeoJSON Data Loaded:", geojson);

        // Load the most common cuisine data
        fetch('Static/Data/top_three_cuisines_by_zip.json')  // path to JSON file
            .then(response => response.json())
            .then(data => {
                console.log("Cuisine Data Loaded:", data);

                // Define a function to get color based on cuisine
                function getColor(cuisine) {
                    switch (cuisine) {
                        case 'African': return '#C0392B';
                        case 'American': return '#2980B9';
                        case 'Bakery': return '#AAFF00';
                        case 'BBQ': return '#EE4B2B';
                        case 'Cheesesteaks': return '#e28743';
                        case 'Chinese': return '#76448A';
                        case 'European': return '#B7950B';
                        case 'Indian': return '#148F77';
                        case 'Italian': return '#B03A2E';
                        case 'Japanese': return '#1D8348';
                        case 'Jewish': return '#21618C';
                        case 'Korean': return '#FFBF00';
                        case 'Mexican': return '#DE3163';
                        case 'Middle Eastern': return '#C9CC3F';
                        case 'SE Asian': return '#DA70D6';
                        default: return '#B2BEB5';
                    }
                }

                // Define a function to style each zip code area based on the most common cuisine
                function style(feature) {
                    var cuisineData = data.find(d => d.postal_code == feature.properties.CODE);
                    var cuisine = cuisineData ? cuisineData.most_common_cuisine : 'Unknown';
                    return {
                        fillColor: getColor(cuisine),
                        weight: 2,
                        opacity: 1,
                        color: 'white',
                        dashArray: '3',
                        fillOpacity: 0.7
                    };
                }

                // Function to handle mouseover events
                function highlightFeature(e) {
                    var layer = e.target;
                    layer.setStyle({
                        weight: 5,
                        color: '#666',
                        dashArray: '',
                        fillOpacity: 0.7
                    });

                    if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
                        layer.bringToFront();
                    }

                    var cuisineData = data.find(d => d.postal_code == layer.feature.properties.CODE);
                    var first = cuisineData ? cuisineData.most_common_cuisine : 'Unknown';
                    var second = cuisineData && cuisineData.second_most_common_cuisine ? cuisineData.second_most_common_cuisine : 'N/A';
                    var third = cuisineData && cuisineData.third_most_common_cuisine ? cuisineData.third_most_common_cuisine : 'N/A';
                    var popupContent = `
                        <b>Zip Code: ${layer.feature.properties.CODE}</b><br>
                        1st Most Common: ${first}<br>
                        2nd Most Common: ${second}<br>
                        3rd Most Common: ${third}
                    `;
                    layer.bindPopup(popupContent).openPopup();
                }

                // Function to reset highlight
                function resetHighlight(e) {
                    geojsonLayer.resetStyle(e.target);
                    e.target.closePopup();
                }

                // Function to zoom to feature
                function zoomToFeature(e) {
                    map.fitBounds(e.target.getBounds());
                }

                // Add GeoJSON layer to the map
                var geojsonLayer = L.geoJson(geojson, {
                    style: style,
                    onEachFeature: function (feature, layer) {
                        layer.on({
                            mouseover: highlightFeature,
                            mouseout: resetHighlight,
                            click: zoomToFeature
                        });
                    }
                }).addTo(map);

                // Add a legend to the map
                var legend = L.control({ position: 'bottomright' });

                legend.onAdd = function (map) {
                    var div = L.DomUtil.create('div', 'info legend'),
                        cuisines = ['African', 'American', 'Bakery', 'BBQ', 'Cheesesteaks', 'Chinese', 'European', 'Indian', 'Italian', 'Japanese', 'Jewish', 'Korean', 'Mexican', 'Middle Eastern', 'SE Asian'],
                        labels = [];

                // Add the title to the legend
                div.innerHTML += '<h4>Most Common Cuisine by Zipcode</h4>';

                // Loop through our cuisines and generate a label with a colored square for each cuisine
                for (var i = 0; i < cuisines.length; i++) {
                    div.innerHTML +=
                        '<i style="background:' + getColor(cuisines[i]) + '"></i> ' +
                        cuisines[i] + '<br>';
                }

                // Add the caveat about zip codes with no restaurants listed
                div.innerHTML += '<br><strong>Note:</strong> Zip codes 19137, 19133, 19141, and 19109 had no restaurants listed in the dataset.';

                return div;
            };

            legend.addTo(map);
            })
            .catch(error => console.error('Error loading JSON data:', error));
    })
    .catch(error => console.error('Error loading GeoJSON data:', error));