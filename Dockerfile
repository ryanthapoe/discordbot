FROM node:16

WORKDIR /usr/src/app

COPY ./package*.json ./

RUN npm ci

COPY . .

USER node

EXPOSE 3000

CMD ["npm", "start"]