FROM mhart/alpine-node:16.4.2

RUN mkdir -p /app
ENV PORT 3000

WORKDIR /app

COPY package.json /app
COPY yarn.lock /app

RUN yarn install --production=false

COPY . /app
RUN yarn build

FROM mhart/alpine-node:slim-16.4.2

COPY --from=0 /app .

EXPOSE 3000
CMD [ "./node_modules/.bin/next", "start" ]
