FROM node:17-alpine
RUN npm install -g typescript
RUN npm install -g http-server

# build engine
WORKDIR /engine
COPY ./engine/package*.json .
RUN npm install
COPY ./engine .
RUN npm run build
RUN npm link

# build game
WORKDIR /game
COPY ./game/package*.json .
RUN npm install
COPY ./game .
RUN npm link exrpg
RUN npm run build-prod

# start web server
WORKDIR ./app
CMD http-server -c-1 --cors='*'