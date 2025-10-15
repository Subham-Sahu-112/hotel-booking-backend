require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const vendorRoutes = require("./Routes/VenderRouter");
const customerRoutes = require("./Routes/CustomerRouter");
const hotelRoutes = require("./Routes/hotelRoutes");
const bookingRoutes = require("./Routes/BookingRouter");
const vendorBookingRoutes = require("./Routes/VendorBookingRouter");
const adminRoutes = require("./Routes/AdminRouter");
const categoryRoutes = require("./Routes/CategoryRouter");
const Hotel = require("./models/Hotel");

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Routes
app.use("/vender", vendorRoutes);
app.use("/customer", customerRoutes);
app.use("/hotels", hotelRoutes);
app.use("/bookings", bookingRoutes);
app.use("/vendor/bookings", vendorBookingRoutes);
app.use("/admin", adminRoutes);
app.use("/categories", categoryRoutes);

// MongoDB Connection
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/vendorDB";

mongoose
  .connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log("✅ MongoDB Connected");
    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
  })
  .catch((err) => {
    console.error("❌ MongoDB Connection Failed:", err.message);
  });

app.get("/all-hotels", async (req, res) => {
  try {
    const Hotels = await Hotel.find();
    res.status(200).json(Hotels);
  } catch (error) {
    console.error("Error fetching hotels:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});
