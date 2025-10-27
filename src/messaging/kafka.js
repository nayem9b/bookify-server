import { Kafka, logLevel } from "kafkajs";


let producer = null;

export async function initKafka() {
  const kafka = new Kafka({
    clientId: "bookify-server",
    brokers: ["localhost:29092"],
    retry: { initialRetryTime: 300, retries: 8 },
    logLevel: logLevel.NOTHING,
  });
  producer = kafka.producer();
  await producer.connect();
  console.log("✅ Kafka producer connected");
}

export function getKafkaProducer() {
  if (!producer) throw new Error("Kafka producer not initialized");
  return producer;
}

export async function gracefulKafkaShutdown() {
  if (producer) {
    await producer.disconnect();
    console.log("✅ Kafka producer disconnected");
  }
}
