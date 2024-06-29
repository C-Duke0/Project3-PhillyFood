create table yelp_restaurants (
	Business_id varchar(30) not null primary key,
	Name varchar(30) not null,
	Address varchar(30) not null,
	City varchar(30) not null,
	State varchar(30) not null,
	Postal_code int,
	Latitude float not null,
	Longitude float,
	Stars real,
	Review_count int,
	Attributes JSON,
	Categories varchar(30)
);

