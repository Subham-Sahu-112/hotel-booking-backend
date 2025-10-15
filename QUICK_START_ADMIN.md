# 🚀 Quick Start - Admin Panel for Hotel Categories

## Step 1: Start the Backend Server

Open a terminal in the `hotel-booking-backend` folder:

```powershell
cd hotel-booking-backend
node app.js
```

You should see:
```
✅ MongoDB Connected
🚀 Server running on port 5000
```

## Step 2: Create Initial Admin Account

Open a **new terminal** in the `hotel-booking-backend` folder and run:

```powershell
node createAdmin.js
```

You should see:
```
✅ Admin created successfully!
═══════════════════════════════
Login Credentials:
Email: admin@example.com
Password: admin123
═══════════════════════════════
```

**Note:** If you see "Admin already exists", you can skip this step and use the existing credentials.

## Step 3: Start the Frontend

Open a **new terminal** in the `hotel-booking` folder:

```powershell
cd hotel-booking
npm run dev
```

The frontend should start at: `http://localhost:5173`

## Step 4: Access the Admin Panel

1. Open your browser and go to: **http://localhost:5173/admin/login**

2. Login with:
   - **Email:** `admin@example.com`
   - **Password:** `admin123`

3. After successful login, you'll be redirected to the Admin Dashboard!

## Step 5: Manage Hotel Categories

In the Admin Dashboard, you can:

### ➕ Add a New Category
1. Click the **"+ Add New Category"** button
2. Enter category details:
   - **Name:** e.g., "Luxury Hotel", "Budget Hotel", "Resort", "Boutique Hotel"
   - **Description:** Optional description
   - **Active:** Check to make it active
3. Click **"Create"**

### ✏️ Edit a Category
1. Click the **"Edit"** button on any category card
2. Modify the details
3. Click **"Update"**

### 🔄 Toggle Status
- Click **"Activate"** or **"Deactivate"** to toggle category visibility

### 🗑️ Delete a Category
1. Click the **"Delete"** button
2. Confirm the deletion

## Example Categories to Create

Here are some common hotel categories you can add:

1. **Luxury Hotel**
   - Description: "High-end hotels with premium amenities and services"

2. **Budget Hotel**
   - Description: "Affordable accommodations for budget-conscious travelers"

3. **Resort**
   - Description: "Vacation properties with extensive facilities and activities"

4. **Boutique Hotel**
   - Description: "Small, stylish hotels with unique character and design"

5. **Business Hotel**
   - Description: "Hotels catering to business travelers with meeting facilities"

6. **Hostel**
   - Description: "Budget-friendly shared accommodations for backpackers"

7. **Motel**
   - Description: "Roadside hotels for motorists with parking facilities"

8. **Bed & Breakfast**
   - Description: "Small lodgings offering overnight accommodation and breakfast"

## API Endpoints Reference

### Public Endpoints (No Authentication Required)
- `GET /categories/active` - Get all active categories
- `GET /categories/:id` - Get single category details

### Admin Endpoints (Authentication Required)
- `POST /admin/login` - Admin login
- `GET /categories` - Get all categories
- `POST /categories` - Create new category
- `PUT /categories/:id` - Update category
- `DELETE /categories/:id` - Delete category
- `PATCH /categories/:id/toggle-status` - Toggle active status

## Testing with Thunder Client or Postman

### Login as Admin
```http
POST http://localhost:5000/admin/login
Content-Type: application/json

{
  "email": "admin@example.com",
  "password": "admin123"
}
```

Response will include a `token` - copy it for authenticated requests.

### Create Category
```http
POST http://localhost:5000/categories
Authorization: Bearer YOUR_TOKEN_HERE
Content-Type: application/json

{
  "name": "Luxury Hotel",
  "description": "High-end hotels with premium amenities",
  "isActive": true
}
```

### Get All Categories (Admin)
```http
GET http://localhost:5000/categories
Authorization: Bearer YOUR_TOKEN_HERE
```

### Get Active Categories (Public)
```http
GET http://localhost:5000/categories/active
```

## Troubleshooting

### Issue: "Admin not found" when logging in
**Solution:** Run `node createAdmin.js` to create the admin account

### Issue: "Cannot connect to MongoDB"
**Solution:** Make sure MongoDB is running and check your `.env` file for correct `MONGO_URI`

### Issue: "Port 5000 already in use"
**Solution:** Change the port in your `.env` file or stop the process using port 5000

### Issue: Categories not loading
**Solution:** 
1. Check if backend is running (`http://localhost:5000`)
2. Open browser console (F12) to see error messages
3. Verify you're logged in as admin

### Issue: CORS errors
**Solution:** The backend already has CORS enabled. Make sure both servers are running.

## Next Steps

Now that the admin panel is set up, you can:

1. **Update Hotel Creation Form:**
   - Add a dropdown to select category when creating hotels
   - Fetch categories from `/categories/active` endpoint

2. **Filter Hotels by Category:**
   - Add category filter on the all-hotels page
   - Show category badge on hotel cards

3. **Enhance Admin Panel:**
   - Add statistics (total categories, active categories)
   - Add search/filter functionality
   - Add bulk operations

## Security Reminder

⚠️ **Important:** 
- Change the default admin password after first login
- Never commit `.env` files to version control
- Use strong passwords in production
- Consider adding password change functionality
- Add rate limiting for login attempts in production

---

**Need help?** Check the full documentation in `ADMIN_PANEL_SETUP.md`
