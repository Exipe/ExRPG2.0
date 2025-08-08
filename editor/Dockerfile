FROM node:17-alpine
RUN npm install -g typescript@latest
RUN npm install -g http-server

# build engine
WORKDIR /engine
COPY ./engine/package*.json .
RUN npm install
COPY ./engine .
RUN npm run build

# build editor
WORKDIR /editor
COPY ./editor/package*.json .
RUN npm install
COPY ./editor .
ARG RES_PATH
RUN npm run build

# start web server
WORKDIR ./public
CMD http-server -c-1 --cors='*'