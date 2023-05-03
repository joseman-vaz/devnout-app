const router = require("express").Router();

const User = require("../models/User.model");

router.get("/user-create", (req, res) => res.render("users/create"));

router.post("/user-create", (req, res) => {
  const { username } = req.body;
  User.findOne({ username })
    .then((userDocFromDB) => {
      if (!userDocFromDB) {
        // prettier-ignore
        User.create({ username })
        .then(() => res.redirect('/post-create'));
      } else {
        res.render("users/create", {
          message: "It seems you are already registered. ☀️",
        });
        return;
      }
    })
    .catch((err) => console.log(`Error while creating a new user: ${err}`));
});

router.get("/users", (req, res) => {
  User.find()
    .then((usersFromDB) => res.render("users/list", { users: usersFromDB }))
    .catch((err) =>
      console.log(`Error while getting users from the DB: ${err}`)
    );
});

module.exports = router;
