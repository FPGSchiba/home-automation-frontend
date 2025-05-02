FROM node:lts-alpine AS build
WORKDIR /app

ARG SENTRY_AUTH_TOKEN

COPY . .

RUN npm install

RUN export SENTRY_AUTH_TOKEN && echo "SENTRY_AUTH_TOKEN set"

RUN apk add --no-cache openssl && \
    openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
    -keyout tls.key -out tls.crt \
    -subj "/CN=localhost"

RUN npm run build

RUN cat /app/public/assets/index.js

FROM nginx:stable-alpine

COPY --from=build /app/public/assets /bin/www
COPY --from=build /app/tls.key /etc/ssl/tls.key
COPY --from=build /app/tls.crt /etc/ssl/tls.crt

COPY nginx/nginx.conf /etc/nginx/conf.d/default.conf

ENV HOSTNAME=example.com

EXPOSE 80
EXPOSE 443

CMD [ "nginx", "-g", "daemon off;" ]