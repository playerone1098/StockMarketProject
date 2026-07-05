#!/bin/bash

# Start MongoDB locally for development
echo "Starting MongoDB..."

# Create data directory if it doesn't exist
mkdir -p mongodb-data

# Start MongoDB
mongod --dbpath ./mongodb-data --logpath ./mongodb.log --fork

echo "MongoDB started on port 27017"
echo "Data directory: ./mongodb-data"
echo "Log file: ./mongodb.log"
