require("dotenv").config();

const express = require("express");
const { auth, requiresAuth } = require("express-openid-connect");

const redirectRouter = require("./routes/redirect-from-auth0");
const wpApiRouter = require("./routes/wp-api");

const port = process.env.PORT || 3000;
const baseUrl = process.env.APP_BASE_URL || `http://localhost:${port}`;
const auth0Config = {
  authRequired: false,
  auth0Logout: true,
  secret: process.env.SECRET,
  baseURL: baseUrl,
  clientID: process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET,
  issuerBaseURL: process.env.ISSUER_BASE_URL,
};

if (process.env.API_AUDIENCE && process.env.API_SCOPES) {
  auth0Config.authorizationParams = {
    response_type: "code",
    audience: process.env.API_AUDIENCE,
    scope: `openid email profile ${process.env.API_SCOPES}`,
  };
}

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(auth(auth0Config));

app.use("/", redirectRouter);
app.use("/", wpApiRouter);

app.get("/", (req, res, next) => {
  const logInOut = req.oidc.isAuthenticated()
    ? `Logged in as ${req.oidc.user.name}. <a href="/logout">Log out 👉</a>`
    : 'Logged out. <a href="/login">Log in 👉</a>';

  res.send(`
    <p>🙇‍♂️ Welcome</p>
    <p>You are ${logInOut}</p>
    <ul>
      <a href="/wp-api">Post to WP</a>
    </ul>
  `);
});

app.get("/profile", requiresAuth(), (req, res) => {
  res.send(`
    <h1>Current user:</h1>
    <pre>${JSON.stringify(req.oidc.user, null, 2)}</pre>
  `);
});

const listener = app.listen(process.env.PORT, () => {
  console.log("Your app is running at " + baseUrl);
});
