document.addEventListener('DOMContentLoaded', () => {
    var map = L.map('map').setView([39.9526, -75.1652], 11);
    var geojsonLayer, restaurantLayers = {}, heatMapLayers = [];
    var cuisineLegend, restaurantLegend, heatMapLegend;
    var cuisineData = [];
    var categories = []; // To store categories

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    function initializeLegends() {
        cuisineLegend = L.control({ position: 'bottomright' });
        cuisineLegend.onAdd = function (map) {
            var div = L.DomUtil.create('div', 'info legend'),
                cuisines = ['African', 'American', 'Bakery', 'BBQ', 'Cheesesteaks', 'Chinese', 'European', 'Indian', 'Italian', 'Japanese', 'Jewish', 'Korean', 'Mexican', 'Middle Eastern', 'SE Asian'],
                labels = [];

            div.innerHTML += '<h4>Most Common Cuisine by Zipcode</h4>';

            for (var i = 0; i < cuisines.length; i++) {
                div.innerHTML += '<i style="background:' + getColor(cuisines[i]) + '"></i> ' + cuisines[i] + '<br>';
            }

            div.innerHTML += '<br><strong>Note:</strong> Zip codes 19137, 19133, 19141, and 19109 had no restaurants listed in the dataset.';

            return div;
        };

        restaurantLegend = L.control({ position: 'bottomright' });
        restaurantLegend.onAdd = function (map) {
            var div = L.DomUtil.create('div', 'info legend');
            div.innerHTML += '<h4>Restaurant Map</h4>';
            div.innerHTML += '<label><input type="checkbox" id="select-all" checked> Select All</label><br>'; // Add Select All checkbox
            categories.forEach(category => {
                div.innerHTML += `<label><input type="checkbox" class="category-filter" value="${category}" checked> ${category}</label><br>`;
            });
            return div;
        };

        heatMapLegend = L.control({ position: 'bottomright' });
        heatMapLegend.onAdd = function (map) {
            var div = L.DomUtil.create('div', 'info legend');
            div.innerHTML += '<h4>Heat Map</h4>';
            div.innerHTML += '<p>Legend for Heat Map</p>';
            return div;
        };
    }

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

    function style(feature) {
        var cuisine = 'Unknown';
        if (cuisineData) {
            var cuisineInfo = cuisineData.find(d => d.postal_code == feature.properties.CODE);
            cuisine = cuisineInfo ? cuisineInfo.most_common_cuisine : 'Unknown';
        }
        return {
            fillColor: getColor(cuisine),
            weight: 2,
            opacity: 1,
            color: 'white',
            dashArray: '3',
            fillOpacity: 0.7
        };
    }

    fetch('Static/Data/Zipcodes_Poly.geojson')
        .then(response => response.json())
        .then(geojson => {
            console.log("GeoJSON Data Loaded:", geojson);

            loadCuisineData(geojson);
        })
        .catch(error => console.error('Error loading GeoJSON data:', error));

    function loadCuisineData(geojson) {
        fetch('Static/Data/top_three_cuisines_by_zip.json')
            .then(response => response.json())
            .then(data => {
                console.log("Cuisine Data Loaded:", data);
                cuisineData = data;

                // Create the geojsonLayer after the cuisine data is loaded
                geojsonLayer = L.geoJson(geojson, {
                    style: style,
                    onEachFeature: function (feature, layer) {
                        layer.on({
                            mouseover: highlightFeature,
                            mouseout: resetHighlight,
                            click: zoomToFeature
                        });
                    }
                }).addTo(map);

                cuisineLegend.addTo(map);  // Add the initial legend
                loadCSVData();
            })
            .catch(error => console.error('Error loading JSON data:', error));
    }

    function loadCSVData() {
        let csvUrl = 'Static/Data/yelp_academic_dataset.csv';
        d3.csv(csvUrl).then(function(data) {
            console.log("CSV data loaded:", data);

            if (data.length > 0) {
                console.log("CSV data keys:", Object.keys(data[0]));
            }

            categories = [...new Set(data.map(d => d.Categories))].filter(c => c); // Store categories globally
            console.log("Categories extracted:", categories);

            let geoData = data.map(row => ({
                type: "Feature",
                properties: {
                    name: row.name,
                    category: row.Categories,
                    stars: row.stars
                },
                geometry: {
                    type: "Point",
                    coordinates: [parseFloat(row.longitude), parseFloat(row.latitude)]
                }
            }));

            console.log("GeoJSON data created:", geoData);
            createFeatures(geoData, categories);
        }).catch(function(error) {
            console.error("Error loading CSV data:", error);
        });
    }

    function createFeatures(foodData, categories) {
        console.log("Creating features...");
        console.log("Food Data:", foodData);

        function onEachFeature(feature, layer) {
            const tooltipContent = `<h3>${feature.properties.name}</h3><p>Category: ${feature.properties.category}</p><p>Stars: ${feature.properties.stars}</p>`;
            layer.bindTooltip(tooltipContent, {
                permanent: false,
                direction: 'top',
                offset: [0, -10],
                opacity: 0.8,
            });

            layer.on('mouseover', function (e) {
                this.openTooltip();
            });

            layer.on('mouseout', function (e) {
                this.closeTooltip();
            });
        }

        let foodLayers = {};
        let heatMapLayers = [];
        let colors = [
            "#8B0000", "#00008B", "#006400", "#0000CD", "#B22222", "#228B22", "#483D8B", "#8B4513",
            "#2E8B57", "#8A2BE2", "#A52A2A", "#5F9EA0", "#8B008B", "#2F4F4F", "#4B0082"
        ];

        categories.forEach((category, i) => {
            let color = colors[i % colors.length];
            console.log(`Processing category: ${category} with color ${color}`);

            let icon = L.divIcon({
                html: `<i class="fa fa-cutlery" style="color:${color}; font-size: 20px;"></i>`,
                className: 'custom-div-icon',
                iconSize: [40, 56],
                iconAnchor: [20, 56]
            });

            let filteredData = foodData.filter(d => d.properties.category === category);
            console.log(`Filtered Data for ${category}:`, filteredData);

            foodLayers[category] = L.geoJSON(filteredData, {
                pointToLayer: function(feature, latlng) {
                    return L.marker(latlng, { icon: icon });
                },
                onEachFeature: onEachFeature
            });

            let heatMapData = filteredData.map(d => [
                parseFloat(d.geometry.coordinates[1]),
                parseFloat(d.geometry.coordinates[0]),
                parseFloat(d.properties.stars)
            ]);

            heatMapLayers.push({
                category,
                data: heatMapData
            });
        });

        console.log("Food layers created:", foodLayers);
        initializeLayers(foodLayers, heatMapLayers, colors, categories);
    }

    function initializeLayers(foodLayers, heatMapLayers, colors, categories) {
        console.log("Initializing layers...");

        let restaurantLayerGroup = L.layerGroup(Object.values(foodLayers));
        let starHeatMapLayer = L.layerGroup();

        let baseMaps = {
            "Cuisine by Zip Code": geojsonLayer,
            "Restaurant Map": restaurantLayerGroup,
            "Heat Map": starHeatMapLayer
        };

        let control = L.control.layers(baseMaps, null, {
            collapsed: false
        }).addTo(map);

        // Initially add geojsonLayer to the map
        geojsonLayer.addTo(map);
        cuisineLegend.addTo(map);  // Add the initial legend

        map.on('baselayerchange', function(event) {
            map.removeControl(cuisineLegend);
            map.removeControl(restaurantLegend);
            map.removeControl(heatMapLegend);

            if (event.name === "Heat Map") {
                starHeatMapLayer.clearLayers();
                Object.values(foodLayers).forEach(layer => {
                    map.removeLayer(layer);
                });
                heatMapLayers.forEach(layer => {
                    starHeatMapLayer.addLayer(L.heatLayer(layer.data, {
                        radius: 20,
                        blur: 15,
                        maxZoom: 17,
                        gradient: {
                            0.0: 'blue',
                            0.5: 'lime',
                            1.0: 'red'
                        }
                    }));
                });
                heatMapLegend.addTo(map);
            } else if (event.name === "Restaurant Map") {
                starHeatMapLayer.clearLayers();
                map.addLayer(restaurantLayerGroup);
                restaurantLegend.addTo(map);
                addCategoryFilters(foodLayers); // Call addCategoryFilters when Restaurant Map is selected
            } else if (event.name === "Cuisine by Zip Code") {
                starHeatMapLayer.clearLayers();
                map.addLayer(geojsonLayer);
                cuisineLegend.addTo(map);
            }
        });
    }

    function addCategoryFilters(foodLayers) {
        const selectAllCheckbox = document.getElementById('select-all');
        const categoryCheckboxes = document.querySelectorAll('.category-filter');

        selectAllCheckbox.addEventListener('change', function () {
            const isChecked = this.checked;
            categoryCheckboxes.forEach(checkbox => {
                checkbox.checked = isChecked;
            });

            Object.keys(foodLayers).forEach(category => {
                if (isChecked) {
                    map.addLayer(foodLayers[category]);
                } else {
                    map.removeLayer(foodLayers[category]);
                }
            });
        });

        categoryCheckboxes.forEach(checkbox => {
            checkbox.addEventListener('change', function () {
                const selectedCategories = Array.from(document.querySelectorAll('.category-filter:checked')).map(cb => cb.value);

                Object.keys(foodLayers).forEach(category => {
                    if (selectedCategories.includes(category)) {
                        map.addLayer(foodLayers[category]);
                    } else {
                        map.removeLayer(foodLayers[category]);
                    }
                });

                if (selectedCategories.length === categoryCheckboxes.length) {
                    selectAllCheckbox.checked = true;
                } else {
                    selectAllCheckbox.checked = false;
                }
            });
        });
    }

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

        var cuisine = 'Unknown';
        if (cuisineData) {
            var cuisineInfo = cuisineData.find(d => d.postal_code == layer.feature.properties.CODE);
            cuisine = cuisineInfo ? cuisineInfo.most_common_cuisine : 'Unknown';
        }
        var first = cuisineInfo ? cuisineInfo.most_common_cuisine : 'Unknown';
        var second = cuisineInfo && cuisineInfo.second_most_common_cuisine ? cuisineInfo.second_most_common_cuisine : 'N/A';
        var third = cuisineInfo && cuisineInfo.third_most_common_cuisine ? cuisineInfo.third_most_common_cuisine : 'N/A';
        var popupContent = `
            <b>Zip Code: ${layer.feature.properties.CODE}</b><br>
            1st Most Common: ${first}<br>
            2nd Most Common: ${second}<br>
            3rd Most Common: ${third}
        `;
        layer.bindPopup(popupContent).openPopup();
    }

    function resetHighlight(e) {
        geojsonLayer.resetStyle(e.target);
        e.target.closePopup();
    }

    function zoomToFeature(e) {
        map.fitBounds(e.target.getBounds());
    }

    initializeLegends();
});