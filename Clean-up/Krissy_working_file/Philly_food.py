from dotenv import load_dotenv
import os
from sqlalchemy import create_engine, text
import pandas as pd

# Specify the path to your .env file
env_path = 'C:\\Users\\Krissy\\Bootcamp\\Project3-PhillyFood\\Krissy_working_file\\PGAdmin.env'

# Verify the path to the .env file
if os.path.exists(env_path):
    print(f"Loading environment variables from: {env_path}")
else:
    print(f".env file not found at: {env_path}")
    exit()

# Load environment variables from PGAdmin.env file
load_dotenv(dotenv_path=env_path)

# Get the database connection details from environment variables
db_user = os.getenv('DB_USER')
db_password = os.getenv('DB_PASSWORD')
db_host = os.getenv('DB_HOST')
db_port = os.getenv('DB_PORT')
db_name = os.getenv('DB_NAME')

# Verify that environment variables are loaded correctly
print(f"DB_USER: {db_user}")
print(f"DB_PASSWORD: {db_password}")
print(f"DB_HOST: {db_host}")
print(f"DB_PORT: {db_port}")
print(f"DB_NAME: {db_name}")

# Path to the SQL file
sql_file_path = 'C:\\Users\\Krissy\\Bootcamp\\Project3-PhillyFood\\Krissy_working_file\\philly_food_tables_schema.sql'

# Read the SQL script from the file
with open(sql_file_path, 'r') as file:
    sql_script = file.read()

# Test database connection and execute SQL script
try:
    engine = create_engine(f'postgresql+psycopg2://{db_user}:{db_password}@{db_host}:{db_port}/{db_name}')
    with engine.connect() as connection:
        # Split and execute each statement separately
        for statement in sql_script.split(';'):
            if statement.strip():
                connection.execute(text(statement))
        print("Tables created successfully")
except Exception as e:
    print("Error creating tables:", e)
    exit()

# Path to your CSV file
csv_file_path = 'C:\\Users\\Krissy\\Bootcamp\\Project3-PhillyFood\\yelp_academic_dataset.csv'

# Try reading the CSV file with different encodings
encodings = ['iso-8859-1']
df = None

for enc in encodings:
    try:
        df = pd.read_csv(csv_file_path, encoding=enc)
        print(f"CSV file loaded successfully with encoding {enc}")
        break
    except Exception as e:
        print(f"Error reading the CSV file with encoding {enc}: {e}")

if df is None:
    print("Failed to read the CSV file with any of the tried encodings.")
    exit()

# Remove duplicates based on business_id
df = df.drop_duplicates(subset=['business_id'])

# Insert the DataFrame into the PostgreSQL tables
try:
    # Insert data into the business table
    df_business = df[['business_id', 'name', 'address', 'city', 'state', 'postal_code', 'latitude', 'longitude', 'stars', 'review_count']]
    df_business.to_sql('business', engine, if_exists='append', index=False)
    
    # Process and insert data into the category table
    df_category = df[['business_id', 'Categories']].copy()
    df_category = df_category.dropna()  # Remove rows where 'Categories' is NaN
    df_category['Categories'] = df_category['Categories'].str.split(', ')
    df_category = df_category.explode('Categories')
    df_category.rename(columns={'Categories': 'category'}, inplace=True)
    df_category.to_sql('category', engine, if_exists='append', index=False)
    
    # Process and insert data into the review table
    df_review = df[['business_id', 'review_count', 'stars']].copy()
    df_review.to_sql('review', engine, if_exists='append', index=False)
    
    print("Data loaded successfully into the PostgreSQL database.")
except Exception as e:
    print("Error loading data into the PostgreSQL database:", e)
