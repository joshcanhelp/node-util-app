const router = require("express").Router();

const { ISSUER_BASE_URL } = process.env;

router.get("/redirect-from-auth0", (request, response, next) => {
  const continueUrl = `${ISSUER_BASE_URL}/continue?state=${req.query.state}&works=yes`;
  res.send(
    `<p>👋 You are in the app during a redirect!</p>
    <p><a href="${continueUrl}">Back to Auth0 👉</a></p>`
  );
});

module.exports = router;
