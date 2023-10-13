const { nowInSeconds } = require("../../src/utils");

const cache = {};

const tokenCache = {
  get: (aud) =>
    cache[aud] && cache[aud].expiresAt > nowInSeconds()
      ? cache[aud].token
      : null,
  getAll: () => {
    Object.keys(cache).forEach((aud) => {
      if (cache[aud].expiresAt < nowInSeconds()) {
        delete cache[aud];
      }
    });
    return cache;
  },
  set: (audience, token, expiresIn) => {
    cache[audience] = {
      token,
      expiresAt: expiresIn + nowInSeconds() - 30,
    };
  },
};

module.exports = {
  tokenCache,
};
