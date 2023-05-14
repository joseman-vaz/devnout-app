const router = require("express").Router();
const mongoose = require("mongoose");
const User = require("../models/User.model");
const Post = require("../models/Post.model");

const isLoggedOut = require("../middleware/isLoggedOut");
const isLoggedIn = require("../middleware/isLoggedIn");

router.get("/post-create", isLoggedIn, (req, res) => {
  User.find()
    .then((dbUsers) => {
      res.render("posts/create", { dbUsers });
    })
    .catch((err) =>
      console.log(`Err while displaying post input page: ${err}`)
    );
});

router.post("/post-create", isLoggedIn, (req, res, next) => {
  const { title, content } = req.body;
  const author = res.locals.user._id;
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
      console.log(dbPosts);
      res.render("posts/list", { posts: dbPosts });
    })
    .catch((err) => {
      console.log(`Err while getting the posts from the DB: ${err}`);
      next(err);
    });
});

///search route///
router.get("/search", (req, res, next) => {
  const query = req.query.query;
  Post.find({ $text: { $search: query } })
    .populate("author")
    .then((dbPosts) => {
      res.render("posts/list", { posts: dbPosts });
    })
    .catch((err) => {
      console.log(`Err while searching the posts from the DB: ${err}`);
      next(err);
    });
});

// DELETE ROUTE/////////
function validatePostId(req, res, next) {
  const postId = req.params.postId;
  if (!mongoose.Types.ObjectId.isValid(postId)) {
    return res.status(400).json({ message: "Invalid postId" });
  }
  next();
}
router.post(
  "/posts/:postId/delete",
  isLoggedIn,
  validatePostId,
  (req, res, next) => {
    const { postId } = req.params;
    Post.findById(postId)
      .then((thePost) => {
        if (!thePost) {
          res.status(404).render("not-found");
          return;
        }
        if (
          thePost.author &&
          req.session.currentUser._id.toString() !== thePost.author.toString()
        ) {
          res.status(403).render("forbidden");
          return;
        }
        return Post.findByIdAndDelete(postId);
      })
      .then(() => {
        res.redirect("/posts");
      })
      .catch((err) => next(err));
  }
);

///EDIT ROUTE
router.get("/posts/:postId/edit", isLoggedIn, (req, res) => {
  const { postId } = req.params;
  console.log(`1. Editing the post ID: ${postId}`);
  Post.findById(postId).then((thePost) => {
    res.render("posts/edit", { post: thePost });
  });
});

router.post("/posts/:postId/edit", isLoggedIn, (req, res, next) => {
  const postId = req.params.postId;
  const { title, content } = req.body;

  Post.findByIdAndUpdate(postId, { title, content }, { new: true })
    .then((updatedPost) => {
      res.redirect(`/posts/${postId}`);
    })
    .catch((error) => next(error));
});

router.get("/posts/:postId", (req, res, next) => {
  const { postId } = req.params;
  Post.findById(postId)
    .populate("author comments")
    .populate({
      path: "comments",
      populate: {
        path: "author",
        model: "User",
      },
    })
    .then((foundPost) => res.render("posts/details", foundPost))
    .catch((err) => {
      console.log(`Err while getting a single post from the  DB: ${err}`);
      next(err);
    });
});

module.exports = router;
