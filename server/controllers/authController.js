const { handleCallback } = require("../services/authService");
const crypto = require("crypto");

const login = (req, res) => {
  const env = req.query.env;

  let loginBase = "https://login.salesforce.com";
  if (env === "sandbox") {
    loginBase = "https://test.salesforce.com";
  }

  const codeVerifier = crypto.randomBytes(32).toString("hex");
  const codeChallenge = crypto
    .createHash("sha256")
    .update(codeVerifier)
    .digest("base64url");

  req.session.regenerate((error) => {
    if (error) {
      return res.status(500).send("Session error");
    }

    req.session.codeVerifier = codeVerifier;
    req.session.loginBase = loginBase;

    req.session.save((saveError) => {
      if (saveError) {
        return res.status(500).send("Session save error");
      }

      res.redirect(
        `${loginBase}/services/oauth2/authorize?response_type=code` +
          `&client_id=${process.env.CLIENT_ID}` +
          `&redirect_uri=${process.env.REDIRECT_URI}` +
          `&code_challenge=${codeChallenge}` +
          `&code_challenge_method=S256` +
          `&prompt=login` +
          `&scope=full refresh_token`
      );
    });
  });
};

const callback = async (req, res) => {
  try {
    if (!req.query.code) {
      return res.status(400).send("Missing code");
    }

    await handleCallback(req.query.code, req);
    res.redirect(process.env.FRONTEND_URL);

  } catch {
    res.status(500).send("Authentication failed");
  }
};

const status = (req, res) => {
  const session = req.session.salesforce;

  res.json({
    loggedIn: !!session?.accessToken,
    instanceUrl: session?.instanceUrl,
    user: session?.user,
  });
};

const logout = (req, res) => {
  req.session.destroy((error) => {
    if (error) {
      return res.status(500).send("Logout failed");
    }
    res.json({ success: true });
  });
};

module.exports = {
  login,
  callback,
  status,
  logout,
};