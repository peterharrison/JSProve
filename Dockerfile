FROM richarvey/nginx-nodejs

MAINTAINER jwholdsworth

RUN mkdir -p /app

COPY css/ /app/css
COPY js/ /app/js
COPY lib/ /app/lib
COPY music/ /app/music
COPY package.json /app
COPY Gruntfile.js /app
COPY index.html /app
COPY nginx-vhost.conf /etc/nginx/sites-available/default.conf

WORKDIR /app
RUN npm install
RUN /app/node_modules/grunt-cli/bin/grunt

EXPOSE 80

ENTRYPOINT ["/usr/sbin/nginx"]
