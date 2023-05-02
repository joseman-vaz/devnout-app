const router = require("express").Router();

const User = require("../models/User.model");
const Post = require("../models/Post.model");

router.post("/post-create", (req, res, next) => {
  const { title, content, author } = req.body;
  // 'author' represents the ID of the user document

  Post.create({ title, content, author })
    .then((dbPost) => {
      return User.findByIdAndUpdate(author, { $push: { posts: dbPost._id } });
    })
    .then(() => res.redirect("/posts")) // if everything is fine, redirect to list of posts
    .catch((err) => {
      console.log(`Err while creating the post in the DB: ${err}`);
      next(err);
    });
});

router.get("/posts", (req, res, next) => {
  Post.find()
    .then((dbPosts) => {
      console.log("Posts from the DB: ", dbPosts);
    })
    .catch((err) => {
      console.log(`Err while getting the posts from the DB: ${err}`);
      next(err);
    });
});
