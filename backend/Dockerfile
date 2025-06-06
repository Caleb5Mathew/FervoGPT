# backend/Dockerfile

FROM node:18-alpine

# Set working directory
WORKDIR /app

# Install only production dependencies
COPY package*.json ./
RUN npm ci --production

# Copy the rest of the code
COPY . .

# Set environment and expose port
ENV PORT=8000
EXPOSE 8000

# Start the server
CMD ["node", "server.js"]
