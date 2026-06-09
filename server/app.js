require("dotenv").config();
const express = require("express");
const cors = require("cors");

const authController = require("./controllers/authController");
const ruleController = require("./controllers/ruleController");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// AUTH
app.get("/login", authController.login);
app.get("/callback", authController.callback);
app.get("/status", authController.status);
app.get("/logout", authController.logout);

// RULES
app.get("/validation-rules", ruleController.fetchRules);
app.patch("/validation-rules/:id", ruleController.patchRule);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});