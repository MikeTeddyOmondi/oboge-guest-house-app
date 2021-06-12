FROM node:14.16.0

LABEL maintainer="MikeTeddyOmondi | mike_omondi@outlook.com"

WORKDIR /src

COPY package.json /src

RUN npm install

COPY . /src

USER 1000

EXPOSE 80

CMD [ "node" "server.js" ]

