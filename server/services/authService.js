const axios = require("axios");
const { setSession } = require("../utils/session");

const loginUrl = () => {
  return `${process.env.LOGIN_URL}/services/oauth2/authorize?response_type=code&client_id=${process.env.CLIENT_ID}&redirect_uri=${process.env.REDIRECT_URI}`;
};

const handleCallback = async (code) => {
  const tokenRes = await axios.post(
    `${process.env.LOGIN_URL}/services/oauth2/token`,
    new URLSearchParams({
      grant_type: "authorization_code",
      code,
      client_id: process.env.CLIENT_ID,
      client_secret: process.env.CLIENT_SECRET,
      redirect_uri: process.env.REDIRECT_URI,
    })
  );

  const accessToken = tokenRes.data.access_token;
  const instanceUrl = tokenRes.data.instance_url;

  // Get user info
  const userInfo = await axios.get(tokenRes.data.id, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  setSession({
    accessToken,
    instanceUrl,
    user: {
      username: userInfo.data.username,
      organizationName: userInfo.data.organization_id,
    },
  });
};

module.exports = {
  loginUrl,
  handleCallback,
};