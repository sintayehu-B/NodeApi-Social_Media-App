const router = require("express").Router();
const User = require("../models/Users");
const bcrypt = require("bcrypt");

// update user
router.put("/:id", async (req, res) => {
  /* This code is checking if the user is trying to update his own account or if the user is an admin.
  If
  not, it will return a 403 status code with a message. If the user is an admin or the user is
  trying to update his own account, it will update the account and return a 200 status code with a
  message. */
  if (req.body.userId === req.params.id || req.body.isAdmin) {
    if (req.body.password) {
      try {
        const salt = await bcrypt.genSalt(10);
        req.body.password = await bcrypt.hash(req.body.password, salt);
      } catch (error) {
        return res.status(500).json({ error: error });
      }
    }
    try {
      const user = await User.findByIdAndUpdate(req.params.id, {
        $set: req.body,
      });

      res
        .status(200)
        .json({ message: "Account updated successfully", user: user });
    } catch (error) {
      return res.status(500).json({ error: error });
    }
  } else {
    return res
      .status(403)
      .json({ message: "you can only update your own account" });
  }
});
// delete user
router.delete("/:id", async (req, res) => {
  /* This is checking if the user is trying to delete his own account or if the user is an admin. If
  not, it will return a 403 status code with a message. If the user is an admin or the user is
  trying to delete his own account, it will delete the account and return a 200 status code with a
  message. */
  if (req.body.userId === req.params.id || req.body.isAdmin) {
    //
    try {
      const user = await User.findByIdAndDelete(req.params.id);

      res
        .status(200)
        .json({ message: "Account deleted successfully", user: user });
    } catch (error) {
      return res.status(500).json({ error: error });
    }
  } else {
    return res
      .status(403)
      .json({ message: "you can only delete your own account" });
  }
});

// get user profile

router.get("/", async (req, res) => {
  const userId = req.query.userId;
  const username = req.query.username;
  try {
    const user = userId
      ? await User.findById(userId)
      : await User.findOne({ username: username });
    const { password, ...others } = user._doc;
    res.status(200).json(others);
  } catch (error) {
    res.status(500).json({ error: error });
  }
});

// follow users
router.put("/follow/:id", async (req, res) => {
  /* The above code is checking if the user is trying to follow himself. If not, it will check if the
  user is already following the user. If not, it will push the user to the following array and the
 current user to the followers array. */
  if (req.body.userId !== req.params.id) {
    try {
      const user = await User.findById(req.params.id);
      const currentUser = await User.findById(req.body.userId);
      if (!user.following.includes(currentUser)) {
        await user.updateOne({
          $push: { following: req.body.userId },
        });
        await currentUser.updateOne({ $push: { followers: req.params.id } });
        res.status(200).json("User has been followed");
      } else {
        res.status(403).json("You already follow this user");
      }
    } catch (error) {
      return res.status(500).json({ error: error });
    }
  } else {
    res.status(403).json("You can't follow yourSelf");
  }
});
// UnFollow a user
router.put("/unFollow/:id", async (req, res) => {
  /* This code is checking if the user is trying to unFollow himself. If not, it will check if the
  user is already following the user. If not, it will push the user to the following array and the
  current user to the followers array. */
  if (req.body.userId !== req.params.id) {
    try {
      const user = await User.findById(req.params.id);
      const currentUser = await User.findById(req.body.userId);
      if (user.following.includes(currentUser.id)) {
        await user.updateOne({
          $pull: { following: req.body.userId },
        });
        await currentUser.updateOne({ $pull: { followers: req.params.id } });
        res.status(200).json("User has been UnFollowed");
      } else {
        res.status(403).json("You already unFollowed this user");
      }
    } catch (error) {
      return res.status(500).json({ error: error });
    }
  } else {
    res.status(403).json("You can't unFollow yourSelf");
  }
});

router.get("/all", async (req, res) => {
  try {
    const user = await User.find().exec();
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ error: error });
  }
});

// get user profile
// router.get("/:id", async (req, res) => {
//   try {
//     const user = await User.findById(req.params.id);
//     const { password, ...others } = user._doc;
//     res.status(200).json(others);
//   } catch (error) {
//     res.status(500).json({ error: error });
//   }
// });
module.exports = router;
