require("dotenv").config();

const express = require("express");
const { auth } = require("express-openid-connect");

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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
app.use(auth(auth0Config));

app.use("/", require("./routes/authentication"));
app.use("/", require("./routes/redirect-from-auth0"));
app.use("/", require("./routes/wp-api"));

app.get("/", (request, response, next) => {
  const isAuthenticated = request.oidc.isAuthenticated();

  response.send(`
    <p>🙇‍♂️ Welcome</p>
    <p>You are logged ${isAuthenticated ? `in as ${request.oidc.user.name}` : "out"}</p>
    <ul>
      <li>${isAuthenticated ? '<a href="/logout">Log out</a>' : '<a href="/login">Log in</a>' }</li>
      ${isAuthenticated && '<li><a href="/profile">Profile</a></li>' }
      ${process.env.WP_BASE_URL && '<li><a href="/wp-api">Post to WP</a></li>' }
    </ul>
  `);
});

const listener = app.listen(process.env.PORT, () => {
  console.log("Your app is running at " + baseUrl);
});
