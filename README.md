# Project3-PhillyFood
An analysis of the types of food in Philadelphia

![images (1)](https://github.com/C-Duke0/Project3-PhillyFood/assets/162597320/ddec3b91-1d9f-4e2b-931f-8df4d01e0fac)

## Project Contributors:
- Michael Andia
  
- Blake Bartlett
  
- Christopher Duke
  
- Tim McCarthy
  
- Krissina Wells

## Project Overview

The Philadelphia Restaurant Cuisine project aims to visualize restaurant cuisines in Philadelphia. By leveraging data from Yelp and GeoJSON, this project provides interactive maps and other charts that highlight the top cuisines in the area, allowing users to explore the culinary landscape of the city.

## Features

- Interactive map displaying the most common cuisines by zip code.
- Mouseover tooltips providing detailed information on the top three cuisines for each area.
- Color-coded legend for easy identification of cuisine types.
- Zoom functionality for in-depth exploration of specific regions.

## Data Sources

- **Yelp Academic Dataset:** Provides information on restaurants and their respective cuisines.
- **GeoJSON:** Used to define the geographical boundaries of Philadelphia's zip codes.

## Getting Started

## Ethical Considerations made: 

For the Philadelphia Food Map project,  ethical considerations were addressed to ensure responsible handling of data and interactions with the public. 

Here are some specific ethical considerations for our project:

- Privacy and Consent

We ensured that the data collected about businesses, such as addresses, ratings, or owner information, was used responsibly and in compliance with privacy laws.

We avoided capturing personal data of individuals visiting or reviewing the establishments such as posting user reviews without consent.

- Data Source Legitimacy

We verified that all data sources are legitimate and that we had the right to use the data, and we ensured compliance with terms of service for the data obtained from the third-party sources.

- Accuracy and Fairness

We have ensured that all information presented on the map is accurate and fairly represents the businesses, and have avoided any bias that could unfairly harm or benefit particular establishments.


## Interacting with the Map

To explore different maps, use the radio buttons to toggle between layers:

1. **Locate the Layer Control Panel:**
   - Find the panel with radio buttons on the top right side of the map.

2. **Select a Layer:**
   - Click on a radio button to select a layer.
   - The available layers include "Restaurant Map by Star Rating," "BakerCuisine by Zip Code," and "Heat Map"

3. **View the Selected Layer:**
   - The map will update to display the selected layer, highlighting the corresponding food establishments.

#### **Zip Code Layer:**

  ##### Mouseover: Hover over different zip codes to see a tooltip displaying the top three cuisines in that area.

  ##### Zoom: Choose a zip code of intrest and use your mouse scroll wheel to zoom in and out on the map.


#### **Restaurant Map Layer:**

  ##### Filter by Category: Use the filter options to view specific categories of food establishments (e.g., restaurants, cafes, bakeries).
  Select the category from the legend menu to apply the filter.  
  Select all will either select all categories or deselect all categories allowing you to choose the categories you want brought into focus. 

  ##### Mouseover: Hover over different Restaurant markers to show the establishment name, category, and overall rating.


#### **Heat Map Layer:**



## Project Structure


## Caveats

- The following zip codes showed no results in the dataset, meaning there are no restaurants listed in these areas: `19137`, `19133`, `19141`, `19109`.


## Acknowledgments / References:

- Thanks to Yelp for providing the dataset used in this project.
- Inspired by various open-source mapping projects.
- https://opendataphilly.org/- Geojson file for Zipcode map
- https://htmlcolorcodes.com/colors/- HEX codes for zipcode map
