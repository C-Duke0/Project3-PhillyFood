import pandas as pd
from collections import Counter

# Path to your CSV file
csv_file_path = 'C:\\Users\\Krissy\\Bootcamp\\Project3-PhillyFood\\yelp_academic_dataset.csv'

# Load the CSV data into a DataFrame
df = pd.read_csv(csv_file_path, encoding='iso-8859-1')

# Display the DataFrame to ensure it is loaded correctly
print(df.head())

# Print the column names to ensure they are correct
print(df.columns)

# Filter out rows where 'Categories' is NaN
df = df.dropna(subset=['Categories'])

# Create a DataFrame with 'postal_code' and 'Categories'
df = df[['postal_code', 'Categories']]

# Split categories and explode into separate rows
df['Categories'] = df['Categories'].str.split(', ')
df = df.explode('Categories')

# Group by postal code and get the most common cuisine
most_common_cuisine = df.groupby('postal_code')['Categories'].apply(lambda x: Counter(x).most_common(1)[0][0])

# Create a DataFrame for the results
df_most_common = most_common_cuisine.reset_index()
df_most_common.columns = ['postal_code', 'most_common_cuisine']

# Display the results
print(df_most_common.head())

# Path to the output JSON file
output_json_file_path = 'C:\\Users\\Krissy\\Bootcamp\\Project3-PhillyFood\\most_common_cuisine_by_zip.json'

# Save the DataFrame to a JSON file
df_most_common.to_json(output_json_file_path, orient='records')

print(f"Most common cuisine data saved to {output_json_file_path}")