# docker build -t <your username>/random-server .
# docker run -p 1220:3100 -d <your username>/random-server

FROM node:8-alpine

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package*.json ./

# If you are building your code for production
RUN npm install --only=production

# Bundle app source
COPY . .

EXPOSE 3100

CMD [ "npm", "start" ]