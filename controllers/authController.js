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
  isAdmin: Joi.boolean().default(false), // Optional field to create admin user
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

    const { username, email, password, isAdmin = false } = req.body;

    // check if user exists
    const existing = await User.findOne({ $or: [{ email }, { username }] });
    if (existing) {
      return res.status(409).json({ error: "Email or username already in use" });
    }

    // If trying to create an admin account, check the limit
    if (isAdmin) {
      const adminCount = await User.countDocuments({ isAdmin: true });
      if (adminCount >= 2) {
        return res.status(403).json({ 
          error: "Maximum admin accounts limit reached (2 accounts allowed)" 
        });
      }
    }

    // hash password
    // Ensure BCRYPT_SALT_ROUNDS is available in your .env file
    const salt = await bcrypt.genSalt(Number(process.env.BCRYPT_SALT_ROUNDS)); 
    const hashedPassword = await bcrypt.hash(password, salt);

    // create user
    const user = new User({ 
      username, 
      email, 
      password: hashedPassword,
      isAdmin: isAdmin // Include admin status
    });
    await user.save();

    // Generate and send token upon successful registration as well
    const token = generateToken(user._id);

    return res.status(201).json({ 
        message: isAdmin ? "Admin registered successfully" : "User registered successfully",
        token,
        user: { 
          id: user._id, 
          username: user.username, 
          email: user.email,
          isAdmin: user.isAdmin 
        }
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
      user: { 
        id: user._id, 
        username: user.username, 
        email: user.email,
        isAdmin: user.isAdmin 
      },
    });
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ error: "Server error" });
  }
};

// @desc    Get current admin count
// @route   GET /api/auth/admin-count
// @access  Public (or you can make it admin-only)
exports.getAdminCount = async (req, res) => {
  try {
    const adminCount = await User.countDocuments({ isAdmin: true });
    return res.status(200).json({ 
      adminCount,
      maxAdmins: 2,
      remainingSlots: 2 - adminCount
    });
  } catch (err) {
    console.error("Get admin count error:", err);
    return res.status(500).json({ error: "Server error" });
  }
};