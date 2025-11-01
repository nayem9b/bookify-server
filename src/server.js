const express = require("express");
const cors = require("cors");
const { connectDB } = require("./config/db");
const bookRoutes = require("./routes/bookRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const bookingRoutes = require("./routes/bookingRoutes");
const wishlistRoutes = require("./routes/wishlistRoutes");
const userRoutes = require("./routes/userRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
// const productRoutes = require('./routes/productRoutes');
const errorHandler = require("./middleware/errorHandler");
const { connectRedis } = require("./utils/redis");
const { initKafka } = require("./messaging/kafka");

const app = express();
require("dotenv").config();

// Metrics (Prometheus)
const { httpRequestCounter, requestDurationHistogram, requestDurationSummary, promClient } = require('./metrics/metrics_utils');

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Metrics middleware: track every request's count and duration
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = (Date.now() - start) / 1000; // seconds
    const { method, originalUrl } = req;
    const statusCode = res.statusCode;
    try {
      httpRequestCounter.labels({ method, path: originalUrl, status_code: statusCode }).inc();
      requestDurationHistogram.labels({ method, path: originalUrl, status_code: statusCode }).observe(duration);
      requestDurationSummary.labels({ method, path: originalUrl, status_code: statusCode }).observe(duration);
    } catch (err) {
      // Swallow metric errors so they don't affect request handling
      console.warn('Metrics error:', err && err.message ? err.message : err);
    }
  });
  next();
});

// Database connection
connectDB();
// Connect to Redis
connectRedis().catch(console.error);

// Routes
app.use("/api/books", bookRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/wishlist", wishlistRoutes);
app.use("/api/users", userRoutes);
app.use("/api/payments", paymentRoutes);
// app.use('/api/products', productRoutes);

// Expose Prometheus metrics
app.get('/metrics', async (req, res) => {
  try {
    res.set('Content-Type', promClient.register.contentType);
    res.end(await promClient.register.metrics());
  } catch (err) {
    res.status(500).send(`Error collecting metrics: ${err && err.message ? err.message : err}`);
  }
});

// Error handling middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const main = async () => {
  //init kafka
  try {
    await initKafka();
    console.log("Kafka initialized successfully");
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Kafka initialization error:", error);
  }
};

main();
app.get("/", (req, res) => {
  res.send("Hello Bookify!");
});

module.exports = app;
