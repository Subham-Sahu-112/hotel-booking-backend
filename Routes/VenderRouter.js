const express = require("express");
const { registerVendor, vendorLogin } = require("../Controllers/VenderController");

const router = express.Router();

router.post("/register", registerVendor);
router.post("/login", vendorLogin);

module.exports = router;
