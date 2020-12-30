require("dotenv").config();

const express = require("express");
const { auth } = require("express-openid-connect");

const port = process.env.PORT || 3030;
const baseUrl = process.env.APP_BASE_URL || `http://localhost:${port}`;
const auth0Config = {
  required: false,
  auth0Logout: true,
  appSession: {
    secret: process.env.APP_SECRET,
  },
  baseURL: baseUrl,
  clientID: process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET,
  issuerBaseURL: process.env.ISSUER_BASE_URL,
  handleCallback: function (req, res, next) {
    if (req.openid._req.openidTokens.id_token) {
      console.log("ID token:");
      console.log(req.openid._req.openidTokens.id_token);
      const tokenBody = req.openid._req.openidTokens.id_token.split(".")[1];
      console.log(JSON.parse(Buffer.from(tokenBody, "base64").toString()));
    }

    if (req.openid._req.openidTokens.access_token) {
      console.log("Access token:");
      console.log(req.openid._req.openidTokens.access_token);
      const accessTokenBody = req.openid._req.openidTokens.access_token.split(".")[1];
      console.log(JSON.parse(Buffer.from(accessTokenBody, "base64").toString()));
    }
    next();
  },
};

if (process.env.API_AUDIENCE && process.env.API_SCOPES) {
  auth0Config.authorizationParams = {
    response_type: 'code',
    audience: process.env.API_AUDIENCE,
    scope: `openid email profile ${process.env.API_SCOPES}`
  }
}

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
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
    <p><a href="${continueUrl}">Back to Auth0 👉</a></p>`);
});

const listener = app.listen(process.env.PORT, () => {
  console.log("Your app is listening on port " + listener.address().port);
});
