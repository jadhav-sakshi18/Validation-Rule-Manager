const axios = require("axios");
const crypto = require("crypto");

const tokenStore = new Map();

const generateToken = () => crypto.randomBytes(32).toString("hex");

const handleCallback = async (code, req) => {
  const loginBase =
    req.session.loginBase || "https://login.salesforce.com";

  const codeVerifier = req.session.codeVerifier;

  if (!codeVerifier) {
    throw new Error("Missing PKCE code_verifier");
  }

  const tokenRes = await axios.post(
    `${loginBase}/services/oauth2/token`,
    new URLSearchParams({
      grant_type: "authorization_code",
      code,
      client_id: process.env.CLIENT_ID,
      client_secret: process.env.CLIENT_SECRET,
      redirect_uri: process.env.REDIRECT_URI,
      code_verifier: codeVerifier,
    }),
    { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
  );

  const accessToken = tokenRes.data.access_token;
  const instanceUrl = tokenRes.data.instance_url;

  const userInfo = await axios.get(tokenRes.data.id, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  const token = generateToken();
  tokenStore.set(token, {
    accessToken,
    instanceUrl,
    user: {
      username: userInfo.data.username,
      organizationName: userInfo.data.organization_id,
    },
  });

  return token;
};

const getSession = (token) => tokenStore.get(token) || null;

const deleteToken = (token) => tokenStore.delete(token);

module.exports = {
  handleCallback,
  getSession,
  deleteToken,
};
