const { requiresAuth } = require("express-openid-connect");

const router = require("express").Router();

router.get("/login", async (request, response) => {
  const loginOptions = {
    returnTo: "/profile",
  };
  res.oidc.login(loginOptions);
});

router.get("/profile", requiresAuth(), (request, response) => {
  res.send(`
    <h1>Current user:</h1>
    <pre>${JSON.stringify(req.oidc.user, null, 2)}</pre>
  `);
});

module.exports = router;
