const express = require("express");
const router = express.Router();
const paymentController = require("../controllers/paymentController");

// POST /api/payments
router.post("/", paymentController.createPayment);

module.exports = router;
