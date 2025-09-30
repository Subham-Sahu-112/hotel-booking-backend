const express = require("express");
const { createHotel } = require("../Controllers/hotelController");
const upload = require("../config/MulterConfig")
const router = express.Router();

router.post(
  "/",
  upload.fields([
    { name: "mainImage", maxCount: 1 },
    { name: "additionalImages", maxCount: 10 },
  ]),
  createHotel
);

module.exports = router;
