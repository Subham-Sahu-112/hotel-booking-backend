const Vendor = require("../models/Vender");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const registerVendor = async (req, res) => {
  try {
    const {
      businessName,
      businessType,
      businessDescription,
      contactName,
      emailAddress,
      phoneNumber,
      streetAddress,
      city,
      country,
      postalCode,
      businessRegistrationNumber,
      taxId,
      password,
      confirmPassword,
      acceptTerms,
      acceptPrivacy,
    } = req.body;

    // Validation
    if (
      !businessName ||
      !businessType ||
      !contactName ||
      !emailAddress ||
      !phoneNumber ||
      !password
    ) {
      return res
        .status(400)
        .json({ message: "Please fill all required fields" });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }

    // Check if vendor already exists
    const existingVendor = await Vendor.findOne({ emailAddress });
    if (existingVendor) {
      return res.status(400).json({ message: "Email already registered" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create vendor
    const newVendor = new Vendor({
      businessName,
      businessType,
      businessDescription,
      contactName,
      emailAddress,
      phoneNumber,
      streetAddress,
      city,
      country,
      postalCode,
      businessRegistrationNumber,
      taxId,
      password: hashedPassword,
      acceptTerms,
      acceptPrivacy,
    });

    await newVendor.save();

    res
      .status(201)
      .json({ message: "Vendor registered successfully", vendor: newVendor });
  } catch (error) {
    console.error("Error registering vendor:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const vendorLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ message: "Please enter all required fields" });
    }

    // Check if vendor exists
    const vendor = await Vendor.findOne({ emailAddress: email });
    if (!vendor) {
      return res.status(400).json({ message: "Vendor not found. Please register first." });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, vendor.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid password" });
    }

    // Create JWT Token
    const token = jwt.sign(
      { 
        id: vendor._id, 
        vendorId: vendor._id,
        supplierId: vendor._id,
        email: vendor.emailAddress,
        type: 'supplier' // or 'vendor' - matches middleware check
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" } // token valid for 7 days
    );

    // Send response with consistent structure
    const vendorData = {
      id: vendor._id,
      businessName: vendor.businessName,
      contactName: vendor.contactName,
      emailAddress: vendor.emailAddress,
      phoneNumber: vendor.phoneNumber,
    };

    res.status(200).json({
      success: true,
      message: "Login successful",
      data: {
        vender: vendorData,
        token
      }
    });
  } catch (error) {
    console.error("Error logging in vendor:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = { registerVendor, vendorLogin };