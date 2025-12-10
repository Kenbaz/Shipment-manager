# Shipment Management API Documentation

## Overview

The Shipment Management API is a RESTful service for creating, reading, updating, and deleting shipment records. This API provides comprehensive shipment tracking capabilities with features like pagination, filtering, sorting, and status transition validation.

**LIVE URL:** `https://shipment-manager-production-6810.up.railway.app`

**API Version:** v1

**Content Type:** `application/json`

---

## Authentication

This API currently does not require authentication. All endpoints are publicly accessible.

---

## Rate Limiting

The API implements rate limiting to prevent abuse:

- **Window:** 15 minutes
- **Max Requests:** 100 requests per window per IP

When rate limited, you'll receive a `429 Too Many Requests` response:

```json
{
  "success": false,
  "message": "Too many requests, please try again later",
  "error": {
    "code": "RATE_LIMIT_EXCEEDED"
  }
}
```

---

## Endpoints

### Health Check

#### GET /health

Returns the health status of the API and database connection.

**Response:**
```json
{
  "success": true,
  "message": "API is healthy",
  "data": {
    "status": "healthy",
    "timestamp": "2024-12-09T10:30:00.000Z",
    "uptime": 3600.5,
    "database": {
      "connected": true,
      "state": "connected"
    }
  }
}
```

#### GET /health/ready

Readiness probe for container orchestration.

**Response (200 OK):**
```json
{
  "success": true,
  "message": "API is ready",
  "data": { "ready": true }
}
```

**Response (503 Service Unavailable):**
```json
{
  "success": false,
  "message": "API is not ready",
  "data": { "ready": false, "reason": "Database not connected" }
}
```

#### GET /health/live

Simple liveness probe.

**Response:**
```json
{
  "success": true,
  "message": "API is alive",
  "data": { "alive": true }
}
```

---

### Shipments

#### GET /api/v1/shipments

Retrieve all shipments with pagination, filtering, and sorting.

**Query Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| page | integer | 1 | Page number (min: 1) |
| limit | integer | 10 | Items per page (min: 1, max: 100) |
| sortBy | string | createdAt | Field to sort by |
| order | string | desc | Sort order: `asc` or `desc` |
| status | string | - | Filter by status |
| origin | string | - | Filter by origin (partial match, case-insensitive) |
| destination | string | - | Filter by destination (partial match, case-insensitive) |
| search | string | - | Search in sender/receiver names |
| startDate | ISO date | - | Filter shipments created after this date |
| endDate | ISO date | - | Filter shipments created before this date |

**Valid sortBy values:** `createdAt`, `updatedAt`, `senderName`, `receiverName`, `origin`, `destination`, `status`, `trackingNumber`

**Valid status values:** `pending`, `in_transit`, `delivered`, `cancelled`

**Example Request:**
```bash
GET /api/v1/shipments?page=1&limit=10&status=pending&sortBy=createdAt&order=desc
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Shipments retrieved successfully",
  "data": [
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
  ],
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

**Error Response (400 Bad Request):**
```json
{
  "success": false,
  "message": "Validation failed: status must be one of: pending, in_transit, delivered, cancelled",
  "error": {
    "code": "VALIDATION_ERROR",
    "details": [
      {
        "field": "status",
        "message": "status must be one of: pending, in_transit, delivered, cancelled"
      }
    ]
  }
}
```

---

#### GET /api/v1/shipments/:id

Retrieve a single shipment by its ID.

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| id | string | MongoDB ObjectId (24 hex characters) |

**Example Request:**
```bash
GET /api/v1/shipments/507f1f77bcf86cd799439011
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Shipment retrieved successfully",
  "data": {
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
}
```

**Error Response (400 Bad Request - Invalid ID):**
```json
{
  "success": false,
  "message": "Validation failed: Shipment ID must be a valid MongoDB ObjectId",
  "error": {
    "code": "VALIDATION_ERROR",
    "details": [
      {
        "field": "id",
        "message": "Shipment ID must be a valid MongoDB ObjectId"
      }
    ]
  }
}
```

**Error Response (404 Not Found):**
```json
{
  "success": false,
  "message": "Shipment not found",
  "error": {
    "code": "RESOURCE_NOT_FOUND"
  }
}
```

---

#### POST /api/v1/shipments

Create a new shipment.

**Request Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| senderName | string | Yes | Name of sender (2-100 chars) |
| receiverName | string | Yes | Name of receiver (2-100 chars) |
| origin | string | Yes | Origin address (2-200 chars) |
| destination | string | Yes | Destination address (2-200 chars) |
| status | string | No | Initial status (default: `pending`) |

**Example Request:**
```bash
POST /api/v1/shipments
Content-Type: application/json

{
  "senderName": "John Doe",
  "receiverName": "Jane Smith",
  "origin": "Lagos, Nigeria",
  "destination": "Abuja, Nigeria"
}
```

**Success Response (201 Created):**
```json
{
  "success": true,
  "message": "Shipment created successfully",
  "data": {
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
}
```

**Error Response (400 Bad Request - Validation):**
```json
{
  "success": false,
  "message": "Validation failed: Sender name is required, Receiver name is required",
  "error": {
    "code": "VALIDATION_ERROR",
    "details": [
      {
        "field": "senderName",
        "message": "Sender name is required"
      },
      {
        "field": "receiverName",
        "message": "Receiver name is required"
      }
    ]
  }
}
```

---

#### PUT /api/v1/shipments/:id

Update an existing shipment.

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| id | string | MongoDB ObjectId (24 hex characters) |

**Request Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| senderName | string | No | Name of sender (2-100 chars) |
| receiverName | string | No | Name of receiver (2-100 chars) |
| origin | string | No | Origin address (2-200 chars) |
| destination | string | No | Destination address (2-200 chars) |
| status | string | No | New status (must be valid transition) |

> **Note:** At least one field must be provided for update.

**Example Request:**
```bash
PUT /api/v1/shipments/507f1f77bcf86cd799439011
Content-Type: application/json

{
  "status": "in_transit"
}
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Shipment updated successfully",
  "data": {
    "id": "507f1f77bcf86cd799439011",
    "trackingNumber": "SHP-20241209-A1B2C3D4",
    "senderName": "John Doe",
    "receiverName": "Jane Smith",
    "origin": "Lagos, Nigeria",
    "destination": "Abuja, Nigeria",
    "status": "in_transit",
    "createdAt": "2024-12-09T10:30:00.000Z",
    "updatedAt": "2024-12-09T11:00:00.000Z"
  }
}
```

**Error Response (400 Bad Request - Invalid Status Transition):**
```json
{
  "success": false,
  "message": "Invalid status transition from 'pending' to 'delivered'. Allowed transitions: in_transit, cancelled",
  "error": {
    "code": "INVALID_STATUS_TRANSITION",
    "details": [
      {
        "field": "status",
        "message": "Invalid status transition from 'pending' to 'delivered'. Allowed transitions: in_transit, cancelled"
      }
    ]
  }
}
```

**Error Response (400 Bad Request - Empty Body):**
```json
{
  "success": false,
  "message": "Validation failed: At least one field must be provided for update",
  "error": {
    "code": "VALIDATION_ERROR",
    "details": [
      {
        "field": "",
        "message": "At least one field must be provided for update"
      }
    ]
  }
}
```

---

#### DELETE /api/v1/shipments/:id

Delete a shipment.

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| id | string | MongoDB ObjectId (24 hex characters) |

**Example Request:**
```bash
DELETE /api/v1/shipments/507f1f77bcf86cd799439011
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Shipment deleted successfully",
  "data": {
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
}
```

**Error Response (404 Not Found):**
```json
{
  "success": false,
  "message": "Shipment not found",
  "error": {
    "code": "RESOURCE_NOT_FOUND"
  }
}
```

---

## Data Models

### Shipment

| Field | Type | Description |
|-------|------|-------------|
| id | string | Unique identifier (MongoDB ObjectId) |
| trackingNumber | string | Auto-generated tracking number (format: SHP-YYYYMMDD-XXXXXXXX) |
| senderName | string | Name of the sender |
| receiverName | string | Name of the receiver |
| origin | string | Origin address |
| destination | string | Destination address |
| status | string | Current shipment status |
| createdAt | ISO date | Creation timestamp |
| updatedAt | ISO date | Last update timestamp |

### Status Values

| Status | Description |
|--------|-------------|
| `pending` | Shipment created, awaiting pickup |
| `in_transit` | Shipment is on the way |
| `delivered` | Shipment has been delivered (final state) |
| `cancelled` | Shipment has been cancelled (final state) |

### Status Transition Rules

Valid status transitions are enforced by the API:

| Current Status | Allowed Transitions |
|----------------|---------------------|
| pending | in_transit, cancelled |
| in_transit | delivered, cancelled |
| delivered | (none - final state) |
| cancelled | (none - final state) |

---

## Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| VALIDATION_ERROR | 400 | Request validation failed |
| INVALID_ID | 400 | Invalid MongoDB ObjectId format |
| INVALID_STATUS_TRANSITION | 400 | Invalid status transition attempted |
| INVALID_QUERY_PARAMS | 400 | Invalid query parameters |
| RESOURCE_NOT_FOUND | 404 | Requested resource not found |
| DUPLICATE_ENTRY | 409 | Duplicate entry (unique constraint violation) |
| RATE_LIMIT_EXCEEDED | 429 | Too many requests |
| INTERNAL_ERROR | 500 | Internal server error |

---

## Examples

### Complete CRUD Flow

**1. Create a shipment:**
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

**2. Get the shipment:**
```bash
curl https://shipment-manager-production-6810.up.railway.app/api/v1/shipments/{id}
```

**3. Update status to in_transit:**
```bash
curl -X PUT https://shipment-manager-production-6810.up.railway.app/api/v1/shipments/{id} \
  -H "Content-Type: application/json" \
  -d '{"status": "in_transit"}'
```

**4. Update status to delivered:**
```bash
curl -X PUT https://shipment-manager-production-6810.up.railway.app/api/v1/shipments/{id} \
  -H "Content-Type: application/json" \
  -d '{"status": "delivered"}'
```

**5. Delete the shipment:**
```bash
curl -X DELETE https://shipment-manager-production-6810.up.railway.app/api/v1/shipments/{id}
```

### Filtering and Pagination

**Get pending shipments from Lagos:**
```bash
curl "https://shipment-manager-production-6810.up.railway.app/api/v1/shipments?status=pending&origin=Lagos&page=1&limit=5"
```

**Search shipments by name:**
```bash
curl "https://shipment-manager-production-6810.up.railway.app/api/v1/shipments?search=John"
```

**Get shipments sorted by sender name:**
```bash
curl "https://shipment-manager-production-6810.up.railway.app/api/v1/shipments?sortBy=senderName&order=asc"
```

**Filter by date range:**
```bash
curl "https://shipment-manager-production-6810.up.railway.app/api/v1/shipments?startDate=2024-01-01&endDate=2024-12-31"
```

---

## Changelog

### v1.0.0 (Initial Release)

- Full CRUD operations for shipments
- Pagination, filtering, and sorting
- Status transition validation
- Input validation with Joi
- Swagger/OpenAPI documentation
- Rate limiting and security headers
- Health check endpoints
- Comprehensive integration tests
