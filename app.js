require("dotenv").config();

const express = require("express");
const http = require("http");
const { auth } = require("express-openid-connect");

const port = process.env.PORT || 3000;
const baseUrl = `http://localhost:${port}`;
const auth0Config = {
  required: false,
  auth0Logout: true,
  appSession: {
    secret: process.env.APP_SECRET,
  },
  baseURL: baseUrl,
  clientID: process.env.CLIENT_ID,
  issuerBaseURL: process.env.ISSUER_BASE_URL,
};

const app = express();
app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(auth(auth0Config));

app.get("/", (req, res, next) => {
  const logInOut =
    "<p>You are " +
    (req.isAuthenticated()
      ? `Logged in as ${req.openid.user.name}. <a href="/logout">Log out 👉</a>`
      : 'Logged out. <a href="/login">Log in 👉</a>') +
    "</p>";

  res.send(`
    <p>🙇‍♂️ Welcome</p>
    ${logInOut}
  `);
});

app.get("/redirect-rule", (req, res, next) => {
  const continueUrl = `${process.env.ISSUER_BASE_URL}/continue?state=${req.query.state}&works=yes`;
  res.send(`
    <p>👋 You are in the app during a redirect!</p>
    <p><a href="${continueUrl}">Back to Auth0 👉</a></p>`
  );
});

http.createServer(app).listen(port, () => {
  console.log(`Listening at ${baseUrl}`);
});
