FROM node:8.1

# Start
WORKDIR ./app
COPY ./ ./

# Build
RUN npm install

# Finish
CMD sleep 8 && node models.js
