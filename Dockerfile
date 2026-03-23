FROM node:24-alpine AS build

WORKDIR /app

COPY . .

RUN npm ci && \
    npm run build

FROM nginx:stable-alpine

COPY ./.docker/nginx/webapp.conf /etc/nginx/conf.d/default.conf

COPY --from=build /app/dist /usr/share/nginx/html
