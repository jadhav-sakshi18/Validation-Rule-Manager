
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });
const express = require("express");
const cors = require("cors");
const session = require("express-session");

const authController = require("./controllers/authController");
const ruleController = require("./controllers/ruleController");

const app = express();

const isProduction = process.env.NODE_ENV === "production";

app.set("trust proxy", 1);

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: isProduction,
      sameSite: isProduction ? "none" : "lax",
      httpOnly: true,
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