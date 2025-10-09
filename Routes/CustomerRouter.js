const express = require("express");
const { 
  registerCustomer, 
  loginCustomer, 
  getCustomerProfile, 
  updateCustomerProfile 
} = require("../Controllers/CustomerController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// Public routes
router.post("/register", registerCustomer);
router.post("/login", loginCustomer);

// Protected routes (require authentication)
router.get("/profile", authMiddleware, getCustomerProfile);
router.put("/profile", authMiddleware, updateCustomerProfile);

module.exports = router;