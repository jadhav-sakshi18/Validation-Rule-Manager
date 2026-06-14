const { getRules, updateRule } = require("../services/ruleService");
<<<<<<< HEAD
const { getSession } = require("../services/authService");

const fetchRules = async (req, res) => {
  try {
    const token = req.headers["x-auth-token"];
    const session = token ? getSession(token) : null;
=======

// GET RULES
const fetchRules = async (req, res) => {
  try {
    const session = req.session.salesforce;
>>>>>>> 007eb45afc7455d06c1b616ebb94cdd63367660a

    if (!session?.accessToken) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const rules = await getRules(session);
    res.json({ records: rules });
  } catch (err) {
    console.error(err.response?.data || err.message);
    res.status(500).json({
<<<<<<< HEAD
      message: err.response?.data?.[0]?.message || "Failed to fetch rules",
=======
      message:
        err.response?.data?.[0]?.message ||
        "Failed to fetch rules",
>>>>>>> 007eb45afc7455d06c1b616ebb94cdd63367660a
    });
  }
};

<<<<<<< HEAD
const patchRule = async (req, res) => {
  try {
    const token = req.headers["x-auth-token"];
    const session = token ? getSession(token) : null;
=======
// UPDATE RULE
const patchRule = async (req, res) => {
  try {
    const session = req.session.salesforce;
>>>>>>> 007eb45afc7455d06c1b616ebb94cdd63367660a

    if (!session?.accessToken) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { id } = req.params;
    const { active, fullName } = req.body;

    await updateRule(session, id, active, fullName);
<<<<<<< HEAD
=======

>>>>>>> 007eb45afc7455d06c1b616ebb94cdd63367660a
    res.json({ success: true });
  } catch (err) {
    console.error(err.response?.data || err.message);
    res.status(400).json({
<<<<<<< HEAD
      message: err.response?.data?.[0]?.message || "Failed to update rule",
=======
      message:
        err.response?.data?.[0]?.message ||
        "Failed to update rule",
>>>>>>> 007eb45afc7455d06c1b616ebb94cdd63367660a
    });
  }
};

module.exports = {
  fetchRules,
  patchRule,
<<<<<<< HEAD
};
=======
};
>>>>>>> 007eb45afc7455d06c1b616ebb94cdd63367660a
