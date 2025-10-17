const Customer = require("../models/Customer");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// Register Customer
const registerCustomer = async (req, res) => {
  try {
    const {
      // Personal Information
      firstName,
      lastName,
      email,
      phoneNumber,
      dateOfBirth,
      gender,
      
      // Address Information
      address,
      city,
      country,
      postalCode,
      
      // Account Setup
      password,
      confirmPassword,
      
      // Preferences
      newsletter,
      notifications,
      
      // Terms & Conditions
      acceptTerms,
      acceptPrivacy
    } = req.body;

    // Input validation
    if (
      !firstName ||
      !lastName ||
      !email ||
      !phoneNumber ||
      !dateOfBirth ||
      !gender ||
      !address ||
      !city ||
      !country ||
      !postalCode ||
      !password ||
      !acceptTerms ||
      !acceptPrivacy
    ) {
      return res.status(400).json({ 
        success: false,
        message: "Please fill all required fields" 
      });
    }

    // Email validation
    const emailRegex = /^\S+@\S+\.\S+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ 
        success: false,
        message: "Please enter a valid email address" 
      });
    }

    // Password validation
    if (password.length < 8) {
      return res.status(400).json({ 
        success: false,
        message: "Password must be at least 8 characters long" 
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ 
        success: false,
        message: "Passwords do not match" 
      });
    }

    // Check if customer already exists
    const existingCustomer = await Customer.findOne({ 
      $or: [
        { email: email.toLowerCase() },
        { phoneNumber: phoneNumber }
      ]
    });

    if (existingCustomer) {
      if (existingCustomer.email === email.toLowerCase()) {
        return res.status(400).json({ 
          success: false,
          message: "Email address is already registered" 
        });
      }
      if (existingCustomer.phoneNumber === phoneNumber) {
        return res.status(400).json({ 
          success: false,
          message: "Phone number is already registered" 
        });
      }
    }

    // Validate date of birth (must be at least 18 years old)
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    const age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    let actualAge = age;
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      actualAge = age - 1;
    }

    if (actualAge < 18) {
      return res.status(400).json({ 
        success: false,
        message: "You must be at least 18 years old to register" 
      });
    }

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create new customer
    const newCustomer = new Customer({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.toLowerCase().trim(),
      phoneNumber: phoneNumber.trim(),
      dateOfBirth,
      gender,
      address: address.trim(),
      city: city.trim(),
      country: country.trim(),
      postalCode: postalCode.trim(),
      password: hashedPassword,
      newsletter: newsletter || false,
      notifications: notifications !== false, // Default to true if not provided
      acceptTerms: acceptTerms,
      acceptPrivacy: acceptPrivacy
    });

    // Save customer to database
    const savedCustomer = await newCustomer.save();

    // Generate JWT token
    const token = jwt.sign(
      { 
        customerId: savedCustomer._id, 
        email: savedCustomer.email,
        type: 'customer'
      },
      process.env.JWT_SECRET || 'hotel_booking_secret_key',
      { expiresIn: '7d' }
    );

    // Return success response (password is automatically excluded by schema toJSON transform)
    res.status(201).json({
      success: true,
      message: "Customer registered successfully",
      data: {
        customer: savedCustomer,
        token
      }
    });

  } catch (error) {
    console.error("Error registering customer:", error);
    
    // Handle mongoose validation errors
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors
      });
    }

    // Handle duplicate key error
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(400).json({
        success: false,
        message: `${field} is already registered`
      });
    }

    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Login Customer
const loginCustomer = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Input validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required"
      });
    }

    // Find customer by email
    const customer = await Customer.findOne({ 
      email: email.toLowerCase().trim() 
    }).select('+password');

    if (!customer) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password"
      });
    }

    // Check if account is active
    if (!customer.isActive) {
      return res.status(401).json({
        success: false,
        message: "Account is deactivated. Please contact support."
      });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, customer.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password"
      });
    }

    // Update last login
    customer.lastLogin = new Date();
    await customer.save();

    // Generate JWT token
    const token = jwt.sign(
      { 
        customerId: customer._id, 
        email: customer.email,
        type: 'customer'
      },
      process.env.JWT_SECRET || 'hotel_booking_secret_key',
      { expiresIn: '30d' }
    );

    // Remove password from response
    const customerData = customer.toJSON();

    res.status(200).json({
      success: true,
      message: "Login successful",
      data: {
        customer: customerData,
        token
      }
    });

    console.log(`Customer data returned: ${JSON.stringify(customerData)}`);

  } catch (error) {
    console.error("Error logging in customer:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get Customer Profile
const getCustomerProfile = async (req, res) => {
  try {
    const customerId = req.customer.customerId; // From auth middleware

    const customer = await Customer.findById(customerId);
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found"
      });
    }

    res.status(200).json({
      success: true,
      data: {
        customer
      }
    });

  } catch (error) {
    console.error("Error fetching customer profile:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Update Customer Profile
const updateCustomerProfile = async (req, res) => {
  try {
    const customerId = req.customer.customerId; // From auth middleware
    const updateData = req.body;

    // Remove sensitive fields that shouldn't be updated directly
    delete updateData.password;
    delete updateData.email;
    delete updateData._id;
    delete updateData.createdAt;
    delete updateData.updatedAt;

    const customer = await Customer.findByIdAndUpdate(
      customerId,
      updateData,
      { new: true, runValidators: true }
    );

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: {
        customer
      }
    });

  } catch (error) {
    console.error("Error updating customer profile:", error);
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors
      });
    }

    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  registerCustomer,
  loginCustomer,
  getCustomerProfile,
  updateCustomerProfile
};