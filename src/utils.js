const { APP_PORT, APP_BASE_URL, HTTPS_PORT, ISSUER_BASE_URL } = process.env;

const getTenantName = () => new URL(ISSUER_BASE_URL).host.split(".")[0];

const getAppPort = () => APP_PORT || 3000;

const getBaseUrl = () => APP_BASE_URL || `http://localhost:${getAppPort()}`;

const getAppUrl = () =>
  HTTPS_PORT
    ? getBaseUrl().replace("http://", "https://").replace(APP_PORT, HTTPS_PORT)
    : getBaseUrl();

const getDashboardUrl = (path = "") => {
  const dashboard = `https://manage.auth0.com/dashboard/us/${getTenantName()}/`;
  return dashboard + path.replace(/^(\/)/, "");
};

module.exports = {
  getAppPort,
  getAppUrl,
  getBaseUrl,
  getDashboardUrl,
  getTenantName,
};
