require("dotenv").config();
const express = require("express");
const cors = require("cors");
const session = require("express-session");

const authController = require("./controllers/authController");
const ruleController = require("./controllers/ruleController");

const app = express();

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: true,
      sameSite: "none",
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
