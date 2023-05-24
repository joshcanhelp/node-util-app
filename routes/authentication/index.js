const { requiresAuth } = require("express-openid-connect");
const { getAppUrl } = require("../../src/utils");

const router = require("express").Router();

const { CLIENT_ID } = process.env;

router.get("/login", async (request, response) => {
  response.send(`
  <h1>Login</h1>
  <p><a href="/">&lsaquo; Home</a></p>
  <form method="post">
    <p>
      <strong><label>Return to application path</label></strong><br>
      <input type="text" name="return_to" value="/profile">
    </p>
    <p>
      <label>
        <input type="checkbox" name="do_redirect" value="true">
        <strong>Do redirect?</strong>
      </label>
    </p>
    <p><input type="submit" value="Login"></p>
    </form>
    `);
});

router.post("/login", async (request, response) => {
  response.oidc.login({
    returnTo: request.body.return_to || "/profile",
    authorizationParams: {
      do_redirect: request.body.do_redirect,
    },
  });
});

router.get("/logout", async (request, response) => {
  response.send(`
  <h1>Logout</h1>
  <p><a href="/">&lsaquo; Home</a></p>
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
  `);
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

router.get("/clear-session", async (request, response) => {
  request.appSession = undefined;
  response.redirect("/");
});

router.get("/profile", requiresAuth(), (request, response) => {
  response.send(`
    <h1>Profile</h1>
    <p><a href="/">&lsaquo; Home</a></p>
    <h2>User identity</h2>
    <pre>${JSON.stringify(request.oidc.user, null, 2)}</pre>
    ${
      request.oidc.accessToken &&
      `
      <h2>Access Token</h2>
      <pre>${JSON.stringify(request.oidc.accessToken, null, 2)}</pre>
    `
    }
  `);
});

module.exports = router;
