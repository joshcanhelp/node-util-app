const { nowInSeconds } = require("../../src/utils");

const cache = {
  token: null,
  expiresAt: 0,
};

const tokenCache = {
  get: () => (cache.expiresAt < nowInSeconds() ? null : cache.token),
  set: (token, expiresIn) => {
    cache.token = token;
    cache.expiresAt = expiresIn + nowInSeconds() - 30;
  },
};

module.exports = {
  tokenCache,
};
