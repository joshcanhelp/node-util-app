const { requiresAuth } = require("express-openid-connect");
const { default: axios } = require("axios");
const router = require("express").Router();

const { tokenCache } = require("./token-cache");
const { jwtIoLink } = require("../../src/template");
const { getApi2Url } = require("../../src/utils");

const { API2_CLIENT_ID, API2_CLIENT_SECRET, ISSUER_BASE_URL } = process.env;

const appPath = "/m2m-api";

router.get("/api2", async (request, response) => {
  response.redirect(appPath);
});

router.get("/management-api", async (request, response) => {
  response.redirect(appPath);
});

router.get(appPath, requiresAuth(), async (request, response) => {
  const cachedTokens = tokenCache.getAll();
  const tokenAudiences = Object.keys(cachedTokens);

  const template = [];

  if (tokenAudiences.length) {
    template.push("<h2>Cached tokens</h2>");
    template.push("<ul>");
    tokenAudiences.forEach((aud) =>
      template.push(
        `<li><code>${aud}</code> <a href="#" data-to-clipboard="${
          cachedTokens[aud].token
        }">[copy]</a> ${jwtIoLink(cachedTokens[aud].token)}</li>`
      )
    );
    template.push("</ul>");
    template.push("<hr>");
  }

  if (tokenAudiences.includes(getApi2Url())) {
    template.push("<h2>Management API</h2>");
    template.push(
      '<ul><li><a href="/ul-template">Set UL Template</a></li></ul>'
    );
    template.push("<hr>");
  }

  template.push(`
    <form method="post">
      <p>
        <strong><label for="m2m-client-id">M2M Client ID</label></strong>
        <input type="text" name="client_id" id="m2m-client-id" value="${API2_CLIENT_ID}" required>
      </p>
      <p>
        <strong><label for="m2m-client-secret">M2M Client Secret</label></strong>
        <input type="password" name="client_secret" id="m2m-client-secret" value="${API2_CLIENT_SECRET}" required>
      </p>
      <p>
        <strong><label for="m2m-audience">M2M Audience</label></strong>
        <input type="text" name="audience" id="m2m-audience" value="${getApi2Url()}" required>
      </p>
      <p>
        <strong><label for="m2m-scope">Scope</label></strong>
        <input type="text" name="scope" id="m2m-scope">
      </p>
      <p><input type="submit" value="Get token"></p>
    </form>
    `);

  response.sendTemplate("M2M", template.join(""));
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
    const token = await axios.post(ISSUER_BASE_URL + "/oauth/token", postData);
    tokenCache.set(
      request.body.audience,
      token.data.access_token,
      token.data.expires_in
    );
  } catch (error) {
    return response.sendTemplate(
      "Management API error",
      `<p>API call failed:</p>
      <blockquote>${error.message}</blockquote>
      <p><a href="/${appPath}">&lsaquo;Try again</a></p>`
    );
  }

  return response.redirect(appPath);
});

module.exports = router;
