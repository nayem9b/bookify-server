const express = require("express");

// POST /api/payments
async function createPayment(req, res, next) {
  try {
    const payment = req.body.payment || req.body; // accept { payment: {...} } or raw body
    const user = req.body.user || req.user || null;

    // Dynamically import publisher (supports mixed module systems)
    const publisherModule = await import(
      "../messaging/publishers/payment_event_publisher.js"
    );
    const publishPaymentEvent =
      publisherModule.publishPaymentEvent || publisherModule.default;

    if (!publishPaymentEvent) {
      return res
        .status(500)
        .json({ message: "Payment publisher not available" });
    }

    // Build a minimal payment payload if caller sent partial data
    const payload = {
      id: payment.id || payment.orderId || `order-${Date.now()}`,
      total: payment.total || payment.amount || null,
      currency: payment.currency || "USD",
      items: payment.items || [],
      metadata: payment.metadata || {},
    };

    await publishPaymentEvent(payload, user);

    return res
      .status(200)
      .json({ message: "Payment event published", payment: payload });
  } catch (error) {
    console.error("Error in createPayment:", error);
    return res
      .status(500)
      .json({
        message: "Failed to publish payment event",
        error: String(error),
      });
  }
}

module.exports = {
  createPayment,
};
