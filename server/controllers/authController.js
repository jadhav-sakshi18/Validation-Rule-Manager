const {
  loginUrl,
  handleCallback,
} = require("../services/authService");
const {
  getSession,
  clearSession,
} = require("../utils/session");

// LOGIN
const login = (req, res) => {
  res.redirect(loginUrl());
};

// CALLBACK
const callback = async (req, res) => {
  try {
    await handleCallback(req.query.code);
    res.redirect(process.env.FRONTEND_URL);
  } catch (err) {
    console.error(err.response?.data || err.message);
    res.status(500).send("Authentication failed");
  }
};

// STATUS
const status = (req, res) => {
  const session = getSession();
  res.json({
    loggedIn: !!session.accessToken,
    instanceUrl: session.instanceUrl,
    user: session.user,
  });
};

// LOGOUT
const logout = (req, res) => {
  clearSession();
  res.json({ success: true });
};

module.exports = {
  login,
  callback,
  status,
  logout,
};