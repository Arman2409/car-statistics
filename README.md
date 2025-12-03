<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg" alt="Donate us"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow" alt="Follow us on Twitter"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

## Description

Car Statistics Backend API - A NestJS backend service for managing car data, processing high-volume car data ingestion, and providing statistics endpoints.

## Features

- ✅ JWT-based authentication with username/password
- ✅ Car CRUD operations (Create, Read, Update, Delete)
- ✅ High-volume data ingestion endpoint (handles ~2000 cars/minute)
- ✅ Statistics endpoints:
  - Average price per model (grouped by make + model)
  - Percentage distribution per make
  - Percentage distribution per model
- ✅ Swagger API documentation at `/api/docs`
- ✅ Input validation using class-validator and class-transformer
- ✅ PostgreSQL database with TypeORM
- ✅ Comprehensive unit and E2E tests

## Prerequisites

- Node.js (v18 or higher)
- PostgreSQL (v12 or higher)
- pnpm (or npm/yarn)

## Project Setup

### 1. Install Dependencies

```bash
$ pnpm install
```

### 2. Database Setup

Create a PostgreSQL database:

```bash
$ createdb car_statistics
```

Or using psql:

```sql
CREATE DATABASE car_statistics;
```

### 3. Environment Configuration

Create a `.env` file in the root directory:

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_NAME=car_statistics

# JWT Configuration
JWT_SECRET=your-secret-key-change-in-production
JWT_EXPIRES_IN=1d

# Application Configuration
PORT=3000
NODE_ENV=development
```

**Important:** Change `JWT_SECRET` to a strong, random string in production!

### 4. Run Database Migrations

The application uses TypeORM's `synchronize` option in development mode, which automatically creates/updates database tables. In production, disable this and use migrations instead.

### 5. Create Initial User

You can create a user using the seed script:

```bash
# Create a user with default credentials (admin/admin123)
$ pnpm run seed:user

# Or specify custom username and password
$ pnpm run seed:user myusername mypassword
```

Alternatively, you can create a user directly in the database (password must be hashed using bcrypt) or use the Swagger UI after starting the server.

## Running the Application

### Development Mode

```bash
# watch mode (recommended for development)
$ pnpm run start:dev

# standard start
$ pnpm run start
```

The application will be available at `http://localhost:3000`
Swagger documentation will be available at `http://localhost:3000/api/docs`

### Production Mode

```bash
# build the application
$ pnpm run build

# run in production mode
$ pnpm run start:prod
```

## API Endpoints

### Authentication

- `POST /auth/login` - Login with username and password, returns JWT token

### Cars (Protected - Requires JWT Token)

- `POST /cars` - Create a single car
- `POST /cars/bulk` - Bulk create cars (for data ingestion)
- `GET /cars` - List all cars
- `GET /cars/:id` - Get car by ID
- `PATCH /cars/:id` - Update car
- `DELETE /cars/:id` - Delete car

### Statistics (Protected - Requires JWT Token)

- `GET /cars/stats/average-price-per-model` - Average price per model (grouped by make + model)
- `GET /cars/stats/make-percentage` - Percentage distribution per make
- `GET /cars/stats/model-percentage` - Percentage distribution per model

## Authentication

All `/cars` routes are protected with JWT authentication. To access them:

1. Login using `POST /auth/login` with username and password
2. Copy the `access_token` from the response
3. Include it in subsequent requests as: `Authorization: Bearer <token>`

Example using curl:

```bash
# Login
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"yourusername","password":"yourpassword"}'

# Use the token
curl -X GET http://localhost:3000/cars \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## Data Ingestion

The application provides a bulk ingestion endpoint at `POST /cars/bulk` that accepts an array of car objects. This endpoint is designed to handle high-volume data (approximately 2000 cars per minute).

Example request:

```json
{
  "cars": [
    {
      "normalizedMake": "toyota",
      "normalizedModel": "corolla",
      "year": 2020,
      "price": 25000,
      "location": "New York, NY"
    },
    {
      "normalizedMake": "bmw",
      "normalizedModel": "3-series",
      "year": 2021,
      "price": 35000,
      "location": "Los Angeles, CA"
    }
  ]
}
```

### Integration with Data Seeder

To integrate with the AMA-task-data-seeder project:

1. Fork/clone the data-seeder repository
2. Configure it to send POST requests to `http://localhost:3000/cars/bulk`
3. Include the JWT token in the Authorization header
4. Send car data in batches for optimal performance

## Testing

### Unit Tests

```bash
# run unit tests
$ pnpm run test

# run tests in watch mode
$ pnpm run test:watch

# run tests with coverage
$ pnpm run test:cov
```

### E2E Tests

```bash
# run e2e tests
$ pnpm run test:e2e
```

**Note:** E2E tests require a running PostgreSQL database. Make sure your `.env` file is configured correctly.

## Project Structure

```
src/
├── auth/              # Authentication module
│   ├── dto/          # Data Transfer Objects
│   ├── auth.service.ts
│   ├── auth.controller.ts
│   ├── jwt.strategy.ts
│   └── jwt-auth.guard.ts
├── users/            # Users module
│   ├── entities/     # User entity
│   └── users.service.ts
├── cars/             # Cars module
│   ├── dto/          # Car DTOs
│   ├── entities/     # Car entity
│   ├── cars.service.ts
│   └── cars.controller.ts
├── config/           # Configuration files
│   ├── database.config.ts
│   └── jwt.config.ts
├── app.module.ts     # Root module
└── main.ts           # Application entry point
```

## Swagger Documentation

Once the application is running, visit `http://localhost:3000/api/docs` to access the interactive Swagger documentation. You can:

- View all available endpoints
- See request/response schemas
- Test endpoints directly from the browser
- Authenticate using the "Authorize" button

## Validation

All incoming data is validated using `class-validator` and `class-transformer`. Invalid requests will return detailed error messages indicating what validation failed.

Example validation errors:

```json
{
  "statusCode": 400,
  "message": [
    "normalizedMake should not be empty",
    "year must be an integer number",
    "price must be a positive number"
  ],
  "error": "Bad Request"
}
```

## Performance Considerations

- The bulk ingestion endpoint uses batch inserts for optimal performance
- Database indexes are created on `(normalizedMake, normalizedModel)` for faster statistics queries
- Consider using connection pooling in production
- For very high loads, consider implementing a message queue (RabbitMQ, Kafka) instead of direct HTTP

## Troubleshooting

### Database Connection Issues

- Verify PostgreSQL is running: `pg_isready`
- Check database credentials in `.env`
- Ensure the database exists: `psql -l | grep car_statistics`

### Authentication Issues

- Verify JWT_SECRET is set in `.env`
- Check token expiration time
- Ensure user exists in the database

### Port Already in Use

- Change `PORT` in `.env` file
- Or kill the process using the port: `lsof -ti:3000 | xargs kill`

## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).

## Deployment

When you're ready to deploy your NestJS application to production, there are some key steps you can take to ensure it runs as efficiently as possible. Check out the [deployment documentation](https://docs.nestjs.com/deployment) for more information.

If you are looking for a cloud-based platform to deploy your NestJS application, check out [Mau](https://mau.nestjs.com), our official platform for deploying NestJS applications on AWS. Mau makes deployment straightforward and fast, requiring just a few simple steps:

```bash
$ pnpm install -g @nestjs/mau
$ mau deploy
```

With Mau, you can deploy your application in just a few clicks, allowing you to focus on building features rather than managing infrastructure.

## Resources

Check out a few resources that may come in handy when working with NestJS:

- Visit the [NestJS Documentation](https://docs.nestjs.com) to learn more about the framework.
- For questions and support, please visit our [Discord channel](https://discord.gg/G7Qnnhy).
- To dive deeper and get more hands-on experience, check out our official video [courses](https://courses.nestjs.com/).
- Deploy your application to AWS with the help of [NestJS Mau](https://mau.nestjs.com) in just a few clicks.
- Visualize your application graph and interact with the NestJS application in real-time using [NestJS Devtools](https://devtools.nestjs.com).
- Need help with your project (part-time to full-time)? Check out our official [enterprise support](https://enterprise.nestjs.com).
- To stay in the loop and get updates, follow us on [X](https://x.com/nestframework) and [LinkedIn](https://linkedin.com/company/nestjs).
- Looking for a job, or have a job to offer? Check out our official [Jobs board](https://jobs.nestjs.com).

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://twitter.com/kammysliwiec)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).
