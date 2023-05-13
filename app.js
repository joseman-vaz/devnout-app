// ℹ️ Gets access to environment variables/settings
// https://www.npmjs.com/package/dotenv
require("dotenv").config();

// ℹ️ Connects to the database
require("./db");

// Handles http requests (express is node js framework)
// https://www.npmjs.com/package/express
const express = require("express");

// Handles the handlebars
// https://www.npmjs.com/package/hbs
const hbs = require("hbs");

hbs.registerHelper("ifCond", function (v1, v2, options) {
  if (v1 === v2) {
    return options.fn(this);
  }
  return options.inverse(this);
});
hbs.registerHelper("isEqual", function (a, b) {
  return a === b;
});
hbs.registerHelper("eq", function (a, b, options) {
  if (a === b) {
    return options.fn(this);
  } else {
    return options.inverse(this);
  }
});

const app = express();

// ℹ️ This function is getting exported from the config folder. It runs most pieces of middleware
require("./config")(app);

const capitalize = require("./utils/capitalize");
const projectName = "devnout";

app.locals.appTitle = `${capitalize(projectName)} created with IronLauncher`;
app.use(function (req, res, next) {
  if (req.session.currentUser) {
    res.locals.user = req.session.currentUser;
  }
  next();
});
// 👇 Start handling routes here
const indexRoutes = require("./routes/index.routes");
app.use("/", indexRoutes);

const authRoutes = require("./routes/auth.routes");
app.use("/auth", authRoutes);

const userRoutes = require("./routes/user.routes");
app.use("/", userRoutes);

const postRoutes = require("./routes/post.routes");
app.use("/", postRoutes);

const commentRoutes = require("./routes/comment.routes");
app.use("/", commentRoutes);

const privateRouter = require("./routes/auth.routes"); // <== has to be added
app.use("/private", privateRouter);

// ❗ To handle errors. Routes that don't exist or errors that you handle in specific routes
require("./error-handling")(app);

module.exports = app;
