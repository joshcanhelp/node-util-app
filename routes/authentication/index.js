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
    <h1>Current user:</h1>
    <pre>${JSON.stringify(request.oidc.user, null, 2)}</pre>
  `);
});

module.exports = router;
