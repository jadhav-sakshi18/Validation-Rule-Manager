const { getRules, updateRule } = require("../services/ruleService");

// GET RULES
const fetchRules = async (req, res) => {
  try {
    const session = req.session.salesforce;

    if (!session?.accessToken) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const rules = await getRules(session);
    res.json({ records: rules });
  } catch (err) {
    console.error(err.response?.data || err.message);
    res.status(500).json({
      message:
        err.response?.data?.[0]?.message ||
        "Failed to fetch rules",
    });
  }
};

// UPDATE RULE
const patchRule = async (req, res) => {
  try {
    const session = req.session.salesforce;

    if (!session?.accessToken) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { id } = req.params;
    const { active, fullName } = req.body;

    await updateRule(session, id, active, fullName);

    res.json({ success: true });
  } catch (err) {
    console.error(err.response?.data || err.message);
    res.status(400).json({
      message:
        err.response?.data?.[0]?.message ||
        "Failed to update rule",
    });
  }
};

module.exports = {
  fetchRules,
  patchRule,
};