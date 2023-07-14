const { requiresAuth } = require("express-openid-connect");
const { default: axios } = require("axios");
const router = require("express").Router();

const { tokenCache } = require("./token-cache");
const { jwtIoLink } = require("../../src/template");

const { API2_CLIENT_ID, API2_CLIENT_SECRET, ISSUER_BASE_URL } = process.env;

const appPath = "/management-api";

router.get("/api2", async (request, response) => {
  response.redirect(appPath);
});

router.get(appPath, requiresAuth(), async (request, response) => {
  if (tokenCache.get()) {
    return response.sendTemplate(
      "Management API token",
      `<p>
        <strong>Management API token cached!</strong> 
        <a href="#" data-to-clipboard="${tokenCache.get()}">[Copy]</a>
        ${ jwtIoLink(tokenCache.get()) }
        <ul>
          <li><a href="/ul-template">Set UL Template</a>
        </ul>
      </p>`
    );
  }

  response.sendTemplate(
    "Get Management API token",
    `
    <form method="post">
      <p>
        <strong><label for="m2m-client-id">M2M Client ID</label></strong>
        <input type="text" name="client_id" id="m2m-client-id" value="${API2_CLIENT_ID}">
      </p>
      <p>
        <strong><label for="m2m-client-secret">M2M Client Secret</label></strong>
        <input type="password" name="client_secret" id="m2m-client-secret" value="${API2_CLIENT_SECRET}">
      </p>
      <p>
        <strong><label for="m2m-audience">M2M Audience</label></strong>
        <input type="text" name="audience" id="m2m-audience" value="${
          ISSUER_BASE_URL && ISSUER_BASE_URL.replace(/(.*)\/$/, "") + "/api/v2/"
        }">
      </p>
      <p><input type="submit" value="Get token"></p>
    </form>
    `
  );
});

router.post(appPath, async (request, response) => {
  const postData = {
    grant_type: "client_credentials",
    client_id: request.body.client_id,
    client_secret: request.body.client_secret,
    audience: request.body.audience,
    scope: request.body.scope || undefined,
  };

  try {
    const token = await axios.post(
      ISSUER_BASE_URL.replace(/(.*)\/$/, "") + "/oauth/token",
      postData
    );

    tokenCache.set(token.data.access_token, token.data.expires_in);

    return response.redirect(appPath);
  } catch (error) {
    return response.sendTemplate(
      "Management API error",
      `<p>API call failed:</p>
      <blockquote>${error.message}</blockquote>
      <p><a href="/${appPath}">&lsaquo;Try again</a></p>`
    );
  }
});

module.exports = router;
