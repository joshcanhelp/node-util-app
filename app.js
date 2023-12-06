require("dotenv").config();

const express = require("express");
const { auth } = require("express-openid-connect");
const { getAppUrl, getAppPort, getBaseUrl } = require("./src/utils");
const { getHeader, getFooter, jwtIoLink } = require("./src/template");

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const { SECRET, CLIENT_ID, CLIENT_SECRET, ISSUER_BASE_URL } = process.env;

const auth0Config = {
  idpLogout: true,
  auth0Logout: true,
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
    scope: "openid email profile",
  },
};

app.use(auth(auth0Config));
app.use((request, response, next) => {
  response.sendTemplate = (title, html) =>
    response.send(
      getHeader(request, title) + (html || "<h2>🤖</h2>") + getFooter()
    );
  next();
});
app.use(express.static("public"));

app.use("/", require("./routes/m2m-api"));
app.use("/", require("./routes/m2m-api/ul-template"));
app.use("/", require("./routes/authentication"));
app.use("/", require("./routes/redirect-from-auth0"));
app.use("/", require("./routes/wp-api"));

app.get("/test", (request, response) => {
  response.sendTemplate("OK");
});

app.get("/", (request, response) => {
  response.sendTemplate(
    "Home",
    `
    <h2>ID Token</h2>
    ${
      request.oidc.idToken
        ? `<p>${jwtIoLink(request.oidc.idToken)}</p><pre>${JSON.stringify(
            request.oidc.idTokenClaims,
            null,
            2
          )}</pre>`
        : "No identity found!"
    }
    <h2>Access Token</h2>
    ${
      request.oidc.accessToken
        ? `<p>${jwtIoLink(
            request.oidc.accessToken.access_token
          )}</p><pre>${JSON.stringify(request.oidc.accessToken, null, 2)}</pre>`
        : "No access token found!"
    }
  `
  );
});

app.use((error, request, response, next) => {
  response.send(
    getHeader(request, "ERROR") +
      `<p><strong>Error message:</strong></p>` +
      `<blockquote>${error.message}</blockquote>` +
      `<p><strong>URL params:</strong></p>` +
      `<pre>${JSON.stringify(request.query, null, 2)}</pre>` +
      getFooter()
  );
});

app.listen(getAppPort(), () => {
  if (ISSUER_BASE_URL[ISSUER_BASE_URL.length - 1] === "/") {
    throw new Error("ISSUER_BASE_URL env variable has a trailing slash.");
  }

  console.log("Your app is running at " + getBaseUrl());
  if (getBaseUrl() !== getAppUrl()) {
    console.log("Your app is accessible at " + getAppUrl());
  }
});
