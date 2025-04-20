FROM alpine:3.7 as build
RUN apk add --no-cache nodejs npm

# Install the necessary packages
WORKDIR /app

RUN apt-get update && apt-get install -y

# Copy the source code
COPY package.json /app

RUN npm install

COPY . /app

# Expose the port
EXPOSE 3000

# Start the application
CMD ["npm", "start"]