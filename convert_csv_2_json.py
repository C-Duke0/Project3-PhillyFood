import pandas as pd

# Path to your CSV file
csv_file_path = 'C:\\Users\\Krissy\\Bootcamp\\Project3-PhillyFood\\yelp_academic_dataset.csv'

# Read the CSV file into a DataFrame
df = pd.read_csv(csv_file_path)

# Convert the DataFrame to a JSON file
json_file_path = 'C:\\Users\\Krissy\\Bootcamp\\Project3-PhillyFood\\yelp_academic_dataset.json'
df.to_json(json_file_path, orient='records', lines=True)

print(f"CSV file has been converted to JSON and saved to {json_file_path}")