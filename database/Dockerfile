FROM node:lts

# Start
WORKDIR ./app
COPY ./ ./

# Build
RUN npm install

# Finish
CMD sleep 8 && node models.js
