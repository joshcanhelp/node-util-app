const axios = require("axios");
const router = require("express").Router();

const { requiresAuth } = require("express-openid-connect");

const { WP_BASE_URL, API_AUDIENCE, API_SCOPES } = process.env;
const postRoute = "/wp-api";

router.get(postRoute, requiresAuth(), (request, response, next) => {
  if (!WP_BASE_URL) {
    return response.send(`Missing WP_BASE_URL env variable.`);
  }

  if (!API_AUDIENCE) {
    return response.send(`Missing API_AUDIENCE env variable.`);
  }

  if (!API_SCOPES) {
    return response.send(`Missing API_SCOPES env variable.`);
  }

  if (!request.oidc.accessToken) {
    return response.send(`No access token. <a href="/login">Try logging in</a>`);
  }

  const { host } = new URL(API_AUDIENCE);

  if (request.oidc.user["https://wp/has_account"] !== true) {
    const wpSignUp = new URL(WP_BASE_URL);
    wpSignUp.pathname = "wp-login.php";
    wpSignUp.search = "action=register";
    return response.send(`
      <p>No WordPress account found. <a href="">Sign up here</a>
      <p><a href="/">Back home</a></p>
    `);
  }

  response.send(
    `<p>Posting to <code>${host}</code>
    <form method="POST">
      <p><strong>Title</strong><br><input name="title" required></p>
      <p><strong>Content</strong><br><textarea name="content"></textarea></p>
      <p><strong>Status</strong><br>
        <input type="radio" name="status" value="publish" id="wp_status_publish" checked />
        <label for="wp_status_publish">Publish</label>
        <input type="radio" name="status" value="draft" id="wp_status_draft" />
        <label for="wp_status_draft">Draft</label>
      </p>
      <p><input type="submit" value="Post"></p>
    </form>
    <p><a href="/">Back home</a></p>`
  );
});

router.post(postRoute, requiresAuth(), async (request, response, next) => {
  if (!request.oidc.accessToken) {
    return response.send(`No access token. <a href="/login">Try logging in</a>`);
  }

  let { token_type, isExpired, refresh, access_token } = request.oidc.accessToken;

  if (isExpired()) {
    ({ access_token } = await refresh());
  }

  let apiResponse;
  try {
    apiResponse = await axios.post(
      WP_BASE_URL + "/wp-json/wp/v2/posts",
      request.body,
      {
        headers: {
          Authorization: `${token_type} ${access_token}`,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    return response.json(error.response?.data || error.message);
  }

  response.send(
    `<p>Post is published <a href="${apiResponse.data.link}" target="_blank">here</a></p>
    <p><a href="${postRoute}">Post another 👉</a></p>`
  );
});

module.exports = router;
