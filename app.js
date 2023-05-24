require("dotenv").config();

const express = require("express");
const { auth } = require("express-openid-connect");
const { getAppUrl, getAppPort, getBaseUrl } = require("./src/utils");

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

const tenantName = new URL(ISSUER_BASE_URL).host.split(".")[0];

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

app.use("/", require("./routes/authentication"));
app.use("/", require("./routes/redirect-from-auth0"));

app.get("/test", (request, response) => {
  response.send("OK");
});

app.get("/", (request, response, next) => {
  const isAuthenticated = request.oidc.isAuthenticated();

  const authenticatedLinks = {
    "/logout": "Log out",
    "/profile": "Profile",
  };

  if (showWpLink) {
    authenticatedLinks["wp-api"] = "Post to WP";
  }

  const notAuthenticatedLinks = {
    "/login": "Log in",
  };

  const navLinks = isAuthenticated ? authenticatedLinks : notAuthenticatedLinks;
  navLinks["/test"] = "Test page";
  navLinks["---"] = null;
  navLinks["https://github.com/auth0/express-openid-connect"] =
    "Express OIDC repo";
  navLinks["https://auth0.github.io/express-openid-connect/index.html"] =
    "Express OIDC docs";
  navLinks["https://github.com/joshcanhelp/node-util-app"] = "This app repo";
  navLinks[
    `https://manage.auth0.com/dashboard/us/${tenantName}/applications/${CLIENT_ID}/settings`
  ] = "Application dashboard";

  response.send(`
    <h1>🙇‍♂️ Welcome</h1>
    <p>You are logged ${
      isAuthenticated ? `in as ${request.oidc.user.name}` : "out"
    }</p>
    <ul>
      ${Object.keys(navLinks).reduce((html, href) => {
        const template = navLinks[href]
          ? `<a href="${href}">${navLinks[href]}</a>`
          : href;
        return html + `<li>${template}</li>`;
      }, "")}
    </ul>
  `);
});

app.listen(getAppPort(), () => {
  console.log("Your app is running at " + getBaseUrl());
  if (getBaseUrl() !== getAppUrl()) {
    console.log("Your app is accessible at " + getAppUrl());
  }
});
