FROM node:17-alpine
RUN npm install -g typescript

WORKDIR /server
COPY ./package*.json .
RUN npm install
COPY . .
RUN npm run build

CMD npm start