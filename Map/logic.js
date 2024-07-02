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
    layer.bindPopup(`<h3>${feature.properties.name}</h3><hr><p>Category: ${feature.properties.category}</p><p>Stars: ${feature.properties.stars}</p>`);
  }

  let foodLayers = {};
  let colors = ["red", "blue", "green", "yellow", "purple", "orange", "pink", "brown", "gray", "black", "cyan", "magenta", "lime", "maroon", "navy", "olive"];

  categories.forEach((category, i) => {
    let color = colors[i % colors.length];
    console.log(`Processing category: ${category} with color ${color}`);
    
    // Define custom icon
    let iconUrl = `https://leafletjs.com/examples/custom-icons/${color}-dot.png`;
    let icon = L.icon({
      iconUrl: iconUrl,
      iconSize: [25, 41],  // Size of the icon
      iconAnchor: [12, 41],  // Point of the icon which will correspond to marker's location
      popupAnchor: [1, -34],  // Point from which the popup should open relative to the iconAnchor
      shadowUrl: 'https://leafletjs.com/examples/custom-icons/marker-shadow.png',
      shadowSize: [41, 41]  // Size of the shadow
    });

    let filteredData = foodData.filter(d => d.properties.category === category);
    console.log(`Filtered Data for ${category}:`, filteredData);

    foodLayers[category] = L.geoJSON(filteredData, {
      pointToLayer: function(feature, latlng) {
        return L.marker(latlng, { icon: icon });
      },
      onEachFeature: onEachFeature
    });
  });

  console.log("Food layers created:", foodLayers);
  createMap(foodLayers, colors, categories);
}

function createMap(foodLayers, colors, categories) {
  console.log("Creating map...");
  let restaurantMap = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  });

  let starHeatMap = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
    attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
  });

  let baseMaps = {
    "Restaurant Map": restaurantMap,
    "Star Heat Map": starHeatMap
  };

  let overlayMaps = foodLayers;

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
}