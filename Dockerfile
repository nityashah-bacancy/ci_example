FROM node

WORKDIR /app

COPY ./url-shortner/app/package.json .

RUN npm install

COPY ./url-shortner/app/ .

EXPOSE 3000

CMD ["node", "server.js"]
