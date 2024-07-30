FROM node:20

# Create and change to the app directory
WORKDIR /usr/src/app

# Copy the package.json and package-lock.json files to the working directory
COPY package*.json ./

ARG DB_USERNAME
ARG DB_PASSWORD
ARG DB_NAME
ARG DB_HOST

ENV DB_USERNAME=${DB_USERNAME}
ENV DB_PASSWORD=${DB_PASSWORD}
ENV DB_NAME=${DB_NAME}
ENV DB_HOST=${DB_HOST}

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
