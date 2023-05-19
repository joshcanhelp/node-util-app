require("dotenv").config();

const express = require("express");
const { auth } = require("express-openid-connect");

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const {
  APP_PORT,
  APP_BASE_URL,
  HTTPS_PORT,
  SECRET,
  CLIENT_ID,
  CLIENT_SECRET,
  ISSUER_BASE_URL,
  WP_API_AUDIENCE,
  WP_API_SCOPES,
  WP_API_BASE_URL,
} = process.env;

const port = APP_PORT || 3000;
const baseUrl = APP_BASE_URL || `http://localhost:${port}`;
const appUrl = HTTPS_PORT
  ? baseUrl.replace("http://", "https://").replace(APP_PORT, HTTPS_PORT)
  : baseUrl;

const auth0Config = {
  auth0Logout: true,
  authRequired: false,
  secret: SECRET,
  baseURL: appUrl,
  clientID: CLIENT_ID,
  clientSecret: CLIENT_SECRET,
  issuerBaseURL: ISSUER_BASE_URL,
  routes: {
    login: false,
  },
  authorizationParams: {
    response_type: "code",
  },
};

let showWpLink = false;
if (WP_API_AUDIENCE && WP_API_SCOPES && WP_API_BASE_URL) {
  auth0Config.authorizationParams = {
    response_type: "code",
    audience: WP_API_AUDIENCE,
    scope: `openid email profile ${WP_API_SCOPES}`,
  };
  app.use("/", require("./routes/wp-api"));
  showWpLink = true;
}

app.use(auth(auth0Config));

app.use("/", require("./routes/authentication"));
app.use("/", require("./routes/redirect-from-auth0"));

app.get("/", (request, response, next) => {
  const isAuthenticated = request.oidc.isAuthenticated();

  response.send(`
    <p>🙇‍♂️ Welcome</p>
    <p>You are logged ${
      isAuthenticated ? `in as ${request.oidc.user.name}` : "out"
    }</p>
    <ul>
      ${
        isAuthenticated
          ? '<li><a href="/logout">Log out</a></li>'
          : '<li><a href="/login">Log in</a></li><li><a href="/login?do_redirect=true">Log in + redirect</a></li>'
      }
      ${isAuthenticated ? '<li><a href="/clear-session">Clear app session</a></li><li><a href="/profile">Profile</a></li>' : ""}
      ${
        showWpLink && isAuthenticated
          ? '<li><a href="/wp-api">Post to WP</a></li>'
          : ""
      }
    </ul>
  `);
});

app.listen(APP_PORT, () => {
  console.log("Your app is running at " + baseUrl);
  if (HTTPS_PORT) {
    console.log("Your app is accessible at " + appUrl);
  }
});
