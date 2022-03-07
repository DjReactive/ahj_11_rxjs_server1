const http = require('http');
const Koa = require('koa');
const cors = require('@koa/cors');
const koaBody = require('koa-body');
const koaStatic = require('koa-static');
const app = new Koa();
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const { faker } = require('@faker-js/faker');
const public = path.join(__dirname, '/public');

app.use(cors());
app.use(koaStatic(public));
app.use(koaBody({
    text: true,
    urlencoded: true,
    multipart: true,
    json: true,
  }),
);

let allMessages = [];
let newMessages = [];
function generateMessage() {
  const uuid = uuidv4();
  const msgObj = {
    id: uuid,
    from: faker.internet.email(),
    subject: `Hello from ${faker.name.findName()}`,
    body: 'Long message body here, Long message body here',
    received: Date.now(),
  };
  newMessages.push(msgObj);
  allMessages.push(msgObj);
}

//for (let i = 0; i < 3; i++) generateMessage();

setInterval(() => {
  generateMessage();
  if (allMessages.length >= 20) {
    allMessages = [];
    newMessages = [];
  };
}, 5000);

function getAllMessages() {
  let response = { status: 'ok', timestamp: Date.now(), };
  if (allMessages.length < 1) {
    response.status = 'error';
    response.error = 'Messages not founded';
  }
  response.messages = allMessages;
  return response;
}

function getUnreadMessages() {
  let response = { status: 'ok', timestamp: Date.now(), };
  if (newMessages.length < 1) {
    response.status = 'error';
    response.error = 'No new messages';
  }
  response.messages = newMessages;
  newMessages = [];
  return response;
}

app.use(async ctx => {
  //const query = (ctx.request.method === 'POST') ? ctx.request.body : ctx.request.query;
  let uuid;
  switch (ctx.request.url) {
    case '/messages/unread':
      ctx.response.body = JSON.stringify(getUnreadMessages());
      ctx.response.status = 200;
      return;
    case '/messages/all':
      ctx.response.body = JSON.stringify(getAllMessages());
      ctx.response.status = 200;
      return;
    default:
      ctx.response.body = ctx.request.query.method;
      ctx.response.status = 400;
      return;
  }
});
const port = process.env.PORT || 7070;
const server = http.createServer(app.callback()).listen(port);
