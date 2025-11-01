const jwt = require("jsonwebtoken");
const User = require("../models/User"); // Assuming your User model is here

/**
 * @desc Checks if a user is authenticated via JWT in the request header.
 * If valid, attaches the user object (excluding password) to req.user.
 * If invalid, sends a 401 Unauthorized response.
 */
exports.protect = async (req, res, next) => {
  let token;

  // 1. Check if the token is present in the Authorization header
  // Format expected: "Bearer <TOKEN>"
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      // Get token from header (removes 'Bearer ')
      token = req.headers.authorization.split(" ")[1];

      // 2. Verify the token
      // The JWT_SECRET must be defined in your .env file
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // 3. Find the user based on the decoded ID and attach to request
      // We select everything EXCEPT the password field
      req.user = await User.findById(decoded.id).select("-password");

      // Check if user was found
      if (!req.user) {
        return res.status(401).json({ error: "User not found, token invalid." });
      }

      // 4. Move to the next middleware or controller
      next();
    } catch (error) {
      console.error(error);
      // This handles expired, malformed, or invalid signatures
      return res.status(401).json({ error: "Not authorized, token failed." });
    }
  }

  // If no token was found in the header
  if (!token) {
    return res.status(401).json({ error: "Not authorized, no token." });
  }
};
