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
├── providers/       # Service providers
│   ├── prisma/     # Database provider
│   ├── redis/      # Redis provider
│   └── swagger/    # API documentation
└── app.module.ts    # Root module
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
