# Notifications Webhook API

This document describes the webhook API for sending notifications to users in the AuditorIA platform.

## Overview

The Notifications Webhook API allows external systems to send notifications to users. Notifications are stored in Redis and delivered to clients in real-time via Server-Sent Events (SSE).

## Endpoint

```
POST /api/notifications/webhook
```

## Request Format

```json
{
  "uuid": "optional-uuid-will-be-generated-if-not-provided",
  "text": "Your notification message here",
  "task": {
    "identifier": "task-identifier",
    "file_name": "optional-file-name.mp3"
  },
  "userId": "optional-user-id-for-targeting-specific-user"
}
```

### Parameters

| Parameter       | Type   | Required                  | Description                                                                                                                        |
| --------------- | ------ | ------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| uuid            | string | No                        | A unique identifier for the notification. If not provided, a UUID will be generated.                                               |
| text            | string | Yes                       | The notification message text.                                                                                                     |
| task            | object | No                        | Information about the related task.                                                                                                |
| task.identifier | string | Yes (if task is provided) | The identifier of the related task.                                                                                                |
| task.file_name  | string | No                        | The file name associated with the task.                                                                                            |
| userId          | string | No                        | The ID of the user to receive the notification. If not provided, the notification will be treated as global and sent to all users. |

## Global Notifications

When no `userId` is provided in the request, the notification is treated as a **global notification** and will be:

1. Stored in a global notifications list (`notifications:global`)
2. Delivered to all connected clients
3. Marked with an `isGlobal: true` flag
4. Visible to all users of the platform
5. Cannot be deleted by regular users (only marked as read)
6. Can only be deleted by administrators using the admin API

Global notifications are useful for system-wide announcements such as:

- Maintenance notifications
- New feature announcements
- Important updates
- Platform-wide alerts

## Response

### Success Response

```json
{
  "uuid": "generated-or-provided-uuid",
  "timestamp": 1647532800000,
  "read": false,
  "text": "Your notification message here",
  "task": {
    "identifier": "task-identifier",
    "file_name": "optional-file-name.mp3"
  },
  "isGlobal": true // Only present for global notifications
}
```

### Error Response

```json
{
  "error": "Error message",
  "details": {} // Optional error details
}
```

## Examples

### Sending a User-Specific Notification

```bash
curl -X POST http://localhost:3000/api/notifications/webhook \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Your transcription is ready",
    "task": {
      "identifier": "task-123",
      "file_name": "recording.mp3"
    },
    "userId": "user-456"
  }'
```

### Sending a Global Notification

```bash
curl -X POST http://localhost:3000/api/notifications/webhook \
  -H "Content-Type: application/json" \
  -d '{
    "text": "System maintenance scheduled for tomorrow",
    "task": {
      "identifier": "maintenance-123"
    }
  }'
```

## Notes

- Notifications are stored in Redis with a TTL of 7 days.
- Duplicate notifications (with the same UUID) are not added.
- The webhook processes notifications asynchronously to provide a quick response.
- For real-time delivery, clients should connect to the `/api/notifications/events` endpoint using Server-Sent Events.

## Related APIs

### Admin API for Global Notifications

Administrators can manage global notifications using the admin API:

```
GET /api/notifications/admin    # Get all global notifications
DELETE /api/notifications/admin # Delete all global notifications
```

These endpoints require authentication with an admin API key:

```
Authorization: Bearer <admin-api-key>
```

For more details, see the [Notification System Documentation](./notifications-system.md).

## Implementation Notes

- The notification system uses Redis for storage and pub/sub.
- Notifications are stored in Redis lists with keys:
  - `notifications:{userId}` for user-specific notifications
  - `notifications:global` for global notifications
- Real-time updates are delivered via Redis pub/sub channels:
  - `notification:notifications:{userId}` for user-specific notifications
  - `notification:global` for global notifications
- The frontend subscribes to both user-specific and global notification channels.
- Global notifications cannot be deleted by regular users, only marked as read.
- The admin API provides secure management of global notifications.

## Testing

You can test the notification system using the provided test script:

```bash
# Send test notifications (both user-specific and global)
node scripts/test-notifications.js --send

# Test admin API functions
node scripts/test-notifications.js --admin

# Run all tests
node scripts/test-notifications.js
```

## Troubleshooting

### Common Issues

- **Notifications not appearing**: Check that the client is connected to the SSE endpoint and that the Redis service is running.
- **Duplicate notifications**: Ensure you're providing a unique UUID for each notification or let the system generate one.
- **Global notifications not reaching all users**: Verify that the notification was sent without a userId parameter.
- **Cannot delete global notifications**: Regular users cannot delete global notifications, only mark them as read. Use the admin API to delete global notifications.

### Debugging

- Check the server logs for errors related to notification processing.
- Use the browser console to check for SSE connection issues.
- Verify Redis connectivity and pub/sub functionality.
- For admin API issues, ensure the correct API key is being used.
