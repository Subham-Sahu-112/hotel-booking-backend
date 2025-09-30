const express = require("express");
const { registerVendor } = require("../Controllers/VenderController");

const router = express.Router();

router.post("/register", registerVendor);

module.exports = router;
