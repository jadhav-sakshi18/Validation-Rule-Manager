require("dotenv").config();
const express = require("express");
const cors = require("cors");
const session = require("express-session");

const authController = require("./controllers/authController");
const ruleController = require("./controllers/ruleController");

const app = express();

// 1. Detect environment
const isProduction = process.env.NODE_ENV === "production";

// 2. If behind a reverse proxy (Heroku, Render, AWS ELB) in production, trust it
if (isProduction) {
  app.set("trust proxy", 1);
}

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      // CRITICAL FIX: 'secure: true' requires HTTPS. Turning it off for localhost development.
      secure: isProduction,
      // 'lax' allows the cookie to be sent back safely after the Salesforce redirect on localhost
      sameSite: isProduction ? "none" : "lax",
    },
  })
);

app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  })
);

app.use(express.json());

// ROUTES
app.get("/login", authController.login);
app.get("/callback", authController.callback);
app.get("/status", authController.status);
app.get("/logout", authController.logout);

app.get("/validation-rules", ruleController.fetchRules);
app.patch("/validation-rules/:id", ruleController.patchRule);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
