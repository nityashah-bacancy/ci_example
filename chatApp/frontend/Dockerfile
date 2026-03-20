FROM node:alpine AS base_image

WORKDIR /app 

COPY package.json package-lock.json .

RUN  npm ci

COPY . .

ARG VITE_BASE_URL
ENV VITE_BASE_URL=$VITE_BASE_URL  

ARG VITE_SOCKET_URL
ENV VITE_SOCKET_URL=$VITE_SOCKET_URL



RUN echo "VITE_BASE_URL=$VITE_BASE_URL"
RUN echo "BASE_URLLL=$BASE_URLLL"

RUN npm run build


FROM nginx:alpine

ENV HARSH=iwashere

COPY --from=base_image /app/dist /usr/share/nginx/html/ 

