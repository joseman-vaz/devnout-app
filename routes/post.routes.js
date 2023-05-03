const router = require("express").Router();

const User = require("../models/User.model");
const Post = require("../models/Post.model");

const isLoggedOut = require("../middleware/isLoggedOut");
const isLoggedIn = require("../middleware/isLoggedIn");

router.get("/post-create", (req, res) => {
  User.find()
    .then((dbUsers) => {
      res.render("posts/create", { dbUsers });
    })
    .catch((err) =>
      console.log(`Err while displaying post input page: ${err}`)
    );
});

router.post("/post-create", (req, res, next) => {
  const { title, content, author } = req.body;
  Post.create({ title, content, author })
    .then((dbPost) => {
      return User.findByIdAndUpdate(author, { $push: { posts: dbPost._id } });
    })
    .then(() => res.redirect("/posts"))
    .catch((err) => {
      console.log(`Err while creating the post in the DB: ${err}`);
      next(err);
    });
});

router.get("/posts", (req, res, next) => {
  Post.find()
    .populate("author")
    .then((dbPosts) => {
      res.render("posts/list", { posts: dbPosts });
    })
    .catch((err) => {
      console.log(`Err while getting the posts from the DB: ${err}`);
      next(err);
    });
});

// DELETE ROUTE/////////
// router.post("/posts/:postId/delete", isLoggedIn, (req, res, next) => {
//   const { postId } = req.params;
//   Post.findById(postId)
//     .then((thePost) => {
//       if (!thePost) {
//         res.status(404).render("not-found");
//         return;
//       }
//       if (
//         req.session.currentUser._id.toString() !== thePost.author.toString()
//       ) {
//         res.status(403).render("forbidden");
//         return;
//       }
//       return Post.findByIdAndDelete(postId);
//     })
//     .then(() => {
//       res.redirect("/posts");
//     })
//     .catch((err) => next(err));
// });
router.post("/posts/:postId/delete", (req, res, next) => {
  const { postId } = req.params;

  Post.findByIdAndDelete(postId)
    .then(() => res.redirect("/posts"))
    .catch((error) => next(error));
});
///EDIT ROUTE
router.get("/posts/:postId/edit", (req, res) => {
  const { postId } = req.params;
  console.log(`1. Editing the post ID: ${postId}`);
  Post.findById(postId).then((thePost) => {
    res.render("posts/edit", { post: thePost });
  });
});

router.post("/posts/:postId/edit", (req, res, next) => {
  const { id, author, title, content, comments } = req.body;

  Post.findByIdAndUpdate(
    id,
    { author, title, content, comments },
    { new: true }
  )
    .then((updatedPost) => {
      res.redirect(`/posts/${id}`);
    })
    .catch((error) => next(error));
});

router.get("/posts/:postId", (req, res, next) => {
  const { postId } = req.params;

  Post.findById(postId)
    .populate("author")
    .then((foundPost) => res.render("posts/details", foundPost))
    .catch((err) => {
      console.log(`Err while getting a single post from the  DB: ${err}`);
      next(err);
    });
});

module.exports = router;
