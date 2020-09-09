FROM node:12.0.0

LABEL maintainer="mike_omondi@outlook.com"

WORKDIR /admin_app

COPY package.json /admin_app

RUN npm install

COPY . /admin_app

CMD [ "node" "server.js" ]

EXPOSE 8080