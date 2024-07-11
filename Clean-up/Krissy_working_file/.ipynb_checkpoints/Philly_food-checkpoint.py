from dotenv import load_dotenv
import os
from sqlalchemy import create_engine
import pandas as pd

# Load environment variables from .env file
load_dotenv()

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

# Test database connection
try:
    engine = create_engine(f'postgresql+psycopg2://{db_user}:{db_password}@{db_host}:{db_port}/{db_name}')
    with engine.connect() as connection:
        result = connection.execute("SELECT 1")
        for row in result:
            print("Connection successful:", row)
except Exception as e:
    print("Error connecting to the database:", e)
    exit()

# Path to your CSV file
csv_file_path = 'C:\\Users\\Krissy\\Bootcamp\\Project3-PhillyFood\\yelp_academic_dataset.csv'

# Read the CSV file into a DataFrame
try:
    df = pd.read_csv(csv_file_path)
    print("CSV file loaded successfully")
except Exception as e:
    print("Error reading the CSV file:", e)
    exit()

# Specify the table name
table_name = 'philly_food_tables'

# Insert the DataFrame into the PostgreSQL table
try:
    df.to_sql(table_name, engine, if_exists='replace', index=False)
    print("Data loaded successfully into the PostgreSQL database.")
except Exception as e:
    print("Error loading data into the PostgreSQL database:", e)
