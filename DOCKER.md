# Box Packing Microservice - Docker Guide

##  Docker Usage

### Quick Start

```bash
# Build the image
docker build -t box-packing-api .

# Run the container
docker run -p 3000:3000 box-packing-api

# Run in background
docker run -d -p 3000:3000 --name box-packing box-packing-api
```

### Development

For development, run the application locally:

```bash
# Install dependencies
npm install

# Run in development mode
npm run start:dev
```