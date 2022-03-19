FROM node:17-alpine
RUN npm install -g typescript
RUN npm install -g http-server
WORKDIR /engine
COPY ./engine .
RUN npm install
RUN npm link
WORKDIR /editor
COPY ./editor .
RUN npm install
RUN npm link exrpg
RUN npm run build
WORKDIR ./public
CMD http-server -c-1 --cors='*'