const Vendor = require("../models/Vender");
const bcrypt = require("bcryptjs");

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

module.exports = { registerVendor };