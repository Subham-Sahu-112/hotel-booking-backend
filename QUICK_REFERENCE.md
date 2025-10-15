# ⚡ Admin Panel - Quick Commands

## 🚀 Get Started (Copy & Paste)

### Terminal 1: Start Backend
```powershell
cd hotel-booking-backend
node app.js
```

### Terminal 2: Create Admin
```powershell
cd hotel-booking-backend
node createAdmin.js
```

### Terminal 3: Start Frontend
```powershell
cd hotel-booking
npm run dev
```

## 🔑 Login Credentials

```
URL:      http://localhost:5173/admin/login
Email:    admin@example.com
Password: admin123
```

## 📦 Optional: Add Sample Categories

```powershell
cd hotel-booking-backend
node seedCategories.js
```

## 🔗 Important URLs

| Purpose | URL |
|---------|-----|
| Admin Login | http://localhost:5173/admin/login |
| Admin Dashboard | http://localhost:5173/admin/dashboard |
| Backend API | http://localhost:5000 |
| Frontend | http://localhost:5173 |

## 📋 Sample Categories Created by seedCategories.js

1. **Luxury Hotel** - High-end hotels with premium amenities
2. **Budget Hotel** - Affordable accommodations
3. **Resort** - Vacation properties with extensive facilities
4. **Boutique Hotel** - Small, stylish hotels with unique character
5. **Business Hotel** - Hotels for business travelers
6. **Hostel** - Budget-friendly shared accommodations
7. **Bed & Breakfast** - Cozy lodgings with breakfast
8. **Motel** - Roadside hotels for motorists

## 🛠️ API Endpoints Quick Reference

### Admin Auth
```http
POST /admin/login          - Login
POST /admin/create         - Create admin (first time only)
GET  /admin/profile        - Get profile (requires token)
GET  /admin/verify         - Verify token
```

### Categories
```http
GET    /categories              - Get all (admin only)
GET    /categories/active       - Get active (public)
GET    /categories/:id          - Get one (public)
POST   /categories              - Create (admin only)
PUT    /categories/:id          - Update (admin only)
DELETE /categories/:id          - Delete (admin only)
PATCH  /categories/:id/toggle-status - Toggle (admin only)
```

## 📝 Test with cURL (Windows PowerShell)

### Login
```powershell
$body = @{
    email = "admin@example.com"
    password = "admin123"
} | ConvertTo-Json

$response = Invoke-RestMethod -Uri "http://localhost:5000/admin/login" -Method POST -Body $body -ContentType "application/json"
$token = $response.token
Write-Host "Token: $token"
```

### Create Category
```powershell
$headers = @{
    Authorization = "Bearer $token"
    "Content-Type" = "application/json"
}

$body = @{
    name = "Luxury Hotel"
    description = "High-end hotels with premium amenities"
    isActive = $true
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:5000/categories" -Method POST -Headers $headers -Body $body
```

### Get All Categories
```powershell
$headers = @{
    Authorization = "Bearer $token"
}

Invoke-RestMethod -Uri "http://localhost:5000/categories" -Headers $headers
```

## 🐛 Troubleshooting Quick Fixes

| Problem | Solution |
|---------|----------|
| Can't connect to MongoDB | Check MONGO_URI in .env file |
| Admin not found | Run `node createAdmin.js` |
| Port 5000 in use | Change PORT in .env or kill process |
| CORS error | Backend has CORS enabled, restart both servers |
| Categories not loading | Check if admin token is valid, try re-login |
| Token expired | Login again to get new token |

## 📂 Files Created

### Backend (8 files)
```
✓ models/Admin.js
✓ models/Category.js
✓ Controllers/AdminController.js
✓ Controllers/CategoryController.js
✓ Routes/AdminRouter.js
✓ Routes/CategoryRouter.js
✓ middleware/adminAuthMiddleware.js
✓ createAdmin.js
✓ seedCategories.js
Updated: models/Hotel.js, app.js
```

### Frontend (4 files)
```
✓ pages/admin/AdminLogin.jsx
✓ pages/admin/AdminLogin.css
✓ pages/admin/AdminPanel.jsx
✓ pages/admin/AdminPanel.css
Updated: App.jsx
```

### Documentation (3 files)
```
✓ ADMIN_PANEL_SETUP.md
✓ QUICK_START_ADMIN.md
✓ README_ADMIN_IMPLEMENTATION.md
```

## ⚙️ Environment Variables Required

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/vendorDB
JWT_SECRET=your-secret-key-here
```

## ✅ Verification Checklist

- [ ] Backend running on port 5000
- [ ] Frontend running on port 5173
- [ ] Admin account created
- [ ] Can login at /admin/login
- [ ] Can view admin dashboard
- [ ] Can create category
- [ ] Can edit category
- [ ] Can delete category
- [ ] Can toggle category status

---

**All set! 🎉 Your admin panel is ready to use!**

Navigate to: http://localhost:5173/admin/login
