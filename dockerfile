# ==========================================
# STAGE 1: Build the Frontend (React + Vite)
# ==========================================
# Use lightweight Node.js 20 Alpine Linux image and name this stage "frontend-builder"
FROM node:20-alpine as frontend-builder

# Copy all files from the local Frontend folder into /app inside the container
COPY ./Frontend /app

# Set /app as the working directory for the following commands
WORKDIR /app

# Install all frontend npm dependencies
RUN npm install

# Build the production-ready static files (creates the /app/dist folder)
RUN npm run build

# ==========================================
# STAGE 2: Setup & Run the Backend Server
# ==========================================
# Start a fresh lightweight Node.js 20 Alpine image for the final container
FROM node:20-alpine

# Copy all files from the local Backend folder into /app inside the container
COPY ./Backend /app

# Set /app as the working directory
WORKDIR /app

# Install only the backend npm dependencies
RUN npm install

# Copy the built frontend files from Stage 1 (/app/dist) into Backend's public folder (/app/public)
# so the Express server can serve the React app directly
COPY --from=frontend-builder /app/dist /app/public

# Start the Node.js backend server when the container runs
CMD ["node", "server.js"]