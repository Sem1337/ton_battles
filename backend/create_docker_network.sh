#!/bin/bash

# Create Docker network
docker network create mynetwork

source .env
# Run PostgreSQL container
docker run --name my_postgres_container -e POSTGRES_USER="$POSTGRES_USER" -e POSTGRES_PASSWORD="$POSTGRES_PASSWORD" -e POSTGRES_DB="$POSTGRES_DB" --network=mynetwork -p 5432:5432 -d postgres

echo "docker network and container created"
echo "PostgreSQL is running on port 5432"

