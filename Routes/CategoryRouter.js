const express = require("express");
const router = express.Router();
const categoryController = require("../Controllers/CategoryController");
const adminAuthMiddleware = require("../middleware/adminAuthMiddleware");

// Public routes
router.get("/active", categoryController.getActiveCategories);
router.get("/:id", categoryController.getCategoryById);

// Protected admin routes
router.get("/", adminAuthMiddleware, categoryController.getAllCategories);
router.post("/", adminAuthMiddleware, categoryController.createCategory);
router.put("/:id", adminAuthMiddleware, categoryController.updateCategory);
router.delete("/:id", adminAuthMiddleware, categoryController.deleteCategory);
router.patch("/:id/toggle-status", adminAuthMiddleware, categoryController.toggleCategoryStatus);

module.exports = router;
