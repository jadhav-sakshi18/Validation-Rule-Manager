<<<<<<< HEAD
const { handleCallback, getSession, deleteToken } = require("../services/authService");
=======
const { handleCallback } = require("../services/authService");
>>>>>>> 007eb45afc7455d06c1b616ebb94cdd63367660a
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
<<<<<<< HEAD
        `&client_id=${process.env.CLIENT_ID}` +
        `&redirect_uri=${process.env.REDIRECT_URI}` +
        `&code_challenge=${codeChallenge}` +
        `&code_challenge_method=S256` +
        `&prompt=login` +
        `&scope=full refresh_token`
=======
          `&client_id=${process.env.CLIENT_ID}` +
          `&redirect_uri=${process.env.REDIRECT_URI}` +
          `&code_challenge=${codeChallenge}` +
          `&code_challenge_method=S256` +
          `&prompt=login` +
          `&scope=full refresh_token`
>>>>>>> 007eb45afc7455d06c1b616ebb94cdd63367660a
      );
    });
  });
};

const callback = async (req, res) => {
  try {
<<<<<<< HEAD
=======
    if (req.query.error) {
      console.error("OAuth Error:", req.query);
      return res.status(400).send(req.query.error_description);
    }

>>>>>>> 007eb45afc7455d06c1b616ebb94cdd63367660a
    if (!req.query.code) {
      return res.status(400).send("Missing code");
    }

<<<<<<< HEAD
    const token = await handleCallback(req.query.code, req);
    res.redirect(`${process.env.FRONTEND_URL}?authToken=${token}`);

  } catch (err) {
    console.error("Callback error:", err.message);
=======
    // FIX: Extract loginBase from session to ensure token exchange targets the correct endpoint (prevents 503)
    const loginBase = req.session.loginBase || "https://login.salesforce.com";

    // Process the OAuth callback and attach tokens to the session
    await handleCallback(req.query.code, req, loginBase);

    // Explicitly save the session and wait for it to complete
    await new Promise((resolve, reject) => {
      req.session.save((err) => {
        if (err) {
          return reject(err);
        }
        resolve();
      });
    });

    // Safe to redirect now that the session store has finished writing
    res.redirect(process.env.FRONTEND_URL);

  } catch (error) {
    console.error("FULL ERROR:", error.response?.data || error.message);
>>>>>>> 007eb45afc7455d06c1b616ebb94cdd63367660a
    res.status(500).send("Authentication failed");
  }
};

const status = (req, res) => {
<<<<<<< HEAD
  const token = req.headers["x-auth-token"];
  const session = token ? getSession(token) : null;

  res.json({
    loggedIn: !!(session?.accessToken),
=======
  const session = req.session.salesforce;

  res.json({
    loggedIn: !!session?.accessToken,
>>>>>>> 007eb45afc7455d06c1b616ebb94cdd63367660a
    instanceUrl: session?.instanceUrl,
    user: session?.user,
  });
};

const logout = (req, res) => {
<<<<<<< HEAD
  const token = req.headers["x-auth-token"];
  if (token) deleteToken(token);
  res.json({ success: true });
=======
  req.session.destroy((error) => {
    if (error) {
      return res.status(500).send("Logout failed");
    }
    res.json({ success: true });
  });
>>>>>>> 007eb45afc7455d06c1b616ebb94cdd63367660a
};

module.exports = {
  login,
  callback,
  status,
  logout,
<<<<<<< HEAD
};
=======
};
>>>>>>> 007eb45afc7455d06c1b616ebb94cdd63367660a
