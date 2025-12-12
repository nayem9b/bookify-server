# Bookify Server - Initialization Guide

This guide provides step-by-step instructions for setting up the Bookify server with Docker, Kubernetes, and Redpanda Kafka integration.

## Prerequisites

Before starting the setup, ensure you have the following:

### Local Development Prerequisites:

- Node.js v24.x
- Yarn package manager
- Docker v20.x or higher
- Docker Compose v2.x or higher
- Git
- MongoDB Atlas account (or local MongoDB instance)
- Redis server (or Docker container)

### Production Prerequisites:

- Kubernetes cluster (e.g., Minikube, Kind, EKS, GKE, AKS)
- Kubectl configured to connect to your cluster
- Helm (optional, for advanced deployments)
- Docker image registry (Docker Hub, ECR, GCR, etc.)

## Environment Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd Bookify/server
```

### 2. Install Dependencies

```bash
yarn install
```

### 3. Configure Environment Variables

Create a `.env` file based on the example:

```bash
# Copy the example environment file
cp .env.example .env
```

Then edit the `.env` file with your specific configuration:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database Configuration
DB_USER=your_mongodb_username
DB_PASSWORD=your_mongodb_password
DB_NAME=Bookify
MONGODB_URI=mongodb+srv://<user>:<password>@cluster0.dafmrk2.mongodb.net/Bookify

# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# Kafka Configuration
KAFKA_CLIENT_ID=bookify-server
KAFKA_BROKERS=localhost:29092
KAFKA_SERVICES_CREATED_TOPIC=services.created.v1

# JWT Configuration
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=24h

# Payment Gateway (if implemented)
PAYMENT_GATEWAY_API_KEY=your_payment_gateway_key

# CORS Configuration
ALLOWED_ORIGINS=http://localhost:3000,https://your-frontend-domain.com
```

## Docker Setup

### 1. Build the Docker Image

The application uses a multi-stage Docker build process for optimized production deployment:

```bash
# Build the production image
docker build -t bookify-server .

# To build a development image (with hot reloading)
docker build --target dev -t bookify-server:dev .
```

### 2. Run the Application with Docker

```bash
# Run the production container (requires external services)
docker run -d --name bookify-server \
  --env-file .env \
  -p 5000:5000 \
  bookify-server

# Run development container (for local development)
docker run -d --name bookify-server-dev \
  --env-file .env \
  -p 5000:5000 \
  -v $(pwd):/app \
  bookify-server:dev
```

### 3. Setup Kafka/Redpanda with Docker Compose

The application requires Kafka/Redpanda for event streaming. Use the provided Docker Compose file:

```bash
# Start Kafka/Redpanda services
docker-compose -f docker-compose.kafka.yml up -d

# Wait for services to be ready (approximately 30 seconds)
sleep 30

# Verify Redpanda is running
docker exec -it redpanda-bookify rpk cluster info

# Check topics
docker exec -it redpanda-bookify rpk topic list
```

### 4. Stop Docker Services

```bash
# Stop only Kafka/Redpanda
docker-compose -f docker-compose.kafka.yml down

# Stop the server container
docker stop bookify-server
docker rm bookify-server
```

## Kubernetes Deployment

### 1. Prepare Your Kubernetes Environment

First, ensure `kubectl` is configured for your cluster:

```bash
# Check kubectl connection
kubectl cluster-info

# Verify current context
kubectl config current-context
```

### 2. Deploy Supporting Services

Before deploying the main application, deploy supporting services:

```bash
# Create namespaces if needed
kubectl create namespace bookify || true

# Deploy MongoDB (or use external MongoDB service)
kubectl apply -f k8s/mongodb-deployment.yaml

# Deploy Redis
kubectl apply -f k8s/redis-deployment.yaml

# Deploy Redpanda (Kafka)
kubectl apply -f k8s/redpanda-deployment.yaml
```

### 3. Create Kubernetes Secrets

Store sensitive information securely in Kubernetes secrets:

```bash
# Create secrets for environment variables
kubectl create secret generic bookify-secrets \
  --from-literal=DB_USER=your_user \
  --from-literal=DB_PASSWORD=your_password \
  --from-literal=JWT_SECRET=your_jwt_secret \
  --from-literal=PAYMENT_GATEWAY_API_KEY=your_key
```

### 4. Deploy the Application

```bash
# Apply the main deployment
kubectl apply -f k8s/bookify-deployment.yaml

# Apply the service
kubectl apply -f k8s/bookify-service.yaml

# Apply the ingress (if configured)
kubectl apply -f k8s/bookify-ingress.yaml
```

### 5. Verify Deployment

```bash
# Check pods
kubectl get pods -n bookify

# Check services
kubectl get svc -n bookify

# Check deployments
kubectl get deployments -n bookify

# View logs
kubectl logs -f deployment/bookify-server -n bookify
```

### 6. Scale the Application

```bash
# Scale up to 3 replicas
kubectl scale deployment bookify-server -n bookify --replicas=3

# Check current replica count
kubectl get deployment bookify-server -n bookify
```

## Redpanda Kafka Setup

### 1. Understanding the Kafka Integration

Bookify uses Redpanda (Kafka-compatible) for event streaming:

- `services.created.v1` topic for new service/book creation events
- Events are published automatically when new books are created
- Other services can consume these events in real-time

### 2. Manual Kafka Topic Creation (if auto-creation is disabled)

```bash
# Access Redpanda container
docker exec -it redpanda-bookify rpk topic create services.created.v1

# Set topic properties (optional)
docker exec -it redpanda-bookify rpk topic alter-config services.created.v1 --set retention.ms=86400000
```

### 3. Kafka Consumer Group Setup

The application creates consumer groups automatically, but you can check them:

```bash
# List consumer groups
docker exec -it redpanda-bookify rpk group list

# Describe a specific consumer group
docker exec -it redpanda-bookify rpk group describe <consumer-group-name>
```

### 4. Testing Kafka Integration

```bash
# Produce a test message
docker exec -it redpanda-bookify rpk topic produce services.created.v1

# Consume messages (in a new terminal)
docker exec -it redpanda-bookify rpk topic consume services.created.v1 -f '%v\\n'
```

## Running the Application

### Development Mode

```bash
# Start supporting services (Kafka, Redis, MongoDB)
docker-compose -f docker-compose.kafka.yml up -d
# Ensure Redis and MongoDB are running too

# Install dependencies
yarn install

# Start the development server
yarn dev
```

### Production Mode

```bash
# Using Docker
docker build -t bookify-server .
docker run -d --env-file .env -p 5000:5000 bookify-server

# Using Kubernetes
kubectl apply -f k8s/
```

## Testing the Setup

### 1. Verify Services are Running

Check that all required services are accessible:

```bash
# Check if the server is responding
curl http://localhost:5000/

# Check MongoDB connection (if using a test script)
node test-db-connection.js

# Check Redis connection
node test-redis-connection.js

# Check Kafka connection
node test-kafka-connection.js
```

### 2. Test API Endpoints

```bash
# Health check
curl http://localhost:5000/

# Get categories
curl http://localhost:5000/api/categories

# Test user registration (example)
curl -X POST http://localhost:5000/api/users/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

### 3. Verify Kafka Events

Monitor the Kafka topic to ensure events are being published:

```bash
# Listen to the services.created.v1 topic
docker exec -it redpanda-bookify rpk topic consume services.created.v1 -f 'Consumed message at %p:%o: %v\\n'
```

Then perform an action that should trigger an event (like creating a new book listing) and verify the event appears in the topic.

## Troubleshooting

### Common Issues and Solutions

#### 1. Unable to Connect to Kafka

- Ensure Redpanda is running: `docker ps | grep redpanda`
- Check the Kafka broker address in your environment variables
- Verify the port mapping: `docker port redpanda-bookify`

#### 2. Database Connection Issues

- Verify MongoDB URI is correct in environment variables
- Check if MongoDB is accessible from your environment
- For MongoDB Atlas, ensure IP whitelist includes your IP

#### 3. Redis Connection Issues

- Ensure Redis server is running
- Verify Redis host and port in environment variables
- Check Redis authentication if password is required

#### 4. Docker Build Failures

- Verify Docker is running: `docker info`
- Check available disk space
- Clear Docker build cache: `docker builder prune`

#### 5. Kubernetes Deployment Failures

- Check if all required secrets are created
- Verify image pull secrets if using private registry
- Check resource limits and availability in the cluster

### Useful Commands for Debugging

```bash
# Check Docker logs
docker logs <container-name>
docker logs redpanda-bookify

# Check Kubernetes events
kubectl get events -n bookify

# Execute commands inside Kubernetes pods
kubectl exec -it <pod-name> -n bookify -- sh

# Port forward to access services locally
kubectl port-forward service/bookify-service 5000:5000 -n bookify

# Check resource usage
kubectl top pods -n bookify
```

## Production Considerations

### Security

- Use Kubernetes secrets for sensitive data
- Enable authentication for Kafka/Redpanda
- Implement proper network policies
- Use HTTPS and SSL/TLS encryption

### Monitoring and Logging

- Set up centralized logging (ELK stack, Fluentd, etc.)
- Implement metrics collection (Prometheus, Grafana)
- Set up health checks and alerts

### Scaling

- Configure Horizontal Pod Autoscaler (HPA)
- Use load balancers for traffic distribution
- Implement circuit breakers and resilience patterns

### Backup and Recovery

- Regular database backups
- Kafka topic backup strategies
- Disaster recovery plan

## Upgrading and Maintenance

### Updating the Application

1. Build new Docker image with updated code
2. Update Kubernetes deployment with new image tag
3. Use rolling updates to minimize downtime
4. Monitor application after deployment

### Kafka Migration

- Plan for schema evolution
- Use schema registry for message validation
- Implement backward compatibility
- Plan for topic reconfiguration

This initialization guide provides a comprehensive setup for running Bookify server with Docker, Kubernetes, and Redpanda Kafka integration. Follow these steps carefully to ensure a successful deployment.
