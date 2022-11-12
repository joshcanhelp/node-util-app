const axios = require("axios");
const router = require("express").Router();

const { requiresAuth } = require("express-openid-connect");

const { WP_BASE_URL, API_AUDIENCE, API_SCOPES } = process.env;
const postRoute = "/wp-api";

router.get(postRoute, requiresAuth(), (req, res, next) => {
  if (!WP_BASE_URL) {
    return res.send(`Missing WP_BASE_URL env variable.`);
  }

  if (!API_AUDIENCE) {
    return res.send(`Missing API_AUDIENCE env variable.`);
  }

  if (!API_SCOPES) {
    return res.send(`Missing API_SCOPES env variable.`);
  }

  if (!req.oidc.accessToken) {
    return res.send(`No access token. <a href="/login">Try logging in</a>`);
  }

  const { host } = new URL(API_AUDIENCE);

  res.send(
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

router.post(postRoute, requiresAuth(), async (req, res, next) => {

  if (!req.oidc.accessToken) {
    return res.send(`No access token. <a href="/login">Try logging in</a>`);
  }
  
  let { token_type, isExpired, refresh, access_token } = req.oidc.accessToken;

  if (isExpired()) {
    ({ access_token } = await refresh());
  }

  let apiResponse;
  try {
    apiResponse = await axios.post(
      WP_BASE_URL + "/wp-json/wp/v2/posts",
      req.body,
      {
        headers: {
          Authorization: `${token_type} ${access_token}`,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    return res.json(error.response?.data || error.message);
  }

  res.send(
    `<p>Post is published <a href="${apiResponse.data.link}" target="_blank">here</a></p>
    <p><a href="${postRoute}">Post another 👉</a></p>`
  );
});

module.exports = router;