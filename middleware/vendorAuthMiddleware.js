const jwt = require("jsonwebtoken");
const Vendor = require("../models/Vender");

const vendorAuthMiddleware = async (req, res, next) => {
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
    
    // Check if it's a vendor/supplier token (flexible check for backward compatibility)
    if (decoded.type && decoded.type !== 'supplier' && decoded.type !== 'vendor') {
      return res.status(401).json({
        success: false,
        message: "Access denied. Invalid token type."
      });
    }

    // Get vendor ID from various possible fields (backward compatibility)
    const vendorIdFromToken = decoded.vendorId || decoded.supplierId || decoded.id;
    
    // Check if vendor exists
    const vendor = await Vendor.findById(vendorIdFromToken);
    if (!vendor) {
      return res.status(401).json({
        success: false,
        message: "Access denied. Vendor not found."
      });
    }

    // Add vendor info to request object
    req.vendor = {
      vendorId: vendorIdFromToken,
      emailAddress: vendor.emailAddress,
      businessName: vendor.businessName
    };
    next();

  } catch (error) {
    console.error("Vendor auth middleware error:", error);
    
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

module.exports = vendorAuthMiddleware;
