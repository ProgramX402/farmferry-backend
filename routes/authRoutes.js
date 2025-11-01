const express = require("express");
const { signup, login, getAdminCount } = require("../controllers/authController");

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.get("/admin-count", getAdminCount);

module.exports = router;
