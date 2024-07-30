FROM node:20

# Create and change to the app directory
WORKDIR /usr/src/app

# Copy the package.json and package-lock.json files to the working directory
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code to the working directory
COPY . .

# Build the application
RUN npm run build

# Expose the port the app runs on
EXPOSE 3000

# Define the environment variable
ENV NODE_ENV=production

# Run database migrations
RUN npm run migrate

# Start the application
CMD ["node", "./dist_backend/server.js"]
