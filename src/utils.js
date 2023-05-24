const {
  APP_PORT,
  APP_BASE_URL,
  HTTPS_PORT,
} = process.env;

const getAppPort = () => APP_PORT || 3000;

const getBaseUrl = () => APP_BASE_URL || `http://localhost:${getAppPort()}`;

const getAppUrl = () => HTTPS_PORT
    ? getBaseUrl().replace("http://", "https://").replace(APP_PORT, HTTPS_PORT)
    : getBaseUrl();

module.exports = {
  getAppPort,
  getBaseUrl,
  getAppUrl
}