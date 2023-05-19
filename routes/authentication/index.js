const { requiresAuth } = require("express-openid-connect");

const router = require("express").Router();

router.get("/login", async (request, response) => {
  const loginOptions = {
    returnTo: "/profile",
  };
  response.oidc.login(loginOptions);
});

router.get("/profile", requiresAuth(), (request, response) => {
  response.send(`
    <h1>Profile</h1>
    <h2>User identity</h2>
    <pre>${JSON.stringify(request.oidc.user, null, 2)}</pre>
    ${
      request.oidc.accessToken &&
      `
      <h2>Access Token</h2>
      <pre>${JSON.stringify(request.oidc.accessToken, null, 2)}</pre>
    `
    }
    <p><a href="/">Home</a></p>
  `);
});

module.exports = router;
