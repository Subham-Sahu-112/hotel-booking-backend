const express = require("express");
const router = express.Router();
const adminController = require("../Controllers/AdminController");
const adminAuthMiddleware = require("../middleware/adminAuthMiddleware");

// Public routes
router.post("/login", adminController.adminLogin);
router.post("/register", adminController.registerAdmin); // Only works if no admin exists
router.get("/check-exists", adminController.checkAdminExists); // Check if admin exists

// Protected routes
router.get("/profile", adminAuthMiddleware, adminController.getAdminProfile);
router.get("/verify", adminAuthMiddleware, adminController.verifyAdminToken);

// Admin creation route (kept for backward compatibility/scripts)
router.post("/create", adminController.createAdmin);

module.exports = router;
