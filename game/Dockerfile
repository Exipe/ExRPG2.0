FROM node:17-alpine
RUN npm install -g typescript
RUN npm install -g http-server

# build engine
WORKDIR /engine
COPY ./engine/package*.json .
RUN npm install
COPY ./engine .
RUN npm run build

# build game
WORKDIR /game
COPY ./game/package*.json .
RUN npm install
COPY ./game .
ARG PROTOCOL
ARG ADDRESS
ARG PORT
RUN npm run build

# start web server
WORKDIR ./app
CMD http-server -c-1 --cors='*' --proxy http://localhost:8080?