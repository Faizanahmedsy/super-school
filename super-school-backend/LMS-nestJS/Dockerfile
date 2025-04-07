# Pull the official base image
FROM node:20.10.0

# Set work directory
WORKDIR /app

# Install dependencies
COPY package*.json ./

RUN npm install -g @nestjs/cli
RUN npm install
# Copy project files
COPY . .

# Expose port 3000
EXPOSE 3000

# Start the application in development mode
CMD ["nest", "start", "--watch"]
