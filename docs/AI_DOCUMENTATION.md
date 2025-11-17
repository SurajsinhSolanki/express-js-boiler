# Express.js TypeScript Boilerplate - AI Documentation

## Project Overview

**Project Name**: express
**Version**: 1.0.0  
**Description**: A comprehensive Express.js backend  
**Author**: Surajsinh

## Tech Stack

### Core Technologies
- **Runtime**: Node.js with TypeScript 5.9.3
- **Framework**: Express.js 5.1.0
- **Build Tool**: TSU (for bundling)
- **Development**: TSX (for dev server)
- **Package Manager**: PNPM

### Database Layer (Dual Database Architecture)
- **Primary**: PostgreSQL with Drizzle ORM (drizzle-orm 0.44.7)
- **Secondary**: MongoDB with Mongoose (mongoose 8.19.4)
- **Database Tools**: 
  - Drizzle Kit (for migrations)
  - pg (PostgreSQL client)

### Authentication & Security
- **JWT**: jsonwebtoken 9.0.2 with RS256 algorithm
- **Password Hashing**: bcryptjs 3.0.3
- **Security Middleware**: 
  - Helmet 8.1.0
  - CORS 2.8.5
  - express-rate-limit 8.2.1
  - compression 1.8.1

### Validation & Schema
- **Schema Validation**: Zod 4.1.12
- **OpenAPI Integration**: zod-openapi 5.4.3
- **OpenAPI Types**: openapi-types 12.1.3

### Real-time & Communication
- **WebSockets**: Socket.IO 4.8.1
- **Email**: Nodemailer 7.0.10
- **Templates**: EJS 3.1.10
- **HTTP Client**: Axios 1.13.2

### Monitoring & Observability
- **Metrics**: prom-client 15.1.3
- **Logging**: Pino 9.14.0 with pino-http 10.5.0
- **Request Logging**: Morgan 1.10.1
- **Internationalization**: i18next 25.6.2

### Testing & Quality
- **Testing**: Vitest 3.2.4
- **Coverage**: @vitest/coverage-v8 3.2.4
- **Linting**: Biome 2.3.5
- **Code Quality**: SonarQube integration

## Architecture Patterns

### 1. Layered Architecture
```
Controller Layer (API endpoints)
    ↓
Service Layer (Business logic)
    ↓
Repository Layer (Data access)
    ↓
Model Layer (Data schemas)
```

### 2. Middleware Pipeline
```
Request → Security → Logging → Authentication → Authorization → Validation → Controller
```

### 3. Service Response Pattern
All API responses follow a standardized structure:
```typescript
{
  success: boolean;
  message: string;
  responseObject: T;
  statusCode: number;
}
```

### 4. OpenAPI Documentation
Auto-generated API documentation with:
- Schema validation
- Security definitions
- Response examples
- Parameter documentation

## Project Structure

### Root Level Files
- `package.json` - Dependencies and scripts
- `tsconfig.json` - TypeScript configuration
- `biome.json` - Code linting rules
- `vitest.config.ts` - Testing configuration
- `.env.example` - Environment variables template
- `Dockerfile` - Container configuration

### Source Code Organization (`src/`)

#### Core Application Files
- `index.ts` - Application entry point with clustering support
- `server.ts` - Express server configuration and middleware setup

#### API Layer (`src/api/`)
```
api/
├── docs/               # OpenAPI documentation
│   ├── openAPIRouter.ts           # Swagger UI router
│   ├── openAPIDocumentGenerator.ts # API doc generator
│   └── openAPIResponseBuilders.ts  # Response builders
├── healthCheck/        # Health check endpoints
│   └── healthCheckRouter.ts
├── monitoring/         # Metrics and monitoring
│   ├── metrics.controller.ts
│   ├── metrics.middleware.ts
│   └── metrics.service.ts
├── upload/            # File upload handling
│   ├── uploadController.ts
│   └── uploadRouter.ts
└── user/              # User management (comprehensive example)
    ├── userController.ts
    ├── userModel.ts
    ├── userRepository.ts
    ├── userRouter.ts
    └── userService.ts
```

#### Common/Shared Layer (`src/common/`)
```
common/
├── config/            # Configuration management
│   ├── database.ts     # Database connections
│   └── keys.ts         # RSA key management
├── middleware/        # Custom middleware
│   ├── authMiddleware.ts      # JWT authentication
│   ├── roleMiddleware.ts      # Role-based authorization
│   ├── errorHandler.ts        # Global error handling
│   ├── compression.middleware.ts
│   ├── cors.middleware.ts
│   ├── helmet.middleware.ts
│   ├── rateLimiter.ts
│   └── requestLogger.ts
├── models/            # Shared data models
│   ├── serviceResponse.ts     # Standard response format
│   └── errorLogModel.ts
└── utils/             # Utility functions
    ├── config.ts             # Environment configuration
    ├── jwt.ts                # JWT utilities
    ├── logger.ts             # Logging utilities
    ├── httpHandlers.ts       # HTTP response helpers
    ├── emailService.ts       # Email sending
    ├── socketService.ts      # WebSocket handling
    ├── prometheus.ts         # Metrics collection
    └── security.ts           # Security utilities
```

#### Constants (`src/constants/`)
```
constants/
├── config.ts          # Application settings
├── errors.ts          # Error definitions
├── routes.ts          # Route definitions
├── permissions.ts     # Role permissions
└── statusCodes.ts     # HTTP status codes
```

#### Additional Directories
- `src/drizzle/` - Database schema definitions
- `src/locales/` - i18n translations (EN/ES)
- `src/templates/` - Email templates (EJS)
- `src/types/` - TypeScript type definitions

## Key Patterns & Best Practices

### 1. Authentication & Authorization
```typescript
// JWT-based authentication with RS256
export const authenticate = (req: Request, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    // Handle missing/invalid token
  }
  const token = authHeader.split(" ")[1];
  const decoded = verifyAccessToken(token);
  if (!decoded) {
    // Handle invalid token
  }
  req.user = decoded;
  next();
};

// Role-based authorization
export const authorize = (allowedRoles: ("admin" | "user")[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user?.role || !allowedRoles.includes(req.user.role)) {
      // Handle unauthorized access
    }
    next();
  };
};
```

### 2. Route Configuration
```typescript
// Standardized route with validation and documentation
userRouter.get(
  "/:id", 
  authenticate, 
  validateRequest(GetUserSchema), 
  userController.getUser
);

// OpenAPI documentation integrated
const userPaths = {
  [buildRoute(API_VERSION.V1, ROUTES.USERS, ROUTES.ID)]: {
    get: {
      tags: ["User"],
      security: [{ BearerAuth: [] }],
      parameters: [/* parameter definitions */],
      responses: {
        200: {
          description: "Success",
          content: {
            "application/json": {
              schema: UserSchema
            }
          }
        }
      }
    }
  }
};
```

### 3. Service Response Pattern
```typescript
// Standardized API responses
export class ServiceResponse<T = null> {
  static success<T>(message: string, responseObject: T, statusCode: number = StatusCodes.OK) {
    return new ServiceResponse(true, message, responseObject, statusCode);
  }
  
  static failure<T>(message: string, responseObject: T, statusCode: number = StatusCodes.BAD_REQUEST) {
    return new ServiceResponse(false, message, responseObject, statusCode);
  }
}
```

### 4. Database Integration
```typescript
// Dual database approach
// PostgreSQL with Drizzle
const pool = new Pool({
  connectionString: ENV.P_SQL_DATABASE_URL,
});
const db = drizzle(pool, { schema });

// MongoDB with Mongoose
await mongoose.connect(ENV.MONGO_DATABASE_URL);
```

### 5. Error Handling
```typescript
// Global error handler middleware
app.use(errorHandler());

// Structured error responses with logging
const errorHandler = () => {
  return (err: Error, req: Request, res: Response, next: NextFunction) => {
    logger.error({ error: err, request: req }, "Unhandled error");
    const serviceResponse = ServiceResponse.failure(
      "Internal server error",
      null,
      StatusCodes.INTERNAL_SERVER_ERROR
    );
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(serviceResponse);
  };
};
```

## Available Scripts

### Development
```bash
npm run start:dev    # Start development server with hot reload
npm run type-check   # Run TypeScript type checking
npm run format       # Format code with Biome
npm run lint         # Check code quality
```

### Building & Production
```bash
npm run build        # Build for production
npm run start:prod   # Start production build
npm run clean        # Clean build directory
```

### Testing & Quality
```bash
npm run test         # Run tests with Vitest
npm run coverage     # Generate test coverage
npm run sonar        # Run SonarQube analysis
```

### Database
```bash
npm run sample-env   # Generate sample environment file
npm run migrate      # Database migrations (Drizzle)
```

## Environment Configuration

### Required Environment Variables
```bash
# Server Configuration
NODE_ENV=development
PORT=3000
HOST=localhost

# Database URLs
P_SQL_DATABASE_URL=postgresql://user:pass@localhost:5432/dbname
MONGO_DATABASE_URL=mongodb://localhost:27017/dbname

# JWT Configuration
JWT_SECRET=your-secret-key
JWT_EXPIRY=15m
REFRESH_TOKEN_EXPIRY=7d
JWT_ISSUER=your-app
JWT_AUDIENCE=your-app-users

# API Documentation
SWAGGER_USER=admin
SWAGGER_PASS=password

# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-password

# Feature Flags
CLUSTER_ENABLED=false
WEBSOCKETS_ENABLED=true
```

## API Endpoints

### User Management (`/api/v1/users`)
```
GET    /                       # Get all users (Admin only)
GET    /admin/all             # Get all users (Admin only)
GET    /:id                   # Get user by ID (Authenticated)
GET    /email/:email          # Find user by email
GET    /phone-number/:phone   # Find user by phone number
POST   /                      # Create new user
PUT    /:id                   # Update user (Authenticated, Admin/User)
DELETE /:id                   # Delete user (Admin only)
POST   /login                 # User authentication
POST   /refresh-token         # Refresh JWT tokens
```

### File Upload (`/api/v1/upload`)
```
POST   /                      # Upload files
```

### Health Check (`/api/health-check`)
```
GET    /                      # Health check endpoint
```

### Monitoring (`/api`)
```
GET    /metrics               # Prometheus metrics
```

### API Documentation (`/api/docs`)
```
GET    /swagger.json          # OpenAPI JSON specification
GET    /                      # Swagger UI (Basic Auth protected)
```

## Security Features

### 1. Authentication
- JWT tokens with RS256 algorithm
- Access tokens (15 minutes expiry)
- Refresh tokens (7 days expiry)
- Token-based API authentication

### 2. Authorization
- Role-based access control (Admin/User)
- Route-level permission checking
- Resource-level authorization

### 3. Security Headers
- Helmet.js for security headers
- CORS configuration
- Rate limiting
- Request compression

### 4. Data Protection
- Password hashing with bcryptjs
- Input validation with Zod
- SQL injection prevention (Drizzle ORM)
- XSS protection

## Monitoring & Observability

### 1. Logging
- Pino structured logging
- Request/response logging
- Error tracking
- Child logger pattern

### 2. Metrics
- Prometheus metrics collection
- Custom application metrics
- Performance monitoring

### 3. Health Checks
- Database connectivity checks
- Service health endpoints
- System status monitoring

## Testing Strategy

### 1. Unit Testing
- Vitest framework
- Component testing
- Utility function testing
- Middleware testing

### 2. Integration Testing
- API endpoint testing
- Database integration tests
- Authentication flow tests

### 3. Coverage
- Code coverage with v8
- SonarQube quality analysis
- Quality gates

## Deployment Considerations

### 1. Clustering
- PM2-style clustering support
- Load balancing capabilities
- Worker process management

### 2. Docker Support
- Multi-stage Docker builds
- Production-ready containerization
- Environment-specific configurations

### 3. Database Migrations
- Drizzle Kit for schema management
- Version-controlled database changes
- Rollback capabilities

## Internationalization

### 1. Multi-language Support
- i18next integration
- English and Spanish translations
- Dynamic language switching

### 2. Date/Time Localization
- Luxon for date handling
- Timezone support
- Custom date formats

## Real-time Features

### 1. WebSocket Support
- Socket.IO integration
- Real-time communication
- Event-driven architecture

### 2. Notification System
- Email notifications
- Template-based emails
- Event-triggered messaging

## Development Workflow

### 1. Code Quality
- Biome linting and formatting
- TypeScript strict mode
- ESLint alternatives

### 2. Git Hooks
- Husky integration
- Pre-commit hooks
- Automatic formatting

### 3. Development Tools
- Hot reloading with TSX
- Source maps
- Debug configuration

## Common Tasks for AI

### Adding New API Endpoints
1. Create route in appropriate `src/api/{module}/{module}Router.ts`
2. Define Zod schemas in `src/api/{module}/{module}Model.ts`
3. Implement controller logic in `src/api/{module}/{module}Controller.ts`
4. Add business logic in `src/api/{module}/{module}Service.ts`
5. Update OpenAPI documentation
6. Add tests

### Adding New Database Models
1. Define schema in `src/drizzle/schema.ts` (PostgreSQL)
2. Create Mongoose schemas if using MongoDB
3. Generate migration files
4. Update type definitions

### Adding New Middleware
1. Create middleware file in `src/common/middleware/`
2. Implement logic with proper error handling
3. Add to `src/server.ts` middleware pipeline
4. Write tests for middleware

### Adding New Utilities
1. Create utility file in `src/common/utils/`
2. Follow existing patterns
3. Add proper TypeScript types
4. Write unit tests

### Configuration Management
1. Update `src/constants/config.ts`
2. Add environment variables
3. Update type definitions
4. Update documentation

## Troubleshooting Guide

### Common Issues
1. **Port conflicts**: Server automatically finds available ports
2. **Database connections**: Check environment variables and connection strings
3. **JWT token issues**: Verify RSA key pairs and configuration
4. **CORS errors**: Configure allowed origins in middleware
5. **Build failures**: Check TypeScript compilation and dependencies

### Debugging Tips
1. Use structured logging with Pino
2. Check Prometheus metrics for performance
3. Use health check endpoints for connectivity
4. Enable debug logging in development
5. Use OpenAPI docs for API testing

---

This documentation provides a comprehensive overview for AI assistance with the Express.js TypeScript boilerplate project. It covers architecture patterns, best practices, common patterns, and troubleshooting guidance to enable efficient development and maintenance.