require("dotenv").config();
const mongoose = require("mongoose");
const Category = require("./models/Category");

const sampleCategories = [
  {
    name: "Luxury Hotel",
    description: "High-end hotels with premium amenities, exceptional service, and elegant accommodations for discerning travelers.",
    isActive: true,
  },
  {
    name: "Budget Hotel",
    description: "Affordable accommodations offering essential amenities and comfortable stays for budget-conscious travelers.",
    isActive: true,
  },
  {
    name: "Resort",
    description: "Vacation properties with extensive facilities, recreational activities, and all-inclusive packages for leisure travelers.",
    isActive: true,
  },
  {
    name: "Boutique Hotel",
    description: "Small, stylish hotels with unique character, personalized service, and distinctive design elements.",
    isActive: true,
  },
  {
    name: "Business Hotel",
    description: "Hotels catering to business travelers with meeting facilities, conference rooms, and business center services.",
    isActive: true,
  },
  {
    name: "Hostel",
    description: "Budget-friendly shared accommodations with dormitory-style rooms, perfect for backpackers and solo travelers.",
    isActive: true,
  },
  {
    name: "Bed & Breakfast",
    description: "Cozy lodgings in private homes offering overnight accommodation and homemade breakfast in the morning.",
    isActive: true,
  },
  {
    name: "Motel",
    description: "Roadside hotels designed for motorists, offering convenient parking and easy highway access.",
    isActive: true,
  },
];

const seedCategories = async () => {
  try {
    // Connect to MongoDB
    const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/vendorDB";
    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("✅ MongoDB Connected");

    // Clear existing categories (optional - comment out if you want to keep existing ones)
    // await Category.deleteMany({});
    // console.log("🗑️  Cleared existing categories");

    // Check for existing categories
    const existingCategories = await Category.find();
    if (existingCategories.length > 0) {
      console.log(`⚠️  ${existingCategories.length} categories already exist.`);
      console.log("Existing categories:");
      existingCategories.forEach((cat, index) => {
        console.log(`  ${index + 1}. ${cat.name}`);
      });
      console.log("\nTo add sample categories anyway, uncomment the deleteMany line in seedCategories.js");
      process.exit(0);
    }

    // Insert sample categories
    const insertedCategories = await Category.insertMany(sampleCategories);

    console.log("\n✅ Sample categories created successfully!");
    console.log("═══════════════════════════════════════");
    console.log(`Total categories added: ${insertedCategories.length}\n`);
    
    insertedCategories.forEach((category, index) => {
      console.log(`${index + 1}. ${category.name}`);
      console.log(`   ${category.description}`);
      console.log(`   Status: ${category.isActive ? "Active" : "Inactive"}\n`);
    });

    console.log("═══════════════════════════════════════");
    console.log("\nYou can now view these categories in the admin panel!");
    console.log("Admin Panel: http://localhost:5173/admin/dashboard\n");

    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding categories:", error.message);
    process.exit(1);
  }
};

seedCategories();
