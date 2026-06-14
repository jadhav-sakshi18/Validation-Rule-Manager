const axios = require("axios");

const handleCallback = async (code, req) => {
  const loginBase = req.session.loginBase || "https://login.salesforce.com";
  const codeVerifier = req.session.codeVerifier;

  if (!codeVerifier) {
    throw new Error("Missing PKCE code_verifier");
  }

  try {
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
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    const accessToken = tokenRes.data.access_token;
    const instanceUrl = tokenRes.data.instance_url;

    const userInfo = await axios.get(tokenRes.data.id, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    req.session.salesforce = {
      accessToken,
      instanceUrl,
      user: {
        username: userInfo.data.username,
        organizationName: userInfo.data.organization_id,
      },
    };

  } catch (error) {
    throw error;
  }
};

module.exports = {
  handleCallback,
};