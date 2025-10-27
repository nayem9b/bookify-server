# Kafka Event Streaming Setup

This document explains how to set up and use the Kafka event streaming system for service creation events.

## Overview

When a new service is created via the REST API (`POST /api/v1/create-service`), a Kafka event is automatically published to the `services.created.v1` topic. This allows other services to react to new service creation in real-time.

## Architecture

```
REST API → Service Creation → Kafka Producer → services.created.v1 topic → Kafka Consumer → GraphQL Service
```

## Setup Instructions

### 1. Start Kafka (Redpanda)

```bash
cd server
docker compose -f docker-compose.kafka.yml up -d
```

This starts:
- Redpanda broker on `localhost:29092`
- Admin API on `localhost:9644`

### 2. Install Dependencies

```bash
cd server
npm install
```

### 3. Environment Variables

The following environment variables are available (with defaults):

```bash
KAFKA_CLIENT_ID=sheba-server
KAFKA_BROKERS=localhost:29092
KAFKA_SERVICES_CREATED_TOPIC=services.created.v1
```

### 4. Start the Services

#### Main Server (Producer)
```bash
cd server
npm run dev
```

#### GraphQL Service (Consumer)
```bash
cd server/graphql
npm run dev
```

## Event Schema

### Topic: `services.created.v1`

**Message Key**: Service ID  
**Message Value**: JSON payload

```json
{
  "id": "service-uuid",
  "name": "Service Name",
  "price": 100,
  "details": "Service description",
  "image": "image-url",
  "categoryId": "category-uuid",
  "rating": "4.5",
  "location": "Dhaka",
  "status": "available"
}
```

## Testing the Setup

### 1. Create a Service

```bash
curl -X POST http://localhost:3000/api/v1/create-service \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Service",
    "price": 100,
    "details": "Test service description",
    "image": "test-image.jpg",
    "categoryId": "category-uuid",
    "rating": "4.5",
    "location": "Dhaka",
    "status": "available"
  }'
```

### 2. Check Logs

You should see:
- **Main Server**: `📤 Published service created event for service: Test Service (service-uuid)`
- **GraphQL Service**: `📨 ServiceCreated event received in GraphQL service: {...}`

### 3. View in Redpanda Admin API

Visit `http://localhost:9644` to see:
- Topics and messages
- Consumer groups
- Broker health

## Troubleshooting

### Kafka Connection Issues
- Ensure Redpanda is running: `docker ps | grep redpanda`
- Check broker connectivity: `telnet localhost 29092`
- Verify environment variables

### Consumer Not Receiving Events
- Check consumer group: `rpk group list`
- Verify topic exists: `rpk topic list`
- Check consumer logs for errors

### Producer Not Publishing
- Check server logs for Kafka connection errors
- Verify topic auto-creation is enabled
- Test with Redpanda Admin API

## Development Notes

- Events are published asynchronously (non-blocking)
- Producer failures are logged but don't affect API responses
- Consumer runs in a separate process (GraphQL service)
- Graceful shutdown is handled for both producer and consumer

## Production Considerations

- Use proper Kafka cluster (not single Redpanda instance)
- Configure appropriate retention policies
- Set up monitoring and alerting
- Consider schema registry for message evolution
- Implement proper error handling and retry logic
