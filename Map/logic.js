console.log("logic.js loaded");

// Define the CSV file location
let csvUrl = "yelp_academic_dataset.csv";  // Update this path to match the name of your CSV file

// Load the CSV data
d3.csv(csvUrl).then(function(data) {
  console.log("CSV data loaded:", data);

  // Log the keys of the first data object to understand the structure
  if (data.length > 0) {
    console.log("CSV data keys:", Object.keys(data[0]));
  }

  // Extract unique categories
  let categories = [...new Set(data.map(d => d.Categories))].filter(c => c);
  console.log("Categories extracted:", categories);

  // Convert the data to GeoJSON format
  let geoData = data.map(row => ({
    type: "Feature",
    properties: {
      name: row.name,
      category: row.Categories,  // Ensure this matches the column name in your CSV file
      stars: row.stars  // Include the stars information
    },
    geometry: {
      type: "Point",
      coordinates: [parseFloat(row.longitude), parseFloat(row.latitude)] // Ensure the correct columns are used for coordinates
    }
  }));

  console.log("GeoJSON data created:", geoData);
  createFeatures(geoData, categories);
}).catch(function(error) {
  console.error("Error loading CSV data:", error);
});

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
    "#8B0000", // Dark Red
    "#00008B", // Dark Blue
    "#006400", // Dark Green
    "#0000CD", // Medium Blue
    "#B22222", // Firebrick
    "#228B22", // Forest Green
    "#483D8B", // Dark Slate Blue
    "#8B4513", // Saddle Brown
    "#2E8B57", // Sea Green
    "#8A2BE2", // Blue Violet
    "#A52A2A", // Brown
    "#5F9EA0", // Cadet Blue
    "#8B008B", // Dark Magenta
    "#2F4F4F", // Dark Slate Gray
    "#4B0082"  // Indigo
  ];

  categories.forEach((category, i) => {
    let color = colors[i % colors.length];
    console.log(`Processing category: ${category} with color ${color}`);

    // Define custom icon using Leaflet's divIcon and Font Awesome
    let icon = L.divIcon({
      html: `<i class="fa fa-cutlery" style="color:${color}; font-size: 20px;"></i>`,
      className: 'custom-div-icon',
      iconSize: [40, 56],
      iconAnchor: [20, 56]
    });

    let filteredData = foodData.filter(d => d.properties.category === category);
    console.log(`Filtered Data for ${category}:`, filteredData);

    // Create marker layer
    foodLayers[category] = L.geoJSON(filteredData, {
      pointToLayer: function(feature, latlng) {
        return L.marker(latlng, { icon: icon });
      },
      onEachFeature: onEachFeature
    });

    // Create heatmap layer
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
  createMap(foodLayers, heatMapLayers, colors, categories);
}

function createMap(foodLayers, heatMapLayers, colors, categories) {
  console.log("Creating map...");

  let restaurantMap = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  });

  let starHeatMapBase = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  });

  let starHeatMapLayer = L.layerGroup();

  let baseMaps = {
    "Restaurant Map": restaurantMap,
    "Star Heat Map": L.layerGroup([starHeatMapBase, starHeatMapLayer])
  };

  let overlayMaps = {};

  categories.forEach((category, i) => {
    overlayMaps[category] = foodLayers[category];
  });

  let myMap = L.map("map", {
    center: [39.9526, -75.1652],  // Coordinates for Philadelphia
    zoom: 13,  // Increased zoom level
    layers: [restaurantMap],
    attributionControl: false  // Disable the default attribution control
  });

  let control = L.control.layers(baseMaps, overlayMaps, {
    collapsed: false
  }).addTo(myMap);

  // Add custom styles to the control layers
  control._container.querySelectorAll('input[type="checkbox"]').forEach((checkbox, i) => {
    let label = checkbox.parentElement;
    label.style.color = colors[i % colors.length];
  });

  console.log("Map created successfully.");

  // Add event listener for the search button
  document.getElementById("search-btn").addEventListener("click", function() {
    const zipCode = document.getElementById("zip-code").value;
    if (zipCode) {
      searchZipCode(zipCode, myMap);
    }
  });

  // Add event listener for base layer change to toggle marker layers
  myMap.on('baselayerchange', function(event) {
    if (event.name === "Star Heat Map") {
      starHeatMapLayer.clearLayers();
      Object.values(foodLayers).forEach(layer => {
        myMap.removeLayer(layer);
      });
      control._container.querySelectorAll('input[type="checkbox"]').forEach((checkbox, i) => {
        if (checkbox.checked) {
          let category = checkbox.nextSibling.textContent.trim();
          let heatMapData = heatMapLayers.find(h => h.category === category).data;
          starHeatMapLayer.addLayer(L.heatLayer(heatMapData, {
            radius: 20,
            blur: 15,
            maxZoom: 17,
            gradient: {
              0.0: 'blue',
              0.5: 'lime',
              1.0: 'red'
            }
          }));
        }
      });
    } else {
      starHeatMapLayer.clearLayers();
      Object.values(foodLayers).forEach(layer => {
        myMap.addLayer(layer);
      });
      enableCategorySelection();
    }
  });

  // Function to enable category selection
  function enableCategorySelection() {
    control._container.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
      checkbox.disabled = false;
      checkbox.addEventListener('change', checkboxChangeHandler);
    });
  }

  // Function to disable category selection
  function disableCategorySelection() {
    control._container.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
      checkbox.disabled = true;
      checkbox.removeEventListener('change', checkboxChangeHandler);
    });
  }

  // Checkbox change handler
  function checkboxChangeHandler() {
    if (myMap.hasLayer(starHeatMapBase)) {
      // Do nothing if Star Heat Map is selected
    } else {
      if (this.checked) {
        let category = this.nextSibling.textContent.trim();
        myMap.addLayer(foodLayers[category]);
      } else {
        let category = this.nextSibling.textContent.trim();
        myMap.removeLayer(foodLayers[category]);
      }
    }
  }

  // Add event listeners to the category checkboxes to toggle layers based on current base layer
  control._container.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
    checkbox.addEventListener('change', checkboxChangeHandler);
  });

  // Function to toggle markers based on current base layer
  function toggleMarkers() {
    if (myMap.hasLayer(starHeatMapBase)) {
      disableCategorySelection();
      Object.values(foodLayers).forEach(layer => {
        myMap.removeLayer(layer);
      });
    } else {
      enableCategorySelection();
    }
  }

  // Run the check initially
  toggleMarkers();
}

// Function to search for zip code and zoom to the location
function searchZipCode(zipCode, map) {
  const url = `https://nominatim.openstreetmap.org/search?format=json&postalcode=${zipCode}&countrycodes=US`;
  fetch(url)
    .then(response => response.json())
    .then(data => {
      if (data.length > 0) {
        const { lat, lon } = data[0];
        map.setView([lat, lon], 15);  // Zoom to the location
      } else {
        alert("Zip code not found");
      }
    })
    .catch(error => {
      console.error("Error searching zip code:", error);
      alert("Error searching zip code");
    });
}
