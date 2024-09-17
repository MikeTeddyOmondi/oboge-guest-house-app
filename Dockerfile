FROM node:16.15.0-alpine

LABEL maintainer="@MikeTeddyOmondi | Rancko Solutions LLC"

WORKDIR /src

COPY package.json . 

RUN npm install

ARG NODE_ENV
RUN if [ "$NODE_ENV" = "development" ]; \
        then npm install; \
        else npm install --only=production; \
        fi

COPY . ./

USER 1000

ENV PORT 3000

EXPOSE $PORT

CMD ["node", "server.js"]