const {
  API2_BASE_URL,
  APP_PORT,
  APP_BASE_URL,
  HTTPS_PORT,
  ISSUER_BASE_URL,
} = process.env;

const getApi2Url = (path = "") => {
  return (API2_BASE_URL ? API2_BASE_URL : ISSUER_BASE_URL) + "/api/v2/" + path;
};

const getAppPort = () => APP_PORT || 3000;

const getAppUrl = () =>
  HTTPS_PORT
    ? getBaseUrl().replace("http://", "https://").replace(APP_PORT, HTTPS_PORT)
    : getBaseUrl();

const getBaseUrl = () => APP_BASE_URL || `http://localhost:${getAppPort()}`;

const nowInSeconds = () => Math.round(new Date().getTime() / 1000);

module.exports = {
  getApi2Url,
  getAppPort,
  getAppUrl,
  getBaseUrl,
  nowInSeconds,
};
