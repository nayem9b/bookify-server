# Bookify Server

Bookify is a comprehensive online book marketplace platform that connects buyers and sellers. This repository contains the server-side implementation built with Node.js, Express, and MongoDB, with integrated messaging via Kafka/Redpanda for event streaming.

## 📋 Table of Contents

- [Features](#-features)
- [Architecture](#-architecture)
- [Tech Stack](#-tech-stack)
- [Getting Started](#-getting-started)
- [Docker Setup](#-docker-setup)
- [Kubernetes Deployment](#-kubernetes-deployment)
- [Redpanda Kafka Integration](#-redpanda-kafka-integration)
- [API Endpoints](#-api-endpoints)
- [Environment Variables](#-environment-variables)
- [Project Structure](#-project-structure)
- [Development](#-development)

## Features

- **User Management**: Registration, authentication, and role-based access (Buyers/Sellers/Admins)
- **Book Management**: Add, edit, delete, and browse books with categorization
- **Booking System**: Secure booking and reservation functionality
- **Wishlist**: Save favorite books for future reference
- **Inventory Management**: Seller-specific product management
- **Advertising**: Promote books with featured listings
- **Payment Integration**: Secure payment processing
- **Event Streaming**: Real-time event handling with Kafka/Redpanda
- **Caching**: Redis integration for performance optimization
- **Database**: MongoDB with connection pooling and optimization

## Architecture

The Bookify server follows a microservice-inspired architecture with:

```
Client Applications (Web/Mobile)
    ↓ HTTP/REST API
Bookify Server (Node.js/Express)
    ↓ Internal Services
└── Database Layer (MongoDB)
└── Cache Layer (Redis)
└── Message Broker (Redpanda/Kafka)
    ↓ Event Processing
└── GraphQL Service (Consumer)
```

## Tech Stack

- **Runtime**: Node.js v24.x
- **Framework**: Express.js
- **Database**: MongoDB (with Mongoose ODM)
- **Cache**: Redis
- **Message Broker**: Redpanda (Kafka-compatible)
- **Containerization**: Docker & Docker Compose
- **Orchestration**: Kubernetes
- **Language**: JavaScript/TypeScript
- **Package Manager**: Yarn

## Getting Started

### Prerequisites

- Node.js v24.x or higher
- Yarn package manager
- MongoDB Atlas account or local MongoDB instance
- Docker & Docker Compose (for containerized setup)
- Kubernetes cluster (for production deployment)

### Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd Bookify/server
```

2. Install dependencies:

```bash
yarn install
```

3. Create environment file:

```bash
cp .env.example .env
```

4. Configure environment variables (see [Environment Variables](#-environment-variables) section)

5. Start the development server:

```bash
yarn dev
```

## Docker Setup

The application is configured with a multi-stage Docker build process for optimized production deployment.

### Building the Docker Image

```bash
# Build the production image
docker build -t bookify-server .

# Build specific stage (e.g., dev environment)
docker build --target dev -t bookify-server:dev .
```

### Running with Docker Compose

The server includes a Kafka/Redpanda setup in a separate Docker Compose file:

```bash
# Start Kafka/Redpanda services
docker-compose -f docker-compose.kafka.yml up -d

# Stop Kafka/Redpanda services
docker-compose -f docker-compose.kafka.yml down
```

### Container Environment

The Docker image includes:

- Multi-stage build (builder, pruner, runner)
- Production-optimized dependency installation
- Health checks
- Security best practices (non-root user)

## Kubernetes Deployment

The project includes Kubernetes configuration files in the `k8s/` directory for production deployment.

### Deploying to Kubernetes

1. Ensure you have `kubectl` configured to your cluster
2. Apply the Kubernetes manifests:

```bash
kubectl apply -f k8s/
```

### Kubernetes Manifests Include:

- Deployments for the main server
- Services for internal and external communication
- ConfigMaps for environment configuration
- Secrets for sensitive data
- Persistent Volumes for data storage
- Network Policies for security
- Health checks and resource limits

## Redpanda Kafka Integration

The Bookify server uses Redpanda (a Kafka-compatible message broker) for event streaming and real-time communication between services.

### Kafka Topics

- `services.created.v1` - Events for new services/book listings
- Additional topics are configured in the application

### Setting Up Redpanda

```bash
# Start Redpanda with Docker Compose
cd server
docker-compose -f docker-compose.kafka.yml up -d

# Check Redpanda status
docker exec -it redpanda-bookify rpk cluster info
```

### Kafka Configuration

The application automatically connects to Kafka on startup and handles event publishing and consumption.

## API Endpoints

### User Management

- `POST /api/users/register` - Register new user
- `POST /api/users/login` - User login
- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get specific user
- `DELETE /api/users/:id` - Delete user
- `GET /api/users/admin/:email` - Check if user is admin
- `GET /api/users/sellers` - Get all sellers
- `GET /api/users/buyers` - Get all buyers

### Book Management

- `GET /api/books` - Get all books
- `GET /api/books/:id` - Get specific book
- `POST /api/books` - Add new book
- `PUT /api/books/:id` - Update book
- `DELETE /api/books/:id` - Delete book
- `GET /api/books/category/:category` - Get books by category

### Categories

- `GET /api/categories` - Get all categories
- `GET /api/categories/:category` - Get books in specific category

### Booking System

- `POST /api/bookings` - Create new booking
- `GET /api/bookings` - Get all bookings
- `GET /api/bookings/:id` - Get specific booking
- `DELETE /api/bookings/:id` - Cancel booking

### Wishlist

- `POST /api/wishlist` - Add to wishlist
- `GET /api/wishlist` - Get wishlist items
- `DELETE /api/wishlist/:id` - Remove from wishlist

### Payment

- `POST /api/payments` - Process payment
- `GET /api/payments/:id` - Get payment status

## 🔐 Environment Variables

Create a `.env` file in the root directory with the following variables:

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

## 📁 Project Structure

```
server/
├── index.js                    # Legacy server entry point
├── src/                        # Source code directory
│   ├── server.js              # Main server entry point
│   ├── config/                # Configuration files
│   │   └── db.js              # Database connection
│   ├── controllers/           # Business logic controllers
│   ├── messaging/             # Kafka/Redpanda integration
│   │   └── kafka.js           # Kafka initialization
│   ├── middleware/            # Express middleware
│   ├── models/                # Database models
│   ├── routes/                # API route definitions
│   ├── services/              # Business logic services
│   ├── utils/                 # Utility functions
│   │   └── redis.js           # Redis connection
│   └── validations/           # Input validation schemas
├── Dockerfile                 # Multi-stage Docker build
├── docker-compose.kafka.yml   # Kafka/Redpanda setup
├── k8s/                       # Kubernetes manifests
├── KAFKA_SETUP.md             # Kafka setup documentation
├── redpanda-console-config.yml # Redpanda console configuration
└── README.md                  # This file
```

## Development

### Running in Development Mode

```bash
# Install dependencies
yarn install

# Start in development mode with auto-reload
yarn dev

# Build for production
yarn build

# Run production build
yarn start
```

### Development Scripts

The project uses Yarn for dependency management and task execution. Common scripts include:

- `yarn dev` - Start development server with nodemon
- `yarn build` - Build production-ready code
- `yarn start` - Start production server
- `yarn lint` - Lint the codebase
- `yarn test` - Run tests
- `yarn clean` - Clean build artifacts

### Code Quality

- ESLint for code linting
- Prettier for code formatting
- JSDoc for documentation

### Testing

The project includes comprehensive testing setup:

```bash
# Run all tests
yarn test

# Run tests in watch mode
yarn test:watch

# Run tests with coverage
yarn test:coverage
```

## Troubleshooting

### Common Issues

**Kafka Connection Issues:**

- Ensure Redpanda is running: `docker ps | grep redpanda`
- Check broker connectivity: `telnet localhost 29092`
- Verify environment variables are set correctly

**Database Connection Issues:**

- Verify MongoDB connection string is correct
- Check network connectivity to MongoDB Atlas
- Ensure credentials have proper permissions

**Redis Connection Issues:**

- Ensure Redis server is running
- Check Redis host and port configuration
- Verify Redis password if authentication is enabled

**Docker Build Issues:**

- Ensure Docker is running and properly configured
- Check Dockerfile syntax
- Verify multi-stage build dependencies

### Development Tips

1. **Environment Setup**: Always use a `.env` file for configuration
2. **Database Migrations**: Use proper migration scripts for schema changes
3. **API Documentation**: Update API documentation when adding new endpoints
4. **Error Handling**: Implement comprehensive error handling and logging
5. **Security**: Sanitize all user inputs and validate API requests

### Logs and Monitoring

The application includes comprehensive logging:

- Console logs for development
- Structured logs for production
- Error tracking and reporting
- Performance monitoring hooks

## Scaling

### Horizontal Scaling

The application is designed for horizontal scaling:

- Stateless design allows multiple instances
- Database connection pooling
- Redis for session storage and caching
- Load balancing via Kubernetes services

### Performance Optimization

- Redis caching for frequently accessed data
- Connection pooling for database operations
- Event-driven architecture for non-blocking operations
- Proper indexing in MongoDB
- Efficient API endpoint design

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

If you encounter any issues or have questions:

- Check the existing [issues](https://github.com/your-username/bookify-server/issues)
- Create a new issue with detailed information
- Consult the documentation in the `docs/` directory
- Contact the maintainers directly
