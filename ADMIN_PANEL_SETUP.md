# Admin Panel Setup Guide

## Overview
This admin panel allows administrators to manage hotel categories (types of hotels like Luxury, Budget, Resort, etc.).

## Backend Setup

### 1. Install Required Dependencies
Navigate to the backend folder and install the required packages:
```bash
cd hotel-booking-backend
npm install bcryptjs jsonwebtoken
```

### 2. Environment Variables
Make sure your `.env` file includes:
```
JWT_SECRET=your-secret-key-here
MONGO_URI=your-mongodb-connection-string
PORT=5000
```

### 3. Create Initial Admin Account
You need to create an admin account before you can login. You can do this in two ways:

#### Option A: Using API Tool (Postman, Thunder Client, etc.)
Send a POST request to:
```
POST http://localhost:5000/admin/create
Content-Type: application/json

{
  "username": "admin",
  "email": "admin@example.com",
  "password": "admin123",
  "role": "admin"
}
```

#### Option B: Using MongoDB Compass or Shell
Run this script after starting the server (or create a seed file):
```javascript
const Admin = require('./models/Admin');

const admin = new Admin({
  username: 'admin',
  email: 'admin@example.com',
  password: 'admin123', // Will be hashed automatically
  role: 'admin'
});

await admin.save();
```

### 4. Start the Backend Server
```bash
cd hotel-booking-backend
node app.js
```

## Frontend Setup

### 1. No Additional Dependencies Required
The admin panel uses existing dependencies (react-router-dom, react-toastify).

### 2. Start the Frontend
```bash
cd hotel-booking
npm run dev
```

## Usage

### Admin Login
1. Navigate to: `http://localhost:5173/admin/login`
2. Use the credentials you created:
   - Email: `admin@example.com`
   - Password: `admin123`

### Admin Dashboard
After logging in, you'll be redirected to the admin dashboard where you can:
- **View all categories**: See all hotel categories in a card layout
- **Add new category**: Click "Add New Category" button
- **Edit category**: Click "Edit" on any category card
- **Delete category**: Click "Delete" (with confirmation)
- **Toggle status**: Activate/Deactivate categories
- **Logout**: Click "Logout" button in the header

### Category Management
Each category has:
- **Name**: The category name (e.g., "Luxury Hotel", "Budget Hotel")
- **Description**: Optional description of the category
- **Status**: Active/Inactive (only active categories will be shown to users)

## API Endpoints

### Admin Routes
- `POST /admin/login` - Admin login
- `POST /admin/create` - Create new admin (use once for initial setup)
- `GET /admin/profile` - Get admin profile (protected)
- `GET /admin/verify` - Verify admin token (protected)

### Category Routes
- `GET /categories` - Get all categories (admin only)
- `GET /categories/active` - Get active categories (public)
- `GET /categories/:id` - Get single category (public)
- `POST /categories` - Create category (admin only)
- `PUT /categories/:id` - Update category (admin only)
- `DELETE /categories/:id` - Delete category (admin only)
- `PATCH /categories/:id/toggle-status` - Toggle category status (admin only)

## Database Models

### Admin Model
```javascript
{
  username: String,
  email: String,
  password: String (hashed),
  role: String (admin/superadmin),
  isActive: Boolean,
  timestamps
}
```

### Category Model
```javascript
{
  name: String,
  description: String,
  isActive: Boolean,
  timestamps
}
```

### Hotel Model (Updated)
Added field:
```javascript
{
  category: ObjectId (ref: Category)
}
```

## Security Features
- Password hashing using bcryptjs
- JWT token authentication
- Protected admin routes with middleware
- Token expiration (7 days)
- Active status check for admin accounts

## Next Steps
You can extend this admin panel to:
1. Add category images
2. Manage hotels from admin panel
3. Add analytics dashboard
4. Manage vendor approvals
5. View booking statistics

## Troubleshooting

### "Admin not found" error
- Make sure you've created an admin account using the `/admin/create` endpoint

### CORS errors
- Ensure the backend has CORS enabled (already configured in app.js)

### Token expired
- Login again to get a new token

### Categories not loading
- Check if the backend server is running on port 5000
- Verify the admin token is valid
- Check browser console for errors

## File Structure

### Backend
```
hotel-booking-backend/
├── models/
│   ├── Admin.js
│   └── Category.js
├── Controllers/
│   ├── AdminController.js
│   └── CategoryController.js
├── Routes/
│   ├── AdminRouter.js
│   └── CategoryRouter.js
├── middleware/
│   └── adminAuthMiddleware.js
└── app.js (updated)
```

### Frontend
```
hotel-booking/src/
├── pages/
│   └── admin/
│       ├── AdminLogin.jsx
│       ├── AdminLogin.css
│       ├── AdminPanel.jsx
│       └── AdminPanel.css
└── App.jsx (updated)
```
