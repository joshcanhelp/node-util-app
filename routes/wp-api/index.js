const axios = require("axios");
const router = require("express").Router();

const { requiresAuth } = require("express-openid-connect");

const { WP_API_BASE_URL, WP_API_AUDIENCE, WP_API_SCOPES } = process.env;
const postRoute = "/wp-api";
const pageTitle = "WP API";

router.get(postRoute, requiresAuth(), (request, response, next) => {
  const errors = [];
  if (!WP_API_BASE_URL) {
    errors.push(`Missing WP_API_BASE_URL env variable.`);
  }

  if (!WP_API_AUDIENCE) {
    errors.push(`Missing WP_API_AUDIENCE env variable.`);
  }

  if (!WP_API_SCOPES) {
    errors.push(`Missing WP_API_SCOPES env variable.`);
  }

  if (!request.oidc.accessToken) {
    errors.push(`No access token. <a href="/login">Try logging in</a>`);
  }

  try {
    new URL(WP_API_BASE_URL);
  } catch {
    errors.push(`Invalid WP_API_BASE_URL: "${WP_API_BASE_URL}"`);
  }

  if (errors.length) {
    return response.sendTemplate(
      pageTitle,
      "<ul>" +
        errors.reduce((acc, error) => {
          return `${acc} <li class="red">${error}</li>`;
        }, "") +
        "</ul>"
    );
  }

  const { host } = new URL(WP_API_BASE_URL);

  if (request.oidc.user["https://wp/has_account"] !== true) {
    const wpSignUp = new URL(WP_API_BASE_URL);
    wpSignUp.pathname = "wp-login.php";
    wpSignUp.search = "action=register";
    return response.sendTemplate(
      pageTitle,
      `<p><strong>No WordPress account found.</strong> <a href="${wpSignUp.toString()}">Sign up here &rsaquo;</a>`
    );
  }

  response.sendTemplate(
    pageTitle,
    `<p>Posting to <code>${host}</code>
    <form method="post">
      <p><strong>Title</strong><br><input type="text" name="title" required></p>
      <p><strong>Content</strong><br><textarea name="content"></textarea></p>
      <p><strong>Status</strong><br>
        <input type="radio" name="status" value="publish" id="wp_status_publish" checked />
        <label for="wp_status_publish">Publish</label>&nbsp;&nbsp;
        <input type="radio" name="status" value="draft" id="wp_status_draft" />
        <label for="wp_status_draft">Draft</label>
      </p>
      <p><input type="submit" value="Post"></p>
    </form>`
  );
});

router.post(postRoute, requiresAuth(), async (request, response, next) => {
  if (!request.oidc.accessToken) {
    response.sendTemplate(
      pageTitle,
      `No access token. <a href="/login">Try logging in</a>`
    );
  }

  let {
    token_type,
    isExpired,
    refresh,
    access_token,
  } = request.oidc.accessToken;

  if (isExpired()) {
    ({ access_token } = await refresh());
  }

  let apiResponse;
  try {
    apiResponse = await axios.post(
      WP_API_BASE_URL + "/wp-json/wp/v2/posts",
      request.body,
      {
        headers: {
          Authorization: `${token_type} ${access_token}`,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    return response.sendTemplate(
      pageTitle + " error",
      `<p>Post could not be saved. WP response:</p>
      <pre>${
        error.response?.data
          ? JSON.stringify(error.response.data, null, 2)
          : error.message
      }</pre>`
    );
  }

  response.sendTemplate(
    pageTitle,
    `<p>
      <strong>Post is published <a href="${apiResponse.data.link}" target="_blank">here</a></strong>. 
      <a href="${postRoute}">Post another?</a>
    </p>
    <pre>${apiResponse.data}</pre>`
  );
});

module.exports = router;
