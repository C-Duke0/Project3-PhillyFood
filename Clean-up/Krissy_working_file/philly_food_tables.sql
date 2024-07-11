-- Drop tables if they exist
DROP TABLE IF EXISTS review CASCADE;
DROP TABLE IF EXISTS category CASCADE;
DROP TABLE IF EXISTS business CASCADE;

-- Business Table
CREATE TABLE business (
    business_id VARCHAR NOT NULL PRIMARY KEY,
    name VARCHAR NOT NULL,
    address VARCHAR,
    city VARCHAR,
    state VARCHAR,
    postal_code VARCHAR,
    latitude FLOAT,
    longitude FLOAT,
    stars FLOAT NOT NULL,
    review_count INT NOT NULL
);

-- Category Table
CREATE TABLE category (
    category_id SERIAL NOT NULL PRIMARY KEY,
    business_id VARCHAR NOT NULL REFERENCES business(business_id),
    category VARCHAR NOT NULL
);

-- Review Table
CREATE TABLE review (
    review_id SERIAL NOT NULL PRIMARY KEY,
    business_id VARCHAR NOT NULL REFERENCES business(business_id),
    review_count INT NOT NULL,
    stars FLOAT NOT NULL
);