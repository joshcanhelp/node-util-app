const { requiresAuth } = require("express-openid-connect");
const { getAppUrl } = require("../../src/utils");

const router = require("express").Router();

const { CLIENT_ID } = process.env;

router.get("/login", async (request, response) => {
  response.sendTemplate("Login", `
  <form method="post">
    <p>
      <strong><label>Return to application path</label></strong><br>
      <input type="text" name="return_to" value="/">
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
  response.sendTemplate("Logout", `
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

router.post("/clear-session", async (request, response) => {
  request.appSession = undefined;
  response.redirect("/");
});

module.exports = router;
