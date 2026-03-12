FROM node:alpine

RUN mkdir -p /usr/src/client
WORKDIR /usr/src/client

COPY package.json /usr/src/client/
COPY package-lock.json /usr/src/client/

RUN npm install

COPY . /usr/src/client/

CMD ["npm", "start"]