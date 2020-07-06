require('dotenv').config();

const express = require('express');
const http = require('http');
const { auth } = require('express-openid-connect');

const port = process.env.PORT || 3000;
const baseUrl = `http://localhost:${port}`;
const auth0Config = {
  required: false,
  auth0Logout: true,
  appSession: {
    secret: process.env.APP_SECRET
  },
  baseURL: baseUrl,
  clientID: process.env.CLIENT_ID,
  issuerBaseURL: process.env.ISSUER_BASE_URL,
};

const app = express();
app.use(express.json());
app.use(auth(auth0Config));

app.get("/", (req, res, next) => {
  res.send(`
    Welcome 🙇‍♂️<br>
    You are ${req.isAuthenticated() ? 'logged in' : 'logged out'}.
  `);
});

http.createServer(app).listen(port, () => {
  console.log(`Listening at ${baseUrl}`);
});
