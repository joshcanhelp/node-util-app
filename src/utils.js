const {
  API2_AUDIENCE,
  APP_PORT,
  APP_BASE_URL,
  HTTPS_PORT,
  ISSUER_BASE_URL,
} = process.env;

const getApi2Audience = () => {
  return API2_AUDIENCE ? API2_AUDIENCE : ISSUER_BASE_URL + "/api/v2/";
};

const getAppPort = () => APP_PORT || 3000;

const getAppUrl = () =>
  HTTPS_PORT
    ? getBaseUrl().replace("http://", "https://").replace(APP_PORT, HTTPS_PORT)
    : getBaseUrl();

const getBaseUrl = () => APP_BASE_URL || `http://localhost:${getAppPort()}`;

const getDashboardUrl = (path = "") => {
  const dashboard = `https://manage.auth0.com/dashboard/us/${getTenantName()}/`;
  return dashboard + path.replace(/^(\/)/, "");
};

const getTenantName = () => new URL(ISSUER_BASE_URL).host.split(".")[0];

const nowInSeconds = () => Math.round(new Date().getTime() / 1000);

module.exports = {
  getApi2Audience,
  getAppPort,
  getAppUrl,
  getBaseUrl,
  getDashboardUrl,
  getTenantName,
  nowInSeconds,
};
