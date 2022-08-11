const router = require("express").Router();
const Post = require("../models/Post");
const User = require("../models/Users");

// create a post
router.post("/", async (req, res) => {
  /* This is a function that is creating a new post. */
  const post = new Post(req.body);
  try {
    const newPost = await post.save();
    res.status(200).send(newPost);
  } catch (error) {
    res.status(500).json({ error: error });
  }
});
// update a post

router.put("/:id", async (req, res) => {
  try {
    /* This is a middleware function that is checking if the userId of the post is the same as the
       userId of the user that is trying to delete the post. If it is, then the post is deleted. If
   it
       is not, then the user is not allowed to delete the post. */
    const post = await Post.findById(req.params.id);
    if (post.userId === req.body.userId) {
      await post.updateOne({ $set: req.body });

      res
        .status(200)
        .json({ message: "The post has been updated successfully." });
    } else {
      res.status(403).json({ message: "You can update only your posts" });
    }
  } catch (error) {
    res.status(500).json({ error: error });
  }
});

// delete a post
router.delete("/:id", async (req, res) => {
  try {
    /* This is a middleware function that is checking if the userId of the post is the same as the
    userId of the user that is trying to delete the post. If it is, then the post is deleted. If it
    is not, then the user is not allowed to delete the post. */
    const post = await Post.findById(req.params.id);

    if (post.userId === req.body.userId) {
      await post.deleteOne();

      res
        .status(200)
        .json({ message: "The post has been deleted successfully." });
    } else {
      res.status(403).json({ message: "You can delete only your posts" });
    }
  } catch (error) {
    res.status(500).json({ error: error });
  }
});
// like and unLike a post
router.put("/likeUnlike/:id", async (req, res) => {
  try {
    /* This is a function that is checking if the userId of the user that is trying to like the post is
    already in the likes array of the post. If it is, then the userId is removed from the likes
    array. If it is not, then the userId is added to the likes array. */
    const post = await Post.findById(req.params.id);
    if (!post.likes.includes(req.body.userId)) {
      await post.updateOne({ $push: { likes: req.body.userId } });
    } else {
      await post.updateOne({ $pull: { likes: req.body.userId } });
      return res.status(200).json("Post unLiked ");
    }
    return res.status(200).json("The Post has been liked");
  } catch (error) {
    return res.status(500).json({ error: error });
  }
});
// get timeline posts
router.get("/timeline/:userId", async (req, res) => {
  try {
    /* This is a function that is getting the posts of the current user and the posts of the users that
    the current user is following. */
    const currentUser = await User.findById(req.params.userId);
    const userPosts = await Post.find({ userId: currentUser._id });
    const friendsPost = await Promise.all(
      currentUser.following.map((friendId) => {
        return Post.find({ userId: friendId });
      })
    );
    res.status(200).json(userPosts.concat(...friendsPost));
  } catch (error) {
    // console.log(error);
    res.status(500).json(error.message);
  }
});
// get user's all posts
router.get("/profile/:username", async (req, res) => {
  try {
    const user = await User.find({ username: req.params.username });
    const posts = await Post.find({ userId: user._id });
    res.status(200).json(posts);
  } catch (error) {
    // console.log(error);
    res.status(500).json(error.message);
  }
});

// get a post
router.get("/:id", async (req, res) => {
  /* This is a function that is getting a post by its id. */
  try {
    const post = await Post.findById(req.params.id);
    res.status(200).json({ post: post });
  } catch (error) {
    res.status(500).json({ error: error });
  }
});
module.exports = router;
