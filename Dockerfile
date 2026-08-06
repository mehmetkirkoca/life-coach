FROM node:20-alpine

WORKDIR /app

# Copy package configuration files
COPY package*.json ./

# Install project dependencies
RUN npm install

# Copy all project source code
COPY . .

# Build the frontend Vue app production bundle (creates ./dist directory)
RUN npm run build

# Make entrypoint script executable
RUN chmod +x entrypoint.sh

# Run the entrypoint script that configures MCP and starts the unified server
ENTRYPOINT ["/app/entrypoint.sh"]
