FROM node:12.0.0

LABEL maintainer="mike_omondi@outlook.com"

WORKDIR /hotel_app

COPY package.json /hotel_app

RUN npm install

COPY . /hotel_app

CMD [ "node" "server.js" ]

EXPOSE 80