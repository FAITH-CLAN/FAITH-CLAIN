const express = require('express');
const http = require('http');

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.get('/', (req, res) => {
  res.send('NEGO-CLAN Bot server is running.');
});

module.exports = { app, server, PORT };
