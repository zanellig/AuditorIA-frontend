# Unified Notification System

This directory contains a simplified notification system that follows these rules:

1. Admin can post a notification globally or by passing a username
2. Only one route posts notifications to Redis
3. Only one route gets notifications
4. Only one route emits events and sends & receives messages

## API Endpoints

All functionality is now consolidated in a single `route.ts` file with the following endpoints:

### GET /api/notifications

Retrieves all notifications for the current user, including both user-specific and global notifications.

**Response:**

```json
{
  "notifications": [
    {
      "uuid": "string",
      "timestamp": "number",
      "read": "boolean",
      "text": "string",
      "task": {
        "identifier": "string",
        "file_name": "string (optional)"
      },
      "isGlobal": "boolean"
    }
  ]
}
```

### POST /api/notifications

Creates a new notification. Can be used by both regular users and admins.

For admin operations, set `isAdminRequest: true` and optionally provide `targetUser`. If no `targetUser` is provided, it will be treated as a global notification.

**Request Body for Regular User:**

```json
{
  "uuid": "string (optional, will be generated if not provided)",
  "text": "string",
  "task": {
    "identifier": "string",
    "file_name": "string (optional)"
  }
}
```

**Request Body for Admin Creating User-Specific Notification:**

```json
{
  "isAdminRequest": true,
  "targetUser": "username",
  "text": "string",
  "task": {
    "identifier": "string",
    "file_name": "string (optional)"
  }
}
```

**Request Body for Admin Creating Global Notification:**

```json
{
  "isAdminRequest": true,
  "text": "string",
  "task": {
    "identifier": "string",
    "file_name": "string (optional)"
  }
}
```

### DELETE /api/notifications?uuid=<uuid>

Deletes a specific notification for the current user. For global notifications, regular users can only mark them as read, but admins can delete them by setting `isAdmin=true` in the query parameters.

**Admin Query Parameters:**

```
/api/notifications?uuid=<uuid>&isAdmin=true
```

### DELETE /api/notifications

Deletes all user-specific notifications for the current user and marks all global notifications as read.

**Admin Query Parameters (to delete all global notifications):**

```
/api/notifications?isAdmin=true
```

### GET /api/notifications/events

Establishes a Server-Sent Events connection for real-time notifications. The client will receive both user-specific notifications and global notifications.

## Implementation Notes

- The system uses Redis for storage and pub/sub messaging
- Notifications are stored in Redis lists with keys:
  - `notifications:{userId}` for user-specific notifications
  - `notifications:global` for global notifications
- Real-time updates are delivered via Redis pub/sub channels:
  - User-specific channel: `notification:notifications:{userId}`
  - Global channel: `notification:global`
- All notifications have a TTL of 7 days
