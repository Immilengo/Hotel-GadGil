FROM node:alpine
WORKDIR /usr/scr/app
COPY ./package.json ./
COPY ./package-lock.json ./
RUN npm install
RUN npm i -g sequelize-cli
COPY ./configuration ./configurationrollers ./controllers
COPY ./models ./controllers
COPY ./node_modules ./controllers
COPY ./public ./controllers
COPY ./routes  /.app.js ./.app.js
