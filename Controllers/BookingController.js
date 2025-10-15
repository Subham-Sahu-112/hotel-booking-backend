const Booking = require("../models/Booking");
const Hotel = require("../models/Hotel");
const Customer = require("../models/Customer");

// Create a new booking
const createBooking = async (req, res) => {
  try {
    const customerId = req.customer.customerId; // From auth middleware
    const {
      hotelId,
      roomType,
      numberOfRooms,
      checkInDate,
      checkOutDate,
      numberOfGuests,
      guestDetails,
      specialRequests,
      arrivalTime,
      isPetFriendly,
      paymentMethod
    } = req.body;

    // Validate required fields
    if (!hotelId || !roomType || !checkInDate || !checkOutDate || !numberOfGuests) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields"
      });
    }

    // Fetch customer details
    const customer = await Customer.findById(customerId);
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found"
      });
    }

    // Fetch hotel details
    const hotel = await Hotel.findById(hotelId);
    if (!hotel) {
      return res.status(404).json({
        success: false,
        message: "Hotel not found"
      });
    }

    // Find the selected room type
    const selectedRoom = hotel.roomTypes.find(room => room.roomType === roomType);
    if (!selectedRoom) {
      return res.status(404).json({
        success: false,
        message: "Selected room type not found"
      });
    }

    // Validate dates
    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (checkIn < today) {
      return res.status(400).json({
        success: false,
        message: "Check-in date cannot be in the past"
      });
    }

    if (checkOut <= checkIn) {
      return res.status(400).json({
        success: false,
        message: "Check-out date must be after check-in date"
      });
    }

    // Calculate number of nights and total amount
    const timeDiff = checkOut.getTime() - checkIn.getTime();
    const numberOfNights = Math.ceil(timeDiff / (1000 * 3600 * 24));
    const roomsToBook = numberOfRooms || 1;
    const totalAmount = selectedRoom.pricePerNight * numberOfNights * roomsToBook;

    // Create booking
    const newBooking = new Booking({
      customer: customerId,
      customerName: `${customer.firstName} ${customer.lastName}`,
      customerEmail: customer.email,
      customerPhone: customer.phoneNumber,
      hotel: hotelId,
      hotelName: hotel.basicInfo.hotelName,
      hotelAddress: hotel.basicInfo.address,
      hotelCity: hotel.basicInfo.city,
      roomType: selectedRoom.roomType,
      numberOfRooms: roomsToBook,
      maxGuests: selectedRoom.maxGuests,
      pricePerNight: selectedRoom.pricePerNight,
      checkInDate: checkIn,
      checkOutDate: checkOut,
      numberOfNights,
      numberOfGuests,
      guestDetails: guestDetails || { adults: numberOfGuests, children: 0 },
      totalAmount,
      specialRequests: specialRequests || "",
      arrivalTime: arrivalTime || "",
      isPetFriendly: isPetFriendly || false,
      paymentMethod: paymentMethod || "credit_card",
      bookingStatus: "confirmed", // For now, auto-confirm bookings
      paymentStatus: "pending"
    });

    const savedBooking = await newBooking.save();

    res.status(201).json({
      success: true,
      message: "Booking created successfully",
      data: {
        booking: savedBooking
      }
    });

  } catch (error) {
    console.error("Error creating booking:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get all bookings for a customer
const getCustomerBookings = async (req, res) => {
  try {
    const customerId = req.customer.customerId; // From auth middleware
    const { status, upcoming } = req.query;

    let query = { customer: customerId };

    // Filter by status if provided
    if (status) {
      query.bookingStatus = status;
    }

    // Filter upcoming bookings
    if (upcoming === 'true') {
      query.checkInDate = { $gte: new Date() };
    }

    const bookings = await Booking.find(query)
      .populate('hotel', 'basicInfo images')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: bookings.length,
      data: {
        bookings
      }
    });

  } catch (error) {
    console.error("Error fetching customer bookings:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get a single booking by ID
const getBookingById = async (req, res) => {
  try {
    const { id } = req.params;
    const customerId = req.customer.customerId;

    const booking = await Booking.findOne({
      _id: id,
      customer: customerId
    }).populate('hotel', 'basicInfo images contactInfo amenities');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found"
      });
    }

    res.status(200).json({
      success: true,
      data: {
        booking
      }
    });

  } catch (error) {
    console.error("Error fetching booking:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Cancel a booking
const cancelBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const customerId = req.customer.customerId;
    const { reason } = req.body;

    const booking = await Booking.findOne({
      _id: id,
      customer: customerId
    });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found"
      });
    }

    // Check if booking can be cancelled
    if (!booking.canBeCancelled()) {
      return res.status(400).json({
        success: false,
        message: "This booking cannot be cancelled. It's either already cancelled, completed, or within 24 hours of check-in."
      });
    }

    // Update booking status
    booking.bookingStatus = "cancelled";
    booking.cancellationReason = reason || "Cancelled by customer";
    booking.cancelledAt = new Date();
    booking.cancelledBy = "customer";

    await booking.save();

    res.status(200).json({
      success: true,
      message: "Booking cancelled successfully",
      data: {
        booking
      }
    });

  } catch (error) {
    console.error("Error cancelling booking:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Update booking (for special requests or minor changes)
const updateBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const customerId = req.customer.customerId;
    const { specialRequests, arrivalTime, guestDetails } = req.body;

    const booking = await Booking.findOne({
      _id: id,
      customer: customerId
    });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found"
      });
    }

    // Only allow updates for confirmed or pending bookings
    if (booking.bookingStatus === "cancelled" || booking.bookingStatus === "completed") {
      return res.status(400).json({
        success: false,
        message: "Cannot update cancelled or completed bookings"
      });
    }

    // Update allowed fields
    if (specialRequests !== undefined) booking.specialRequests = specialRequests;
    if (arrivalTime !== undefined) booking.arrivalTime = arrivalTime;
    if (guestDetails !== undefined) booking.guestDetails = guestDetails;

    await booking.save();

    res.status(200).json({
      success: true,
      message: "Booking updated successfully",
      data: {
        booking
      }
    });

  } catch (error) {
    console.error("Error updating booking:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get all bookings for a vendor's hotels
const getVendorBookings = async (req, res) => {
  try {
    const vendorId = req.vendor.vendorId; // From vendor auth middleware
    const { status, upcoming, hotelId } = req.query;

    // First, find all hotels owned by this vendor
    let vendorHotels = await Hotel.find({ vendor: vendorId }).select('_id');
    
    // Fallback: if no hotels found with vendor field, get all hotels (for backward compatibility)
    if (vendorHotels.length === 0) {
      vendorHotels = await Hotel.find({}).select('_id');
    }
    
    const hotelIds = vendorHotels.map(hotel => hotel._id);

    if (hotelIds.length === 0) {
      return res.status(200).json({
        success: true,
        count: 0,
        data: {
          bookings: [],
          stats: {
            total: 0,
            confirmed: 0,
            pending: 0,
            completed: 0,
            cancelled: 0,
            totalRevenue: 0
          }
        }
      });
    }

    let query = { hotel: { $in: hotelIds } };

    // Filter by specific hotel if provided
    if (hotelId) {
      query.hotel = hotelId;
    }

    // Filter by status if provided
    if (status) {
      query.bookingStatus = status;
    }

    // Filter upcoming bookings
    if (upcoming === 'true') {
      query.checkInDate = { $gte: new Date() };
    }

    const bookings = await Booking.find(query)
      .populate('hotel', 'basicInfo images')
      .populate('customer', 'firstName lastName email phoneNumber')
      .sort({ createdAt: -1 });

    // Calculate statistics
    const stats = {
      total: bookings.length,
      confirmed: bookings.filter(b => b.bookingStatus === 'confirmed').length,
      pending: bookings.filter(b => b.bookingStatus === 'pending').length,
      completed: bookings.filter(b => b.bookingStatus === 'completed').length,
      cancelled: bookings.filter(b => b.bookingStatus === 'cancelled').length,
      totalRevenue: bookings
        .filter(b => b.paymentStatus === 'paid')
        .reduce((sum, b) => sum + b.totalAmount, 0)
    };

    res.status(200).json({
      success: true,
      count: bookings.length,
      data: {
        bookings,
        stats
      }
    });

  } catch (error) {
    console.error("Error fetching vendor bookings:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get vendor dashboard statistics
const getVendorDashboardStats = async (req, res) => {
  try {
    const vendorId = req.vendor.vendorId;

    // Get vendor's hotels
    // If vendor field doesn't exist in hotels, get all hotels as fallback
    let vendorHotels = await Hotel.find({ vendor: vendorId });
    
    // Fallback: if no hotels found with vendor field, get all hotels (for backward compatibility)
    if (vendorHotels.length === 0) {
      vendorHotels = await Hotel.find({});
    }
    
    const hotelIds = vendorHotels.map(hotel => hotel._id);

    if (hotelIds.length === 0) {
      return res.status(200).json({
        success: true,
        data: {
          totalBookings: 0,
          monthlyRevenue: 0,
          activeListings: 0,
          occupancyRate: 0,
          recentBookings: [],
          recentActivity: []
        }
      });
    }

    // Get all bookings for vendor's hotels
    const allBookings = await Booking.find({ hotel: { $in: hotelIds } })
      .populate('hotel', 'basicInfo')
      .populate('customer', 'firstName lastName')
      .sort({ createdAt: -1 });

    // Calculate monthly revenue (current month)
    const currentDate = new Date();
    const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const monthlyBookings = allBookings.filter(b => 
      b.createdAt >= firstDayOfMonth && b.paymentStatus === 'paid'
    );
    const monthlyRevenue = monthlyBookings.reduce((sum, b) => sum + b.totalAmount, 0);

    // Calculate occupancy rate (simplified)
    const confirmedBookings = allBookings.filter(b => 
      b.bookingStatus === 'confirmed' && 
      b.checkInDate <= new Date() && 
      b.checkOutDate >= new Date()
    );
    const totalRooms = vendorHotels.reduce((sum, hotel) => 
      sum + (hotel.roomTypes?.reduce((rSum, room) => rSum + (room.availableRooms || 0), 0) || 0), 0
    );
    const occupiedRooms = confirmedBookings.reduce((sum, b) => sum + b.numberOfRooms, 0);
    const occupancyRate = totalRooms > 0 ? ((occupiedRooms / totalRooms) * 100).toFixed(1) : 0;

    // Recent bookings (last 5)
    const recentBookings = allBookings.slice(0, 5).map(booking => ({
      id: booking.bookingReference,
      guest: booking.customerName,
      property: booking.hotelName,
      dates: `${booking.checkInDate.toISOString().split('T')[0]} - ${booking.checkOutDate.toISOString().split('T')[0]}`,
      amount: `₹${booking.totalAmount}`,
      status: booking.bookingStatus
    }));

    // Recent activity (last 10 bookings as activity)
    const recentActivity = allBookings.slice(0, 10).map((booking, index) => {
      const timeAgo = Math.floor((Date.now() - booking.createdAt.getTime()) / (1000 * 60 * 60));
      return {
        id: index + 1,
        type: 'booking',
        message: `New booking received for ${booking.hotelName}`,
        time: timeAgo < 1 ? 'Just now' : timeAgo < 24 ? `${timeAgo} hours ago` : `${Math.floor(timeAgo / 24)} days ago`,
        icon: '📅'
      };
    });

    res.status(200).json({
      success: true,
      data: {
        totalBookings: allBookings.length,
        monthlyRevenue,
        activeListings: vendorHotels.length,
        occupancyRate: parseFloat(occupancyRate),
        recentBookings,
        recentActivity
      }
    });

  } catch (error) {
    console.error("Error fetching vendor dashboard stats:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  createBooking,
  getCustomerBookings,
  getBookingById,
  cancelBooking,
  updateBooking,
  getVendorBookings,
  getVendorDashboardStats
};
