-- Create the database and user (run as superuser)
CREATE DATABASE secure_voting;
CREATE USER voting_user WITH ENCRYPTED PASSWORD 'secure_password_2024!';
GRANT ALL PRIVILEGES ON DATABASE secure_voting TO voting_user;

-- Connect to the database and run the schema script
\c secure_voting;

-- Now you can run the init.sql script content here
