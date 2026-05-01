const express = require("express");
const router = express.Router();
const User = require("../models/User");

router.post("/add", async (req, res) => {
  try {
    const { name, email } = req.body;

    if (!email) {
      return res.status(400).json({ error: "Email required" });
    }

    let user = await User.findOne({ email });

    if (!user) {
      const newUser = new User({ name, email });
      await newUser.save();

      return res.status(201).json({
        message: "User saved",
        user: newUser
      });
    } else {
      return res.status(409).json({
        message: "User already exists"
      });
    }

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;