# NestJS Template

A production-ready NestJS template with Prisma, Redis, Swagger, and Docker support.

## Features

- 🚀 **NestJS** - A progressive Node.js framework
- 🗄️ **Prisma** - Next-generation ORM
- 🔄 **Redis** - In-memory data store
- 📚 **Swagger** - API documentation
- 🐳 **Docker** - Containerization support
- 📝 **Pino Logger** - Fast and low overhead logger
- 🔒 **Environment Configuration** - Secure environment management
- 🏥 **Health Checks** - System health monitoring
- 🧪 **Testing Setup** - Jest configuration
- 🔐 **Authentication** - OTP-based authentication with Redis
- 🔑 **Hash Module** - Secure hashing utilities
- 📬 **Queue System** - Robust queue system using Bull with Redis as the backend

## Prerequisites

- Node.js (v20 or higher)
- Docker and Docker Compose
- PostgreSQL
- Redis

## Quick Start

1. Clone the template:

```bash
git clone <your-repo-url>
cd nestjs-template
```

2. Install dependencies:

```bash
npm install
```

3. Set up environment variables:

```bash
cp .env.example .env
```

4. Start development server:

```bash
# Using npm
npm run start:dev

# Using Docker
docker-compose -f docker-compose.dev.yaml up
```

## Development

### Available Scripts

- `npm run start:dev` - Start development server
- `npm run build` - Build the application
- `npm run start:prod` - Start production server
- `npm run test` - Run tests
- `npm run test:e2e` - Run end-to-end tests
- `npm run lint` - Lint the code
- `npm run format` - Format the code
- `npm run prisma` - prisma generate and prisma migrate

### Docker Development

```bash
# Start all services
docker-compose -f docker-compose.dev.yaml up

# Start specific service
docker-compose -f docker-compose.dev.yaml up app

# View logs
docker-compose -f docker-compose.dev.yaml logs -f app
```

### Database Migrations

```bash
# Generate migration
npx prisma migrate dev --name <migration-name>

# Apply migrations
npx prisma migrate deploy

# Reset database
npx prisma migrate reset
```

## Production

### Docker Production

```bash
# Build and start all services
docker-compose up --build

# Start specific service
docker-compose up app

# View logs
docker-compose logs -f app
```

### Environment Variables

Required environment variables:

```env
# App
NODE_ENV=development
PORT=3000

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/dbname

# Redis
REDIS_URL=redis://localhost:6379
```

## API Documentation

Once the application is running, you can access the Swagger documentation at:

```
http://localhost:3000/api
```

## Project Structure

```
src/
├── configs/         # Configuration files
├── health/          # Health check endpoints
├── modules/         # Feature modules
│   └── auth/       # Authentication module
├── providers/       # Service providers
│   ├── hash/       # Hashing utilities
│   ├── prisma/     # Database provider
│   ├── redis/      # Redis provider
│   └── swagger/    # API documentation
└── app.module.ts    # Root module
```

## Authentication

The template includes an OTP-based authentication system with the following features:

- OTP generation and verification
- Redis-based token storage
- Secure OTP hashing
- Bearer token authentication
- Refresh token support

### Authentication Endpoints

```http
# Request OTP
POST /auth/send-otp
{
  "mobileNumber": "+1234567890"
}

# Verify OTP and get tokens
POST /auth/verify-otp
{
  "mobileNumber": "+1234567890",
  "otp": "123456"
}
Response:
{
  "accessToken": "access_token_here",
  "refreshToken": "refresh_token_here"
}

# Refresh tokens
POST /auth/refresh
{
  "refreshToken": "refresh_token_here"
}
Response:
{
  "accessToken": "new_access_token_here",
  "refreshToken": "new_refresh_token_here"
}

# Logout
POST /auth/logout
{
  "refreshToken": "refresh_token_here"
}

# Protected route example
GET /auth/profile
Authorization: Bearer <access_token>
```

### Environment Variables for Auth

```env
# Auth Configuration
AUTH_TOKEN_EXPIRES_IN=3600      # Access token expiration in seconds (1 hour)
AUTH_REFRESH_TOKEN_EXPIRES_IN=604800  # Refresh token expiration in seconds (7 days)
AUTH_OTP_EXPIRES_IN=300         # OTP expiration in seconds (5 minutes)
```

## Hash Module

The template includes a hash module with the following utilities:

- Base64 encoding/decoding
- Bcrypt password hashing

### Usage

```typescript
// Base64 encoding
const encoded = base64Service.toBase64('hello');
const decoded = base64Service.fromBase64(encoded);

// Bcrypt hashing
const hashed = bcryptService.hash('password');
const isMatch = bcryptService.compare('password', hashed);
```

## Queue System

The queue system uses Bull with Redis as the backend, providing a robust job processing solution with the following features:

## Features

- Multiple queue support (default, email, notification, SMS)
- Job retry mechanism with exponential backoff
- Job progress tracking
- Queue statistics and monitoring
- Automatic job cleanup
- Rate limiting
- Job prioritization
- Dead Letter Queue (DLQ) for failed jobs

## Available Queues

1. **Default Queue**

   - General purpose queue for background tasks
   - Example: data processing, report generation

2. **Email Queue**

   - Dedicated queue for email tasks
   - Processors:
     - `send-otp`: Send OTP via email
     - `send-welcome`: Send welcome emails

3. **SMS Queue**

   - Dedicated queue for SMS/WhatsApp messages
   - Processors:
     - `send-otp`: Send OTP via SMS/WhatsApp
     - `send-alert`: Send alert messages

4. **Notification Queue**

   - For push notifications and alerts
   - Ready for custom processors

5. **Dead Letter Queue (DLQ)**
   - Automatically receives failed jobs
   - Provides error tracking and recovery options

## Usage Examples

### Basic Job Addition

```typescript
// Add a job to email queue
await this.queueService.addToEmailQueue({
  name: 'send-otp',
  data: {
    to: 'user@example.com',
    otp: '123456',
  },
});
```

### With Rate Limiting

```typescript
// Limit to 100 SMS per minute
await this.queueService.addToSmsQueue(
  {
    name: 'send-otp',
    data: {
      to: '+1234567890',
      otp: '123456',
    },
  },
  {
    limiter: {
      max: 100,
      duration: 60 * 1000, // 1 minute
    },
  },
);
```

### With Priority

```typescript
// High priority OTP
await this.queueService.addToSmsQueue(
  {
    name: 'send-otp',
    data: {
      to: '+1234567890',
      otp: '123456',
    },
  },
  {
    priority: 1, // Highest priority (1-5, 1 being highest)
  },
);
```

### With Retry Options

```typescript
await this.queueService.addToEmailQueue(
  {
    name: 'send-otp',
    data: {
      to: 'user@example.com',
      otp: '123456',
    },
  },
  {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 1000,
    },
    removeOnComplete: true,
    removeOnFail: false,
  },
);
```

## Job Options

- `attempts`: Number of retry attempts
- `backoff`: Retry delay strategy
  - `type`: 'fixed' | 'exponential'
  - `delay`: Delay in milliseconds
- `priority`: Job priority (1-5, 1 being highest)
- `limiter`: Rate limiting options
  - `max`: Maximum jobs per duration
  - `duration`: Duration in milliseconds
- `removeOnComplete`: Remove job after completion
- `removeOnFail`: Remove job after failure
- `timeout`: Job timeout in milliseconds

## Monitoring

### Get Job Status

```typescript
const status = await this.queueService.getJobStatus('email', 'job-id');
```

### Get Queue Statistics

```typescript
const stats = await this.queueService.getQueueStats('email');
```

### Clean Queue

```typescript
// Clean completed and failed jobs older than 24 hours
await this.queueService.cleanQueue('email', 1000 * 60 * 60 * 24);
```

## Environment Variables

```env
# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=your_password
REDIS_DB=0
```

## Error Handling

Failed jobs are automatically moved to the Dead Letter Queue (DLQ) with:

- Original job data
- Error information
- Attempt count
- Timestamp

This allows for:

- Error tracking
- Job recovery
- Failure analysis
- Manual intervention if needed

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
