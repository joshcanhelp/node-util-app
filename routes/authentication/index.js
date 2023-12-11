const { getAppUrl } = require("../../src/utils");

const router = require("express").Router();

const {
  CLIENT_ID,
  CLIENT_SECRET,
  ISSUER_BASE_URL,
  RO_LOGIN_REALM,
  WP_API_AUDIENCE,
  WP_API_SCOPES,
} = process.env;

router.get("/login", async (request, response) => {
  response.sendTemplate(
    "Login",
    `
    <h2>Redirect Login</h2>
    <p>
      Logging into <code>${ISSUER_BASE_URL}</code><br>
      Client ID <code>${CLIENT_ID}</code>
    </p>
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
        <strong><label for="login-audience">Audience</label></strong>
        <input type="text" id="login-audience" name="audience" value="">
        ${
          WP_API_AUDIENCE &&
          `Found <code data-input-replace="login-audience">${WP_API_AUDIENCE}</code>`
        }
      </p>
      <p>
        <strong><label for="login-scope">Scope</label></strong>
        <input type="text" id="login-scope" name="scope" value="openid email profile">
        ${
          WP_API_SCOPES &&
          `Found <code data-input-update="login-scope">${WP_API_SCOPES}</code>`
        }
      </p>
      <p>
        <label>
          <input type="checkbox" name="do_redirect" value="true">
          <strong>Do redirect?</strong>
        </label>
      </p>
      <p>
        <label>
          <input type="checkbox" name="do_mfa" value="true">
          <strong>Do MFA?</strong>
        </label>
      </p>
      <p>
        <label>
          <input type="checkbox" name="do_rules_failure" value="true">
          <strong>Do Rules failure?</strong>
        </label>
      </p>
      <p>
        <label>
          <input type="checkbox" name="do_actions_failure" value="true">
          <strong>Do Actions failure?</strong>
        </label>
      </p>
      <p><input type="submit" value="Login"></p>
    </form>
    <hr>
    <h2>RO Login</h2>
    <form method="post" action="${ISSUER_BASE_URL}/oauth/token">
      <p>
        <strong><label for="ro-login-connection">Connection</label></strong>
        <input type="text" id="ro-login-connection" name="realm" value="">
        ${
          RO_LOGIN_REALM &&
          `Found <code data-input-replace="ro-login-connection">${RO_LOGIN_REALM}</code>`
        }
      </p>
      <p>
        <strong><label>Identifier</label></strong>
        <input type="text" name="username" value="">
      </p>
      <p>
        <strong><label>Password</label></strong>
        <input type="password" name="password" value="">
      </p>
      <p>
        <input type="hidden" name="grant_type" value="http://auth0.com/oauth/grant-type/password-realm">
        <input type="hidden" name="client_id" value="${CLIENT_ID}">
        <input type="hidden" name="client_secret" value="${CLIENT_SECRET}">
        <input type="submit" value="Login">
      </p>
    </form>
    `
  );
});

router.post("/login", async (request, response) => {
  const loginOptions = {
    returnTo: request.body.return_to,
    authorizationParams: {
      do_redirect: request.body.do_redirect,
      do_mfa: request.body.do_mfa,
      do_rules_failure: request.body.do_rules_failure,
      do_actions_failure: request.body.do_actions_failure,
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

router.get("/step-up", async (request, response) => {
  response.oidc.login({
    returnTo: "/",
    authorizationParams: {
      do_step_up: "true",
      // acr_values: "http://schemas.openid.net/pape/policies/2007/06/multi-factor"
    },
  });
});

module.exports = router;
