#!/bin/bash

# StockVista — Start Local Services (Linux compatible)
PROJECT_DIR="$(cd "$(dirname "$0")" && pwd)"

echo "🚀 Starting StockVista MongoDB & Backend API..."

# Ensure MongoDB is running
mongod --dbpath "$PROJECT_DIR/mongodb-data" --logpath "$PROJECT_DIR/mongodb.log" --fork

echo "✅ MongoDB started."
