const bcrypt = require("bcryptjs");
const Joi = require("joi");
const User = require("../models/User");
// 🔑 Import jsonwebtoken
const jwt = require("jsonwebtoken");

// Joi schema for signup validation
const signupSchema = Joi.object({
  username: Joi.string().min(3).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
});

// Joi schema for login validation
const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
});

// Helper function to generate JWT
const generateToken = (id) => {
  // Signs the token using the user ID, a secret key, and sets an expiration (e.g., 30 days)
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
};

// @desc    Register new user
// @route   POST /api/auth/signup
// @access  Public
exports.signup = async (req, res) => {
  try {
    // validate input
    const { error } = signupSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    const { username, email, password } = req.body;

    // check if user exists
    const existing = await User.findOne({ $or: [{ email }, { username }] });
    if (existing) {
      return res.status(409).json({ error: "Email or username already in use" });
    }

    // hash password
    // Ensure BCRYPT_SALT_ROUNDS is available in your .env file
    const salt = await bcrypt.genSalt(Number(process.env.BCRYPT_SALT_ROUNDS)); 
    const hashedPassword = await bcrypt.hash(password, salt);

    // create user
    const user = new User({ username, email, password: hashedPassword });
    await user.save();

    // Generate and send token upon successful registration as well
    const token = generateToken(user._id);

    return res.status(201).json({ 
        message: "User registered successfully",
        token,
        user: { id: user._id, username: user.username, email: user.email }
    });
  } catch (err) {
    console.error("Signup error:", err);
    return res.status(500).json({ error: "Server error" });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
  try {
    // validate input
    const { error } = loginSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    const { email, password } = req.body;

    // find user
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ error: "Invalid email or password" });

    // compare password
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword)
      return res.status(401).json({ error: "Invalid email or password" });

    // 1. Generate JWT after successful authentication
    const token = generateToken(user._id);

    // 2. Send the token back to the client
    return res.status(200).json({
      message: "Login successful",
      token, // ⬅️ The token is included here
      user: { id: user._id, username: user.username, email: user.email },
    });
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ error: "Server error" });
  }
};
