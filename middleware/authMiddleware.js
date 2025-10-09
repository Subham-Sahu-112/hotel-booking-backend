const jwt = require("jsonwebtoken");
const Customer = require("../models/Customer");

const authMiddleware = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.header("Authorization");
    
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Access denied. No token provided or invalid format."
      });
    }

    // Extract token
    const token = authHeader.substring(7); // Remove "Bearer " prefix

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'hotel_booking_secret_key');
    
    // Check if it's a customer token
    if (decoded.type !== 'customer') {
      return res.status(401).json({
        success: false,
        message: "Access denied. Invalid token type."
      });
    }

    // Check if customer exists and is active
    const customer = await Customer.findById(decoded.customerId);
    if (!customer || !customer.isActive) {
      return res.status(401).json({
        success: false,
        message: "Access denied. Customer not found or account deactivated."
      });
    }

    // Add customer info to request object
    req.customer = decoded;
    next();

  } catch (error) {
    console.error("Auth middleware error:", error);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: "Access denied. Invalid token."
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: "Access denied. Token has expired."
      });
    }

    res.status(500).json({
      success: false,
      message: "Internal server error during authentication."
    });
  }
};

module.exports = authMiddleware;