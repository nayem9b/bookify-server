const winston = require("winston");
const { LogstashTransport } = require("winston-logstash-transport");

const { combine, timestamp, json } = winston.format;

const LOGSTASH_HOST = process.env.LOGSTASH_HOST || "localhost";
const LOGSTASH_PORT = parseInt(process.env.LOGSTASH_PORT || "5044", 10);

// JSON format for ELK
const elkFormat = combine(timestamp(), json());

const consoleTransport = new winston.transports.Console({
  format: elkFormat,
});

// TCP Logstash transport
const logstashTransport = new LogstashTransport({
  host: LOGSTASH_HOST,
  port: LOGSTASH_PORT,
  protocol: "tcp",
  timeout: 1000,
});

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || "info",
  transports: [consoleTransport, logstashTransport],
  exitOnError: false,
});

// Helper stream for morgan or other loggers
logger.stream = {
  write: (message) => {
    logger.info(message.trim());
  },
};

module.exports = logger;
