const express = require("express");
const router = express.Router();
const isLoggedIn = require("../middleware/isLoggedIn");

/* GET home page */
router.get("/", (req, res, next) => {
  res.render("index");
});

router.get("/signup", (req, res, next) => {
  res.render("auth/signup");
});
router.get("/private/dashboard", isLoggedIn, (req, res, next) => {
  res.render("private/dashboard");
});

module.exports = router;
