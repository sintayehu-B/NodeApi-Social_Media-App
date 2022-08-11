const router = require("express").Router();
const User = require("../models/Users");
const bcrypt = require("bcrypt");

router.post("/register", async (req, res) => {
  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);
    /* This is creating a new user and saving it to the database. */
    const newUser = new User({
      username: req.body.username,
      email: req.body.email,
      password: hashedPassword,
    });
    /* This is saving the new user to the database and then sending a response back to the client. */
    const user = await newUser.save();
    res
      .status(201)
      .json({ message: "Successfully registered!", success: true, user: user });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: err.message });
  }
});

// Login
router.post("/login", async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      return res
        .status(404)
        .json({ message: "User not found", success: false });
    }
    // !user &&
    const ValidPassword = await bcrypt.compare(
      req.body.password,
      user.password
    );
    if (!ValidPassword) {
      return res.status(400).json({
        message: "The Email or Password is incorrect",
        success: false,
      });
    }
    // !ValidPassword &&
    return res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ message: err.message, success: false });
  }
});

module.exports = router;
