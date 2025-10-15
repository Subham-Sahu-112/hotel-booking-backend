# Vendor Booking System Implementation

## Overview
This document outlines the changes made to enable vendors to view bookings for their hotels in the Dashboard and Bookings pages.

## Backend Changes

### 1. New Middleware: `vendorAuthMiddleware.js`
**Location:** `hotel-booking-backend/middleware/vendorAuthMiddleware.js`

**Purpose:** Authenticates vendor/supplier requests using JWT tokens.

**Features:**
- Validates JWT tokens with type 'supplier' or 'vendor'
- Verifies vendor exists in the database
- Attaches vendor information to request object
- Handles token expiration and invalid tokens

### 2. Updated BookingController
**Location:** `hotel-booking-backend/Controllers/BookingController.js`

**New Endpoints:**

#### a) `getVendorBookings(req, res)`
Fetches all bookings for hotels owned by the authenticated vendor.

**Query Parameters:**
- `status` - Filter by booking status (confirmed, pending, completed, cancelled)
- `upcoming` - Filter upcoming bookings (true/false)
- `hotelId` - Filter by specific hotel ID

**Returns:**
```json
{
  "success": true,
  "count": 5,
  "data": {
    "bookings": [...],
    "stats": {
      "total": 5,
      "confirmed": 3,
      "pending": 1,
      "completed": 1,
      "cancelled": 0,
      "totalRevenue": 25000
    }
  }
}
```

#### b) `getVendorDashboardStats(req, res)`
Provides comprehensive dashboard statistics for the vendor.

**Returns:**
```json
{
  "success": true,
  "data": {
    "totalBookings": 10,
    "monthlyRevenue": 15000,
    "activeListings": 3,
    "occupancyRate": 75.5,
    "recentBookings": [...],
    "recentActivity": [...]
  }
}
```

### 3. New Router: `VendorBookingRouter.js`
**Location:** `hotel-booking-backend/Routes/VendorBookingRouter.js`

**Routes:**
- `GET /vendor/bookings/dashboard/stats` - Get dashboard statistics
- `GET /vendor/bookings` - Get all vendor bookings with optional filters

**Authentication:** All routes require vendor authentication via `vendorAuthMiddleware`

### 4. Updated Hotel Model
**Location:** `hotel-booking-backend/models/Hotel.js`

**New Field:**
```javascript
vendor: {
  type: mongoose.Schema.Types.ObjectId,
  ref: "Vendor",
  required: false
}
```

**Note:** Made optional for backward compatibility with existing hotels.

### 5. Updated app.js
**Location:** `hotel-booking-backend/app.js`

**New Route Registration:**
```javascript
app.use("/vendor/bookings", vendorBookingRoutes);
```

## Frontend Changes

### 1. Updated Dashboard Component
**Location:** `hotel-booking/src/pages/vendor/components/Dashboard.jsx`

**Key Changes:**
- Added `useEffect` hook to fetch data on component mount
- Integrated API call to `/vendor/bookings/dashboard/stats`
- Added loading state with loading indicator
- Dynamic stats display based on real data
- Error handling with toast notifications
- Session expiration handling

**API Integration:**
```javascript
const response = await fetch('http://localhost:1000/vendor/bookings/dashboard/stats', {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
});
```

### 2. Updated Bookings Component
**Location:** `hotel-booking/src/pages/vendor/components/Bookings.jsx`

**Key Changes:**
- Added `useEffect` hook to fetch bookings
- Integrated API call to `/vendor/bookings`
- Real-time status filtering
- Data transformation to match UI format
- Loading state with indicator
- Dynamic statistics display
- Search functionality maintained
- Error handling with toast notifications

**Data Transformation:**
```javascript
const transformedBookings = data.data.bookings.map(booking => ({
  id: booking.bookingReference,
  guest: {
    name: booking.customerName,
    email: booking.customerEmail,
    phone: booking.customerPhone,
    avatar: booking.customerName.charAt(0).toUpperCase()
  },
  // ... other fields
}));
```

## API Endpoints Summary

### Vendor Endpoints
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/vendor/bookings/dashboard/stats` | Get dashboard statistics | Yes (Vendor) |
| GET | `/vendor/bookings` | Get all vendor bookings | Yes (Vendor) |
| GET | `/vendor/bookings?status=confirmed` | Get filtered bookings | Yes (Vendor) |
| GET | `/vendor/bookings?upcoming=true` | Get upcoming bookings | Yes (Vendor) |

### Customer Endpoints (Existing)
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/bookings` | Create new booking | Yes (Customer) |
| GET | `/bookings` | Get customer bookings | Yes (Customer) |
| GET | `/bookings/:id` | Get specific booking | Yes (Customer) |
| PUT | `/bookings/:id` | Update booking | Yes (Customer) |
| POST | `/bookings/:id/cancel` | Cancel booking | Yes (Customer) |

## Authentication Flow

### Vendor Authentication
1. Vendor logs in and receives JWT token with `type: 'supplier'` or `type: 'vendor'`
2. Token stored in `localStorage.getItem('token')`
3. Token sent in Authorization header: `Bearer ${token}`
4. `vendorAuthMiddleware` validates token and vendor existence
5. Vendor info attached to `req.vendor` object

### Token Structure
```javascript
{
  vendorId: "vendor_id_here",
  supplierId: "supplier_id_here", // alternate field
  type: "supplier" | "vendor",
  // ... other fields
}
```

## Testing

### Testing Vendor Dashboard
1. Login as vendor/supplier
2. Navigate to `/vender/dashboard`
3. Verify statistics display correctly
4. Check recent bookings section
5. Verify recent activity feed

### Testing Vendor Bookings
1. Login as vendor/supplier
2. Navigate to `/vender/bookings`
3. Test status filter (All, Confirmed, Pending, Completed, Cancelled)
4. Test search functionality
5. Click "View" button to see booking details
6. Verify statistics cards update correctly

### Testing API Endpoints
```bash
# Get dashboard stats
curl -X GET http://localhost:1000/vendor/bookings/dashboard/stats \
  -H "Authorization: Bearer YOUR_VENDOR_TOKEN"

# Get all bookings
curl -X GET http://localhost:1000/vendor/bookings \
  -H "Authorization: Bearer YOUR_VENDOR_TOKEN"

# Get filtered bookings
curl -X GET http://localhost:1000/vendor/bookings?status=confirmed \
  -H "Authorization: Bearer YOUR_VENDOR_TOKEN"
```

## Important Notes

### Hotel-Vendor Association
- Existing hotels without a `vendor` field will show 0 bookings for all vendors
- New hotels should be created with the vendor's ID
- To associate existing hotels with vendors, update them with:
```javascript
await Hotel.findByIdAndUpdate(hotelId, { vendor: vendorId });
```

### Data Consistency
- Bookings reference hotels via `hotel` ObjectId field
- Hotels reference vendors via `vendor` ObjectId field
- This creates a chain: `Vendor -> Hotel -> Booking`

### Error Handling
- All endpoints return consistent error format
- 401 errors trigger redirect to login page
- 500 errors display user-friendly toast messages
- Loading states prevent UI flickering

## Future Enhancements

1. **Real-time Updates:** Implement WebSocket for live booking notifications
2. **Booking Management:** Add ability to confirm/cancel bookings from vendor dashboard
3. **Analytics:** Add detailed revenue analytics and charts
4. **Filters:** Add date range filters for bookings
5. **Export:** Add CSV/PDF export functionality
6. **Email Notifications:** Send emails for new bookings
7. **Calendar View:** Display bookings in calendar format

## Troubleshooting

### No Bookings Showing
- Verify vendor token is valid
- Check if hotels have `vendor` field set
- Verify bookings exist for those hotels
- Check browser console for API errors

### Authentication Errors
- Ensure token is stored in localStorage
- Verify token type is 'supplier' or 'vendor'
- Check token expiration
- Verify vendor exists in database

### Statistics Not Updating
- Refresh the page
- Check if filter is active
- Verify data exists in database
- Check browser console for errors

## Conclusion

The vendor booking system is now fully functional, allowing vendors to:
- ✅ View all bookings for their hotels
- ✅ See dashboard statistics and analytics
- ✅ Filter bookings by status
- ✅ Search for specific bookings
- ✅ View detailed booking information
- ✅ Track revenue and occupancy rates

All changes maintain backward compatibility and follow the existing codebase patterns.
