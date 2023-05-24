require("dotenv").config();

const express = require("express");
const { auth } = require("express-openid-connect");
const { getAppUrl, getAppPort, getBaseUrl } = require("./src/utils");
const { getHeader, getFooter } = require("./src/template");

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const {
  SECRET,
  CLIENT_ID,
  CLIENT_SECRET,
  ISSUER_BASE_URL,
  WP_API_AUDIENCE,
  WP_API_SCOPES,
  WP_API_BASE_URL,
} = process.env;

const auth0Config = {
  idpLogout: true,
  authRequired: false,
  secret: SECRET,
  baseURL: getAppUrl(),
  clientID: CLIENT_ID,
  clientSecret: CLIENT_SECRET,
  issuerBaseURL: ISSUER_BASE_URL,
  routes: {
    login: false,
    logout: false,
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
app.use((request, response, next) => {
  response.sendTemplate = (title, html) =>
    response.send(getHeader(request, title) + html + getFooter());
  next();
});

app.use("/", require("./routes/authentication"));
app.use("/", require("./routes/redirect-from-auth0"));

app.get("/test", (request, response) => {
  response.sendTemplate("OK");
});

app.get("/", (request, response, next) => {
  response.sendTemplate(
    "Home",
    `
    <h2>ID Token</h2>
    ${
      request.oidc.user
        ? `
      <p><a href="https://jwt.io/#debugger-io?token=${
        request.oidc.idToken
      }">jwt.io &rsaquo;</a></p>
      <pre>${JSON.stringify(request.oidc.idTokenClaims, null, 2)}</pre>
      `
        : "No identity found!"
    }
    <h2>Access Token</h2>
    ${
      request.oidc.accessToken
        ? `
        <p><a href="https://jwt.io/#debugger-io?token=${
          request.oidc.accessToken.access_token
        }">jwt.io &rsaquo;</a></p>
        <pre>${JSON.stringify(request.oidc.accessToken, null, 2)}</pre>
        `
        : "No access token found!"
    }
  `
  );
});

app.listen(getAppPort(), () => {
  console.log("Your app is running at " + getBaseUrl());
  if (getBaseUrl() !== getAppUrl()) {
    console.log("Your app is accessible at " + getAppUrl());
  }
});
