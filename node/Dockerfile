FROM node:lts

# Start
ENV NODE_ENV="production"

WORKDIR ./app
COPY ./ ./

# Build
RUN npm install

# Finish
EXPOSE 3000
CMD npm start
