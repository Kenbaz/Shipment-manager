# Shipment Management API

A production-ready RESTful API for managing shipments built with Node.js, Express, TypeScript, and MongoDB.

![Node.js](https://img.shields.io/badge/Node.js-18+-green)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue)
![MongoDB](https://img.shields.io/badge/MongoDB-7.x-green)
![Express](https://img.shields.io/badge/Express-4.x-lightgrey)
![License](https://img.shields.io/badge/License-ISC-yellow)

## 🌐 Live Demo

**Live URL:** `https://shipment-manager-production-6810.up.railway.app`

**API Documentation (Swagger):** `https://shipment-manager-production-6810.up.railway.app/api-docs`

**Health Check:** `https://shipment-manager-production-6810.up.railway.app/health`

---

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Quick Start](#-quick-start)
- [API Endpoints](#-api-endpoints)
- [Testing the API](#-testing-the-api)
- [Project Structure](#-project-structure)
- [Environment Variables](#-environment-variables)
- [Running Tests](#-running-tests)
- [Deployment](#-deployment)
- [API Documentation](#-api-documentation)

---

## ✨ Features

- **Full CRUD Operations** - Create, Read, Update, Delete shipments
- **API Versioning** - Routes prefixed with `/api/v1/` for future compatibility
- **Pagination** - Configurable page size with metadata
- **Filtering** - Filter by status, origin, destination, date range
- **Sorting** - Sort by any field in ascending or descending order
- **Search** - Full-text search on sender/receiver names
- **Status Transitions** - Business logic enforcing valid status changes
- **Input Validation** - Comprehensive request validation using Joi
- **Error Handling** - Consistent error responses with detailed messages
- **Security** - Helmet, CORS, and rate limiting middleware
- **Documentation** - Interactive Swagger/OpenAPI documentation
- **Health Checks** - Liveness and readiness probes for container orchestration
- **TypeScript** - Full type safety throughout the codebase
- **Testing** - Comprehensive integration tests with Jest

---

## 🛠 Tech Stack

| Technology | Purpose |
|------------|---------|
| Node.js 18+ | Runtime environment |
| TypeScript | Type-safe JavaScript |
| Express | Web framework |
| MongoDB | Database |
| Mongoose | MongoDB ODM |
| Joi | Request validation |
| Swagger | API documentation |
| Jest | Testing framework |
| Helmet | Security headers |

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18 or higher
- MongoDB (local or Atlas)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/shipment-api.git
   cd shipment-api
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` with your configuration:
   ```env
   NODE_ENV=development
   PORT=3000
   MONGODB_URI=mongodb://connection url
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Access the API**
   - API Base: http://localhost:3000
   - Swagger Docs: http://localhost:3000/api-docs
   - Health Check: http://localhost:3000/health

---

## 📡 API Endpoints

### Base URL
- **Local:** `http://localhost:3000`
- **Production:** `https://shipment-manager-production-6810.up.railway.app`

### Shipment Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/v1/shipments` | Get all shipments (with pagination, filtering, sorting) |
| `GET` | `/api/v1/shipments/:id` | Get a single shipment by ID |
| `POST` | `/api/v1/shipments` | Create a new shipment |
| `PUT` | `/api/v1/shipments/:id` | Update an existing shipment |
| `DELETE` | `/api/v1/shipments/:id` | Delete a shipment |

### Health Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/health` | Full health check with database status |
| `GET` | `/health/ready` | Readiness probe |
| `GET` | `/health/live` | Liveness probe |

### Query Parameters (GET /api/v1/shipments)

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | number | 1 | Page number |
| `limit` | number | 10 | Items per page (max 100) |
| `sortBy` | string | createdAt | Field to sort by |
| `order` | string | desc | Sort order (asc/desc) |
| `status` | string | - | Filter by status |
| `origin` | string | - | Filter by origin (partial match) |
| `destination` | string | - | Filter by destination (partial match) |
| `search` | string | - | Search in sender/receiver names |
| `startDate` | date | - | Filter by creation date (from) |
| `endDate` | date | - | Filter by creation date (to) |

---

## 🧪 Testing the API

### Using cURL

**Create a shipment:**
```bash
curl -X POST https://shipment-manager-production-6810.up.railway.app/api/v1/shipments \
  -H "Content-Type: application/json" \
  -d '{
    "senderName": "John Doe",
    "receiverName": "Jane Smith",
    "origin": "Lagos, Nigeria",
    "destination": "Abuja, Nigeria"
  }'
```

**Get all shipments:**
```bash
curl https://shipment-manager-production-6810.up.railway.app/api/v1/shipments
```

**Get shipments with filters:**
```bash
curl "https://shipment-manager-production-6810.up.railway.app/api/v1/shipments?status=pending&page=1&limit=5"
```

**Get a single shipment:**
```bash
curl https://shipment-manager-production-6810.up.railway.app/api/v1/shipments/{id}
```

**Update a shipment:**
```bash
curl -X PUT https://shipment-manager-production-6810.up.railway.app/api/v1/shipments/{id} \
  -H "Content-Type: application/json" \
  -d '{
    "status": "in_transit"
  }'
```

**Delete a shipment:**
```bash
curl -X DELETE https://shipment-manager-production-6810.up.railway.app/api/v1/shipments/{id}
```

### Using Postman

1. Import the `postman_collection.json` file included in this repository
2. Set the `baseUrl` variable to your API URL
3. Run requests in order: Create → Get → Update → Delete

### Using Swagger UI

Visit `https://shipment-manager-production-6810.up.railway.app/api-docs` for interactive API documentation where you can test all endpoints directly in your browser.

---

## 📁 Project Structure

```
shipment-api/
├── src/
│   ├── config/          # Configuration files
│   │   ├── database.ts  # MongoDB connection
│   │   ├── environment.ts # Environment variables
│   │   └── swagger.ts   # Swagger configuration
│   ├── controllers/     # Request handlers
│   ├── middlewares/     # Express middlewares
│   │   ├── asyncHandler.ts
│   │   ├── errorHandler.ts
│   │   ├── logger.ts
│   │   ├── security.ts
│   │   └── validateRequest.ts
│   ├── models/          # Mongoose models
│   ├── repositories/    # Data access layer
│   ├── routes/          # Route definitions
│   │   ├── v1/          # Versioned API routes
│   │   └── health.routes.ts
│   ├── services/        # Business logic
│   ├── types/           # TypeScript interfaces
│   ├── utils/           # Utility functions
│   ├── validators/      # Joi validation schemas
│   ├── app.ts           # Express app setup
│   └── server.ts        # Server entry point
├── tests/
│   ├── integration/     # Integration tests
│   └── setup.ts         # Test configuration
├── docs/
│   └── API_DOCUMENTATION.md
├── .env.example
├── .gitignore
├── package.json
├── tsconfig.json
├── jest.config.js
├── postman_collection.json
└── README.md
```

---

## ⚙️ Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment (development/production/test) | development |
| `PORT` | Server port | 3000 |
| `MONGODB_URI` | MongoDB connection string | - |
| `RATE_LIMIT_WINDOW_MS` | Rate limit window in ms | 900000 (15 min) |
| `RATE_LIMIT_MAX_REQUESTS` | Max requests per window | 100 |
| `CORS_ORIGIN` | Allowed CORS origins | * |
| `LOG_LEVEL` | Logging level | dev |

### Example `.env` file

```env
NODE_ENV=production
PORT=3000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/db
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
CORS_ORIGIN=*
LOG_LEVEL=combined
```

---

## 🧪 Running Tests

```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run type checking
npm run lint
```

---

## 🚢 Deployment

### Deploy to Railway

1. **Create a Railway account** at [railway.app](https://railway.app)

2. **Install Railway CLI** (optional)
   ```bash
   npm install -g @railway/cli
   railway login
   ```

3. **Create a new project**
   - Go to Railway Dashboard
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Connect your repository

4. **Configure environment variables**
   - Go to your service's "Variables" tab
   - Add required variables:
     ```
     NODE_ENV=production
     PORT=3000
     MONGODB_URI=Mongodb connection string
     ```

6. **Deploy**
   - Railway automatically build and deploy on each push to your main branch
   - Build command: `npm run build`
   - Start command: `npm start`

---

## 📖 API Documentation

### Interactive Documentation

Swagger UI is available at `/api-docs` endpoint providing:
- Interactive endpoint testing
- Request/response schema visualization
- Error response examples

### Shipment Schema

```json
{
  "id": "507f1f77bcf86cd799439011",
  "trackingNumber": "SHP-20241209-A1B2C3D4",
  "senderName": "John Doe",
  "receiverName": "Jane Smith",
  "origin": "Lagos, Nigeria",
  "destination": "Abuja, Nigeria",
  "status": "pending",
  "createdAt": "2024-12-09T10:30:00.000Z",
  "updatedAt": "2024-12-09T10:30:00.000Z"
}
```

### Status Values

| Status | Description |
|--------|-------------|
| `pending` | Shipment created, awaiting pickup |
| `in_transit` | Shipment is on the way |
| `delivered` | Shipment has been delivered |
| `cancelled` | Shipment has been cancelled |

### Status Transitions

```
pending → in_transit → delivered
    ↓          ↓
cancelled  cancelled
```

- `pending` can transition to: `in_transit`, `cancelled`
- `in_transit` can transition to: `delivered`, `cancelled`
- `delivered` and `cancelled` are final states

### Response Formats

**Success Response:**
```json
{
  "success": true,
  "message": "Shipment created successfully",
  "data": { ... }
}
```

**Paginated Response:**
```json
{
  "success": true,
  "message": "Shipments retrieved successfully",
  "data": [ ... ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "totalItems": 50,
    "itemsPerPage": 10,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

**Error Response:**
```json
{
  "success": false,
  "message": "Validation failed",
  "error": {
    "code": "VALIDATION_ERROR",
    "details": [
      {
        "field": "senderName",
        "message": "Sender name is required"
      }
    ]
  }
}
```

---

## 📄 License

This project is licensed under the ISC License.

---

## 👤 Author

**Kenneth Bassey**

---

## 🙏 Acknowledgments

- Built for TaxTech Backend Engineer Assessment
- Follows industry best practices for Node.js API development
