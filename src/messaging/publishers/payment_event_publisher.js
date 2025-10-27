import { getKafkaProducer } from "../kafka.js";

/**
 * Publish a payment/checkout event to Kafka.
 *
 * @param {Object} payment - payment/order payload (id, total, items, metadata...)
 * @param {Object} user - user info (id, email, name)
 * @param {string} [topic='bookify.payments'] - optional topic name override
 */
export async function publishPaymentEvent(
  payment = {},
  user = {},
  topic = "bookify.payments"
) {
  const safeUser = user || {};

  const payload = {
    event: "payment.created",
    timestamp: new Date().toISOString(),
    payment: {
      id: payment.id || payment.orderId || null,
      amount: payment.amount ?? payment.total ?? null,
      currency: payment.currency || "USD",
      items: payment.items || [],
      metadata: payment.metadata || {},
    },
    user: {
      id: safeUser.id || safeUser._id || safeUser.uid || null,
      name: safeUser.name || safeUser.displayName || null,
      email: safeUser.email || null,
    },
  };

  const producer = getKafkaProducer();
  const key = String(payload.payment.id || payload.user.id || Date.now());

  await producer.send({
    topic,
    messages: [{ key, value: JSON.stringify(payload) }],
  });

  console.log(`📤 Published payment event (key=${key}) to topic=${topic}`);
  console.log(topic);
  console.log(payload);
}
