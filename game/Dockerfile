FROM node:17-alpine
RUN npm install -g typescript
RUN npm install -g http-server
WORKDIR /engine
COPY ./engine .
RUN npm install
RUN npm link
WORKDIR /game
COPY ./game .
RUN npm install
RUN npm link exrpg
RUN npm run build-prod
WORKDIR ./app
CMD http-server -c-1 --cors='*'