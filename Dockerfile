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

# Expose port 3000 where Node HTTP API & Static frontend are served
EXPOSE 3000

# Run the unified server that provides both the Web app & MCP Stdio/HTTP API
CMD ["node", "mcp_server.js"]
