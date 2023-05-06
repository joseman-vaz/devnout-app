const express = require("express");
const router = express.Router();
const isLoggedIn = require("../middleware/isLoggedIn");

/* GET home page */
router.get("/", (req, res, next) => {
  res.render("index", {
    title: "index",
    isIndex: false,
  });
});
router.get("/about", (req, res, next) => {
  res.render("about", {
    title: "about",
    isIndex: true,
  });
});

router.get("/signup", (req, res, next) => {
  res.render("auth/signup");
});
router.get("/private/dashboard", isLoggedIn, (req, res, next) => {
  res.render("private/dashboard");
});

module.exports = router;
