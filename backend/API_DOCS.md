# IT ServiceHub API Documentation

Base URL: `/api`

## Authentication

### `POST /auth/login`
Authenticates a user and returns a JWT.
- **Request Body:**
  ```json
  {
    "email": "user@example.com",
    "password": "password123"
  }
  ```
- **Response (200 OK):**
  ```json
  {
    "token": "eyJhbG...",
    "user": {
      "id": "60d...",
      "name": "Admin User",
      "email": "user@example.com",
      "role": "Admin",
      "department": "IT"
    }
  }
  ```

### `GET /auth/me`
Fetches the currently authenticated user's profile.
- **Headers:** `Authorization: Bearer <token>`
- **Response (200 OK):** User object (same as above)

### `GET /auth/users`
Fetches all users (Admin/Engineer only).
- **Headers:** `Authorization: Bearer <token>`
- **Response (200 OK):** Array of user objects.

### `POST /auth/users`
Creates a new user (Admin only).
- **Headers:** `Authorization: Bearer <token>`
- **Request Body:**
  ```json
  {
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password",
    "role": "Employee",
    "department": "Sales"
  }
  ```
- **Response (201 Created):** Created user object.

---

## Tickets

### `GET /tickets`
Fetches paginated tickets (Admin/Engineer only). Supports filtering and text search.
- **Headers:** `Authorization: Bearer <token>`
- **Query Params:**
  - `page` (number): Current page (default 1)
  - `limit` (number): Items per page (default 50)
  - `status` (string): 'Open', 'In Progress', 'Resolved'
  - `priority` (string): 'Low', 'Medium', 'High'
  - `search` (string): Text search across title and description
  - `sortBy` (string): 'Newest', 'Oldest First', 'Priority (High to Low)'
  - `export` (boolean): If true, returns all filtered data without pagination
- **Response (200 OK):**
  ```json
  {
    "data": [
      {
        "id": "60d...",
        "title": "Cannot access VPN",
        "description": "VPN client hangs on connection...",
        "status": "Open",
        "priority": "High",
        "category": "Network",
        "requestedBy": "60d...",
        "createdAt": "2023-01-01T10:00:00.000Z"
      }
    ],
    "totalCount": 15
  }
  ```

### `GET /tickets/user/:userId`
Fetches tickets for a specific user.
- **Headers:** `Authorization: Bearer <token>`
- **Query Params:** Same as `GET /tickets`

### `POST /tickets`
Raises a new ticket. Supports multipart/form-data for attachments.
- **Headers:** `Authorization: Bearer <token>`
- **Request Body:** Form data with `title`, `description`, `priority`, `category`, `assetId` (optional), and `attachments` (files).
- **Response (201 Created):** Created ticket object.

### `PUT /tickets/:id`
Updates a ticket.
- **Headers:** `Authorization: Bearer <token>`
- **Request Body:** Allowed fields depend on role. (e.g. `status`, `priority`, `assignedTo`).
- **Response (200 OK):** Updated ticket object.

### `POST /tickets/:id/comments`
Adds a comment to a ticket. Supports multipart/form-data.
- **Headers:** `Authorization: Bearer <token>`
- **Request Body:** Form data with `text` and `attachments`.
- **Response (200 OK):** The newly added comment object.

### `POST /tickets/bulk/update`
Bulk updates tickets (Admin/Engineer only).
- **Headers:** `Authorization: Bearer <token>`
- **Request Body:**
  ```json
  {
    "ticketIds": ["id1", "id2"],
    "updateData": { "status": "Resolved" }
  }
  ```

---

## Assets

### `GET /assets`
Fetches paginated assets (Admin/Engineer only). Supports filtering.
- **Headers:** `Authorization: Bearer <token>`
- **Query Params:** `page`, `limit`, `status`, `type`, `search`, `sortBy`, `export`.
- **Response (200 OK):**
  ```json
  {
    "data": [
      {
        "id": "60e...",
        "name": "MacBook Pro",
        "type": "Laptop",
        "serialNumber": "C02...",
        "status": "Assigned",
        "assignedTo": "60d..."
      }
    ],
    "totalCount": 42
  }
  ```

### `GET /assets/user/:userId`
Fetches assets assigned to a specific user.
- **Headers:** `Authorization: Bearer <token>`
- **Query Params:** Same as `GET /assets`

### `POST /assets`
Creates a new asset (Admin only).
- **Headers:** `Authorization: Bearer <token>`
- **Request Body:** `name`, `type`, `serialNumber`

### `PUT /assets/:id`
Updates an asset.
- **Headers:** `Authorization: Bearer <token>`
- **Request Body:** e.g. `status`, `assignedTo`.

### `POST /assets/bulk/update`
Bulk updates assets (Admin/Engineer only).
- **Headers:** `Authorization: Bearer <token>`
- **Request Body:** `{ "assetIds": [], "updateData": {} }`
