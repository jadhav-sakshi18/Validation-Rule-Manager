require("dotenv").config();
const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;

// Temporary global state (Consider express-session for production)
let session = {
  accessToken: null,
  instanceUrl: null,
  user: null,
};

// LOGIN
app.get("/login", (req, res) => {
  res.redirect(
    `${process.env.LOGIN_URL}/services/oauth2/authorize?response_type=code&client_id=${process.env.CLIENT_ID}&redirect_uri=${process.env.REDIRECT_URI}`
  );
});

// CALLBACK
app.get("/callback", async (req, res) => {
  const { code } = req.query;
  try {
    const token = await axios.post(
      `${process.env.LOGIN_URL}/services/oauth2/token`,
      new URLSearchParams({
        grant_type: "authorization_code",
        code,
        client_id: process.env.CLIENT_ID,
        client_secret: process.env.CLIENT_SECRET,
        redirect_uri: process.env.REDIRECT_URI,
      })
    );

    session.accessToken = token.data.access_token;
    session.instanceUrl = token.data.instance_url;

    // Fetch User Info using the ID token endpoint to populate the UI panel
    const userInfo = await axios.get(token.data.id, {
      headers: { Authorization: `Bearer ${session.accessToken}` },
    });
    
    session.user = {
      username: userInfo.data.username,
      organizationName: userInfo.data.organization_id, // Fallback identity info
    };

    res.redirect(process.env.FRONTEND_URL);
  } catch (err) {
    console.error("Auth Error:", err.response?.data || err.message);
    res.status(500).send("Authentication failed.");
  }
});

// STATUS
app.get("/status", (req, res) => {
  res.json({
    loggedIn: !!session.accessToken,
    instanceUrl: session.instanceUrl || null,
    user: session.user || null
  });
});

// LOGOUT
app.get("/logout", (req, res) => {
  session = { accessToken: null, instanceUrl: null, user: null };
  res.json({ success: true });
});

// GET RULES - Fixed SOQL query syntax for Tooling API
app.get("/validation-rules", async (req, res) => {
  if (!session.accessToken) return res.status(401).json({ message: "Unauthorized" });

  try {
    const result = await axios.get(
      `${session.instanceUrl}/services/data/v57.0/tooling/query`,
      {
        params: {
          // Description, ErrorMessage, etc., cannot be queried at the root like this for all objects 
          // without risking target scope errors. This is the universally supported Tooling API query string:
          q: `SELECT Id, ValidationName, Active, Description, ErrorMessage, EntityDefinition.QualifiedApiName FROM ValidationRule`,
        },
        headers: { Authorization: `Bearer ${session.accessToken}` },
      }
    );

    // Because Salesforce requires the 'errorConditionFormula' to patch but won't let us query it 
    // in bulk easily without an Entity filter, we dynamically fetch the individual rule details 
    // if they are modified, OR we can pull them directly by enhancing our frontend hook.
    res.json({ records: result.data.records });
  } catch (err) {
    console.error("Salesforce Fetch Error:", err.response?.data || err.message);
    res.status(500).json({ 
      message: err.response?.data?.[0]?.message || "Failed to fetch validation rules" 
    });
  }
});

// UPDATE - Re-submitting mandatory structural fields to bypass the Salesforce validation exception
// UPDATE - Automatically retrieves current rule properties to merge and bypass exceptions safely
app.patch("/validation-rules/:id", async (req, res) => {
  if (!session.accessToken) return res.status(401).json({ message: "Unauthorized" });
  const { id } = req.params;
  const { active, fullName } = req.body; 

  try {
    // 1. Fetch the absolute fresh rule state from Salesforce to get its Formula and Messages
    const currentRuleRes = await axios.get(
      `${session.instanceUrl}/services/data/v57.0/tooling/sobjects/ValidationRule/${id}`,
      { headers: { Authorization: `Bearer ${session.accessToken}` } }
    );

    const currentMetadata = currentRuleRes.data.Metadata;

    // 2. Merge existing mandatory metadata parameters with your new Active flag status
    await axios.patch(
      `${session.instanceUrl}/services/data/v57.0/tooling/sobjects/ValidationRule/${id}`,
      {
        Metadata: { 
          ...currentMetadata,
          active: active,
          fullName: fullName
        },
      },
      { headers: { Authorization: `Bearer ${session.accessToken}` } }
    );

    res.json({ success: true });
  } catch (err) {
    console.error("SF Error Context:", JSON.stringify(err.response?.data || err.message));
    const errMsg = err.response?.data?.[0]?.message || "Failed to update rule.";
    res.status(400).json({ message: errMsg });
  }
});

app.listen(PORT, () => {
  console.log("Server running on port", PORT);
});