const { requiresAuth } = require("express-openid-connect");

const router = require("express").Router();

router.get("/login", async (request, response) => {
  const loginOptions = {
    returnTo: "/profile",
  };

  if (request.query.do_redirect) {
    loginOptions.authorizationParams = {
      do_redirect: "true",
    };
  }

  response.oidc.login(loginOptions);
});

router.get("/clear-session", async (request, response) => {
  request.appSession = undefined;
  response.redirect("/");
});

router.get("/profile", requiresAuth(), (request, response) => {
  response.send(`
    <h1>Profile</h1>
    <p><a href="/">Home</a></p>
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
