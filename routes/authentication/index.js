const { requiresAuth } = require("express-openid-connect");
const { getAppUrl } = require("../../src/utils");

const router = require("express").Router();

const { CLIENT_ID, WP_API_AUDIENCE,
  WP_API_SCOPES,
  WP_API_BASE_URL } = process.env;

router.get("/login", async (request, response) => {
  response.sendTemplate(
    "Login",
    `
  <form method="post">
    <p>
      <strong><label>Return to application path</label></strong>
      <input type="text" name="return_to" value="/">
    </p>
    <p>
      <strong><label>Response type</label></strong>
      <input type="text" name="response_type" value="code">
    </p>
    <p>
      <strong><label>Audience</label></strong>
      <input type="text" name="audience" value="">
      ${WP_API_AUDIENCE && `Found <code>${WP_API_AUDIENCE}</code>`}
    </p>
    <p>
      <strong><label>Scope</label></strong>
      <input type="text" name="scope" value="openid email profile">
      ${WP_API_SCOPES && `Found <code>${WP_API_SCOPES}</code>`}
    </p>
    <p>
      <label>
        <input type="checkbox" name="do_redirect" value="true">
        <strong>Do redirect?</strong>
      </label>
    </p>
    <p><input type="submit" value="Login"></p>
    </form>
    `
  );
});

router.post("/login", async (request, response) => {
  const loginOptions = {
    returnTo: request.body.return_to,
    authorizationParams: {
      do_redirect: request.body.do_redirect,
      response_type: request.body.response_type,
      audience: request.body.audience,
      scope: request.body.scope,
    },
  };

  if (request.query.do_wp === "true") {
    loginOptions.authorizationParams = {
      response_type: "code",
      audience: WP_API_AUDIENCE,
      scope: `openid email profile ${WP_API_SCOPES}`,
    };
  }

  response.oidc.login(loginOptions);
});

router.get("/logout", async (request, response) => {
  response.sendTemplate(
    "Logout",
    `
  <form method="post" action="clear-session">
    <p><input type="submit" value="Clear session"></p>
  </form>
  <form method="post">
    <p>
      <strong><label>Return to URL</label></strong><br>
      <input type="text" name="return_to" value="${getAppUrl()}">
    </p>
    <p>
      <strong><label>Client ID</label></strong><br>
      <input type="text" name="client_id" value="${CLIENT_ID}">
    </p>
    <p>
      <label> 
        <input type="checkbox" name="federated" value="true">
        <strong>Federated?</strong>
      </label>
    </p>
    <p><input type="submit" value="Logout"></p>
  </form>
  `
  );
});

router.post("/logout", async (request, response) => {
  response.oidc.logout({
    returnTo: request.body.return_to || "/",
    logoutParams: {
      federated: request.body.federated || undefined,
      client_id: request.body.client_id || undefined,
    },
  });
});

router.post("/clear-session", async (request, response) => {
  request.appSession = undefined;
  response.redirect("/");
});

module.exports = router;
