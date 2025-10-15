require("dotenv").config();
const mongoose = require("mongoose");
const Admin = require("./models/Admin");

const createInitialAdmin = async () => {
  try {
    // Connect to MongoDB
    const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/vendorDB";
    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("✅ MongoDB Connected");

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ email: "admin@example.com" });
    
    if (existingAdmin) {
      console.log("⚠️  Admin already exists!");
      console.log("Email:", existingAdmin.email);
      console.log("Username:", existingAdmin.username);
      process.exit(0);
    }

    // Create new admin
    const admin = new Admin({
      username: "admin",
      email: "admin@example.com",
      password: "admin123", // Will be hashed automatically by the model
      role: "admin",
      isActive: true,
    });

    await admin.save();

    console.log("\n✅ Admin created successfully!");
    console.log("═══════════════════════════════");
    console.log("Login Credentials:");
    console.log("Email: admin@example.com");
    console.log("Password: admin123");
    console.log("═══════════════════════════════");
    console.log("\n⚠️  Please change the password after first login!");
    console.log("\nYou can now login at: http://localhost:5173/admin/login\n");

    process.exit(0);
  } catch (error) {
    console.error("❌ Error creating admin:", error.message);
    process.exit(1);
  }
};

createInitialAdmin();
