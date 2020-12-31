require("dotenv").config();

const express = require("express");
const { auth, requiresAuth } = require("express-openid-connect");
const axios = require("axios");

const port = process.env.PORT || 3030;
const baseUrl = process.env.APP_BASE_URL || `http://localhost:${port}`;
const auth0Config = {
  authRequired: false,
  auth0Logout: true,
  secret: process.env.SECRET,
  baseURL: baseUrl,
  clientID: process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET,
  issuerBaseURL: process.env.ISSUER_BASE_URL
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
app.use(express.urlencoded({ extended: true }));
app.use(auth(auth0Config));

app.get("/", (req, res, next) => {
  const logInOut = req.oidc.isAuthenticated()
    ? `Logged in as ${req.oidc.user.name}. <a href="/logout">Log out 👉</a>`
    : 'Logged out. <a href="/login">Log in 👉</a>';

  res.send(`
    <p>🙇‍♂️ Welcome</p>
    <p>You are ${logInOut}</p>
    <p><a href="/post-to-wp">Post to WP</a></p>
  `);
});

app.get("/redirect-rule", (req, res, next) => {
  const continueUrl = `${process.env.ISSUER_BASE_URL}/continue?state=${req.query.state}&works=yes`;
  res.send(
    `<p>👋 You are in the app during a redirect!</p>
    <p><a href="${continueUrl}">Back to Auth0 👉</a></p>`
  );
});

app.get("/post-to-wp", requiresAuth(), (req, res, next) => {
  if (!process.env.WP_API_CREATE_POST_URL) {
    return res.send(`Missing WP_API_CREATE_POST_URL env variable.`);
  }

  res.send(
    `<form method="POST">
      <p><strong>Title</strong><br><input name="title" required></p>
      <p><strong>Content</strong><br><textarea name="content"></textarea></p>
      <p><input type="submit" value="Post"></p>
    </form>
    <p><a href="${baseUrl}">Back home</a></p>`
  );
});

app.post("/post-to-wp", async (req, res, next) => {
  let { token_type, isExpired, refresh, access_token } = req.oidc.accessToken;
  if (isExpired()) {
    ({ access_token } = await refresh());
  }

  let apiResponse;
  try {
    apiResponse = await axios.post(
      process.env.WP_API_CREATE_POST_URL,
      req.body,
      {
        headers: {
          Authorization: `${token_type} ${access_token}`,
          "Content-Type": "application/json",
        },
      });
  } catch (error) {
    return res.send(`<p>Error creating the post: ${error.message}</p>`);
  }

  res.send(
    `<p>Post is published <a href="${apiResponse.data.link}" target="_blank">here</a></p>
    <p><a href="/post-to-wp">Post another 👉</a></p>`
  );
});

const listener = app.listen(process.env.PORT, () => {
  console.log("Your app is listening on port " + listener.address().port);
});
