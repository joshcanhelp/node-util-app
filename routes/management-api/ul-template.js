const { requiresAuth } = require("express-openid-connect");
const { default: axios } = require("axios");
const router = require("express").Router();

const { tokenCache } = require("./token-cache");
const { getApi2Url } = require("../../src/utils");

router.get("/ul-template", requiresAuth(), async (request, response) => {
  const api2Token = tokenCache.get(getApi2Url());
  if (!api2Token) {
    return response.redirect("/management-api");
  }

  let currentTemplate;
  try {
    const templateResponse = await axios.get(
      getApi2Url("branding/templates/universal-login"),
      {
        headers: {
          Authorization: `Bearer ${api2Token}`,
        },
      }
    );
    currentTemplate = templateResponse.data?.body || "";
  } catch (error) {
    return response.sendTemplate(
      "Management API error",
      `<p>API call failed:</p>
      <blockquote>${error.message}</blockquote>
      <p><a href="/ul-template">&lsaquo;Try again</a></p>`
    );
  }

  response.sendTemplate(
    "Set UL Template",
    `
    <form method="post">
      <p>
        <strong><label for="ul-template">Template</label></strong>
        <textarea name="template" id="ul-template" class="code">${currentTemplate}</textarea>
      </p>
      <p><input type="submit" value="Set template"></p>
    </form>
    `
  );
});

router.post("/ul-template", async (request, response) => {
  const api2Token = tokenCache.get(getApi2Url());
  if (!api2Token) {
    return response.redirect("/management-api");
  }

  try {
    await axios.put(
      getApi2Url("branding/templates/universal-login"),
      request.body,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${api2Token}`,
        },
      }
    );
  } catch (error) {
    return response.sendTemplate(
      "Management API error",
      `<p>API call failed:</p>
      <blockquote>${error.message}</blockquote>
      <p><a href="/${"/ul-template"}">&lsaquo;Try again</a></p>`
    );
  }

  response.redirect("/ul-template");
});

module.exports = router;
