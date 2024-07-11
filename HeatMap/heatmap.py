import geopandas as gpd

# Load GeoJSON file
gdf_neighborhoods = gpd.read_file('philadelphia.geojson')



import pandas as pd

data = pd.read_csv('yelp_academic_dataset_with_price_rating.csv')
# Convert DataFrame to GeoDataFrame
gdf_data = gpd.GeoDataFrame(
    data, 
    geometry=gpd.points_from_xy(data.longitude, data.latitude),
    crs="EPSG:4326"  # Make sure this matches your GeoJSON CRS
)
# Spatial join - points to polygons
data_with_neighborhoods = gpd.sjoin(gdf_data, gdf_neighborhoods, how="inner", op='intersects')



# Assuming 'review_count' needs to be summed up
# Assuming 'data_with_neighborhoods' is your GeoDataFrame after the spatial join
data_grouped = data_with_neighborhoods.groupby('name_right')['review_count'].mean().reset_index()

# Rename the column to reflect that it contains averages
data_grouped.rename(columns={'review_count': 'average_review_count'}, inplace=True)



import geopandas as gpd

# Load your GeoJSON as a GeoDataFrame
gdf = gpd.read_file('philadelphia.geojson')

# Join your DataFrame with the GeoDataFrame
# Assume data_grouped is already set with 'name_right' as index and does not need setting again
gdf = gdf.set_index('name').join(data_grouped, how="left").reset_index()

# Convert all Timestamp columns to strings
for col in gdf.select_dtypes(include=['datetime64[ns]', 'datetime64[ns, utc]']).columns:
    gdf[col] = gdf[col].astype(str)

# Save back to GeoJSON
merged_geojson = json.loads(gdf.to_json())

import folium

# Create a map centered around Philadelphia
m = folium.Map(location=[39.9526, -75.1652], zoom_start=12)

# Add the choropleth layer
folium.Choropleth(
    geo_data=merged_geojson,
    name='choropleth',
    data=gdf,
    columns=['name', 'average_review_count'],
    key_on='feature.properties.name',
    fill_color='YlOrRd',  # Color scheme: can be adjusted
    fill_opacity=0.7,
    line_opacity=0.2,
    legend_name='Average Review Count per Neighborhood'
).add_to(m)

# Add tooltips using the merged GeoJSON
folium.GeoJson(
    data=merged_geojson,
    style_function=lambda feature: {'color': 'black', 'fillColor': '#ffff00', 'weight': 0.5, 'fillOpacity': 0.2},
    tooltip=folium.GeoJsonTooltip(
        fields=['name', 'average_review_count'],
        aliases=['Neighborhood:', 'Average Reviews:'],
        style="background-color: #F0EFEF; border: 2px solid black; border-radius: 3px; box-shadow: 3px;",
        max_width=250,
    )
).add_to(m)

# Add a layer control to toggle on/off
folium.LayerControl().add_to(m)

# Save the map to an HTML file
map_file = 'tool3.html'
m.save(map_file)
print(f"Map has been saved to: {map_file}")

