const winston = require("winston");
const { LogstashTransport } = require("winston-logstash-transport");

const { combine, timestamp, printf, json } = winston.format;

const LOGSTASH_HOST = process.env.LOGSTASH_HOST || "localhost";
const LOGSTASH_PORT = parseInt(process.env.LOGSTASH_PORT || "5044", 10);

// JSON format for ELK
const elkFormat = combine(timestamp(), json());

const consoleTransport = new winston.transports.Console({
  format: elkFormat,
});

// Logstash TCP transport - sends JSON over TCP to Logstash input
const logstashTransport = new LogstashTransport({
  host: LOGSTASH_HOST,
  port: LOGSTASH_PORT,
  // ensure we're sending objects as JSON
  protocol: "tcp",
  timeout: 1000,
});

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || "info",
  transports: [consoleTransport, logstashTransport],
  exitOnError: false,
});

// Helper to create middleware-like stream for morgan or other loggers
logger.stream = {
  write: (message) => {
    // morgan will send newline-terminated messages; trim them
    logger.info(message.trim());
  },
};

module.exports = logger;
