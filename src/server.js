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
const {
  httpRequestCounter,
  requestDurationHistogram,
  requestDurationSummary,
  promClient,
} = require("./metrics/metrics_utils");
// Logging
const expressWinston = require("express-winston");
// The project provides a logging wrapper at server/src/logging/log.js which
// exposes methods like `info`, `error`, `debug`, `http`, and `warning`.
// express-winston expects a Winston-like instance with a `.log` method.
// Create a small adapter here that delegates to the wrapper and exposes
// both `.log` and `.warn` (alias to `warning`) so existing code keeps working.
const rawLogger = require("../src/logging/log");

const logger = {
  info: rawLogger.info.bind(rawLogger),
  error: rawLogger.error.bind(rawLogger),
  debug: rawLogger.debug.bind(rawLogger),
  http: rawLogger.http
    ? rawLogger.http.bind(rawLogger)
    : rawLogger.info.bind(rawLogger),
  // provide warn alias used in some places (wrapper uses `warning`)
  warn: rawLogger.warning
    ? rawLogger.warning.bind(rawLogger)
    : rawLogger.warn && rawLogger.warn.bind(rawLogger),
  // child is a noop adapter to keep callers safe (the wrapper has child but returns a logger)
  child: (data) => {
    if (typeof rawLogger.child === "function") return rawLogger.child(data);
    return logger;
  },
  // express-winston expects a `.log(level, message, meta)` function. Support
  // both signature forms: (level, msg, meta) and (infoObject).
  log: function (level, msg, meta) {
    try {
      // Called with an info object: log({ level, message, ... })
      if (typeof level === "object" && level !== null) {
        const info = level;
        const lvl = info.level || info.severity || "info";
        const message = info.message || JSON.stringify(info);
        const metadata = info.meta || info;
        if (typeof rawLogger[lvl] === "function") {
          rawLogger[lvl](message, metadata);
        } else {
          rawLogger.info(message, metadata);
        }
        return;
      }

      // Called as (level, message, meta)
      const lvl = String(level || "info");
      const message = msg;
      const metadata = meta;
      if (typeof rawLogger[lvl] === "function") {
        rawLogger[lvl](message, metadata);
      } else if (lvl === "warn" && typeof rawLogger.warning === "function") {
        rawLogger.warning(message, metadata);
      } else {
        rawLogger.info(message, metadata);
      }
    } catch (e) {
      // fallback to console to avoid breaking request handling
      // eslint-disable-next-line no-console
      console.error("Logger adapter error:", e && e.message ? e.message : e);
    }
  },
};

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// HTTP request logging (to console and Logstash) - placed after body parsing
app.use(
  expressWinston.logger({
    winstonInstance: logger,
    meta: true,
    msg: "HTTP {{req.method}} {{req.url}}",
    expressFormat: false,
    colorize: false,
    ignoreRoute: function (req, res) {
      return false;
    },
  })
);

// Metrics middleware: track every request's count and duration
app.use((req, res, next) => {
  const start = Date.now();
  res.on("finish", () => {
    const duration = (Date.now() - start) / 1000; // seconds
    const { method, originalUrl } = req;
    const statusCode = res.statusCode;
    try {
      httpRequestCounter
        .labels({ method, path: originalUrl, status_code: statusCode })
        .inc();
      requestDurationHistogram
        .labels({ method, path: originalUrl, status_code: statusCode })
        .observe(duration);
      requestDurationSummary
        .labels({ method, path: originalUrl, status_code: statusCode })
        .observe(duration);
    } catch (err) {
      // Swallow metric errors so they don't affect request handling
      logger.warn("Metrics error:", err && err.message ? err.message : err);
    }
  });
  next();
});

// Database connection
connectDB();
// Connect to Redis
connectRedis().catch((err) => logger.error("Redis connection error:", err));

// Routes
app.use("/api/books", bookRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/wishlist", wishlistRoutes);
app.use("/api/users", userRoutes);
app.use("/api/payments", paymentRoutes);
// app.use('/api/products', productRoutes);

// Expose Prometheus metrics
app.get("/metrics", async (req, res) => {
  try {
    res.set("Content-Type", promClient.register.contentType);
    res.end(await promClient.register.metrics());
  } catch (err) {
    res
      .status(500)
      .send(
        `Error collecting metrics: ${err && err.message ? err.message : err}`
      );
  }
});

// Error handling middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const main = async () => {
  //init kafka
  try {
    await initKafka();
    logger.info("Kafka initialized successfully");
    app.listen(PORT, () => {
      logger.info(`Server running on port ${PORT}`);
    });
  } catch (error) {
    logger.error("Kafka initialization error:", error);
  }
};

main();
app.get("/", (req, res) => {
  res.send("Hello Bookify!");
});

module.exports = app;
