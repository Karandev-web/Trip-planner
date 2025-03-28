CREATE DATABASE IF NOT EXISTS dyj_sql; -- Create the database if it doesn't exist
USE dyj_sql; -- Use the newly created database


CREATE TABLE IF NOT EXISTS users (

    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL
);
