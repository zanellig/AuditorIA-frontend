# Notifications Webhook Documentation

This document explains how to use the notifications webhook to send real-time notifications to users in the AuditorIA platform.

## Overview

The notification system provides a webhook endpoint that allows external systems to send notifications to users. These notifications will appear in the notification dropdown in the UI and can also trigger toast notifications.

The system is designed to be:

- **Event-driven**: Notifications are pushed to clients in real-time using Server-Sent Events (SSE)
- **Non-blocking**: Processing happens asynchronously to prevent blocking the main thread
- **Deduplicated**: The system prevents duplicate notifications with the same UUID

## Webhook Endpoint

```
POST /api/notifications/webhook
```

### Request Format

The webhook accepts POST requests with a JSON body containing the notification data:

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

| Parameter         | Type   | Required                  | Description                                                                                                            |
| ----------------- | ------ | ------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| `uuid`            | string | No                        | A unique identifier for the notification. If not provided, a random UUID will be generated.                            |
| `text`            | string | Yes                       | The notification message text.                                                                                         |
| `task`            | object | No                        | Information about the related task.                                                                                    |
| `task.identifier` | string | Yes (if task is provided) | The identifier of the related task. This is used for navigation when the notification is clicked.                      |
| `task.file_name`  | string | No                        | The file name of the related task. This is used as a query parameter for navigation.                                   |
| `userId`          | string | No                        | The ID of the user who should receive the notification. If not provided, the notification will be sent to "anonymous". |

### Response

The webhook returns a JSON response with the created notification:

```json
{
  "uuid": "generated-or-provided-uuid",
  "timestamp": 1678901234567,
  "read": false,
  "text": "Your notification message here",
  "task": {
    "identifier": "task-identifier",
    "file_name": "optional-file-name.mp3"
  }
}
```

### Status Codes

| Status Code | Description                                  |
| ----------- | -------------------------------------------- |
| 201         | Notification created successfully            |
| 200         | Notification already exists (duplicate UUID) |
| 400         | Invalid notification data                    |
| 500         | Server error                                 |

## Examples

### Basic Notification

```bash
curl -X POST auditoria.linksolution.com.ar/api/notifications/webhook \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Your transcription is ready",
    "task": {
      "identifier": "task-123",
      "file_name": "recording.mp3"
    }
  }'
```

### Notification for Specific User

```bash
curl -X POST auditoria.linksolution.com.ar/api/notifications/webhook \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Your transcription is ready",
    "task": {
      "identifier": "task-123",
      "file_name": "recording.mp3"
    },
    "userId": "user-email@example.com"
  }'
```

## Behavior

When a notification is sent to the webhook:

1. The notification is validated and stored in Redis
2. The notification is published to a Redis channel for real-time updates
3. Connected clients receive the notification via Server-Sent Events
4. The notification appears in the notification dropdown in the UI
5. A toast notification is displayed to the user

## Navigation

When a user clicks on a notification, they will be navigated to:

```
/dashboard/transcription?identifier={task.identifier}&file_name={task.file_name}
```

This allows for deep linking to specific content related to the notification.

## Implementation Notes

- Notifications are stored in Redis for 7 days
- Notifications are deduplicated based on UUID
- Processing happens asynchronously to prevent blocking the main thread
- The system uses Server-Sent Events for real-time updates
- Toast notifications are displayed for new notifications

## Testing

You can test the webhook using the provided test page at `/test-notifications` or with the test script in `scripts/test-notifications.js`.

## Troubleshooting

If notifications are not appearing:

1. Check the browser console for errors
2. Verify that the Redis connection is working using the debug endpoint at `/api/notifications/debug`
3. Ensure that the notification has a valid UUID and text
4. Check that the Server-Sent Events connection is established
