CREATE DATABASE cacheS;

USE cacheS;

CREATE TABLE cache (
  url varchar(1000) PRIMARY KEY,
  time BIGINT(20),
  header varchar(1000)
);
