const { requiresAuth } = require("express-openid-connect");
const { getAppUrl, nowInSeconds } = require("../../src/utils");
const { default: axios } = require("axios");

const router = require("express").Router();

const { API2_CLIENT_ID, API2_CLIENT_SECRET, ISSUER_BASE_URL } = process.env;

const api2TokenCache = {
  token: "",
  expires_at: 0,
};

const appPath = "/management-api";

router.get("/api2", async (request, response) => {
  response.redirect(appPath);
});

router.get(appPath, requiresAuth(), async (request, response) => {
  if (api2TokenCache.expires_at > nowInSeconds()) {
    return response.sendTemplate(
      "Management API token",
      `<pre>${api2TokenCache.token}</pre>`
    );
  }

  api2TokenCache.token = "";
  api2TokenCache.expires_at = 0;

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

    api2TokenCache.token = token.data.access_token;
    api2TokenCache.expires_at = token.data.expires_in + nowInSeconds() - 30;

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
