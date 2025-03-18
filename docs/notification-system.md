# Notification System Documentation

This document provides an overview of the unified notification system in the AuditorIA platform, including user-specific notifications, global notifications, and admin functionality for managing notifications.

## Table of Contents

1. [Overview](#overview)
2. [Notification Types](#notification-types)
3. [API Endpoints](#api-endpoints)
4. [Webhooks](#webhooks)
5. [Frontend Components](#frontend-components)
6. [Admin Features](#admin-features)
7. [Implementation Details](#implementation-details)
8. [Performance Optimizations](#performance-optimizations)
9. [Usage](#usage)
10. [Troubleshooting](#troubleshooting)

## Overview

The notification system allows the platform to send real-time notifications to users. Notifications are stored in Redis and delivered to clients via Server-Sent Events (SSE). The system supports both user-specific notifications and global notifications that are sent to all users.

### Key Features

- Real-time notifications via Server-Sent Events
- User-specific notifications
- Global notifications (sent to all users)
- Notification read status tracking
- Admin API for managing global notifications
- Secure deletion of global notifications

### Unified Approach

The notification system follows these key principles:

- Admin can post a notification globally or by passing a username
- Only one route posts notifications to Redis
- Only one route gets notifications
- Only one route emits events and sends & receives messages

All notification functionality is consolidated in a single file: `/api/notifications/route.ts`

## Notification Types

### User-Specific Notifications

User-specific notifications are targeted to a specific user and are only visible to that user. These notifications include:

- Task completion notifications
- Analysis results
- Personal reminders
- User-specific system messages

### Global Notifications

Global notifications are sent to all users and are used for system-wide announcements. These include:

- System maintenance notifications
- New feature announcements
- Important updates
- Platform-wide alerts

Global notifications have the following characteristics:

- They are marked with an `isGlobal` flag set to `true`
- They are stored in a separate Redis key (`notifications:global`)
- They cannot be deleted by regular users, only marked as read
- They can only be deleted by administrators using the admin API

## API Endpoints

All notification functionality is now handled through a single set of endpoints:

### `GET /api/notifications`

Retrieves all notifications for the current user, including both user-specific and global notifications.

**Query Parameters:**

- `cursor` (optional): Pagination cursor (default: 0)
- `isAdmin` (optional): Boolean flag for admin operations

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

### `POST /api/notifications`

Creates a new notification. Can be used by both regular users and admins.

**Regular User Request Body:**

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

**Admin Request Body (for global notification):**

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

**Admin Request Body (for targeted user notification):**

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

### `DELETE /api/notifications?uuid=<uuid>`

Deletes a specific notification for the current user. For global notifications, regular users can only mark them as read while admins can delete them.

**Admin Query Parameters:**

```
/api/notifications?uuid=<uuid>&isAdmin=true
```

### `DELETE /api/notifications`

Deletes all user-specific notifications for the current user and marks all global notifications as read.

**Admin Query Parameters:**

```
/api/notifications?isAdmin=true
```

(Deletes all global notifications)

### `GET /api/notifications/events`

Establishes a Server-Sent Events (SSE) connection for real-time notifications. The client will receive both user-specific notifications and global notifications.

#### Event Types

The endpoint emits two types of events:

1. **connected** - Sent when the connection is first established

   ```
   event: connected
   data: {}
   ```

2. **notification** - Sent when a new notification is published
   ```
   event: notification
   data: {"uuid":"string","timestamp":number,"read":boolean,"text":"string",...}
   ```

#### Implementation Details

- The endpoint uses Redis pub/sub to subscribe to two channels:
  - User-specific channel: `notification:notifications:{userId}`
  - Global channel: `notification:global`
- When a notification is published to either channel, it's sent to the client as an SSE event
- The connection is kept alive until the client disconnects
- The endpoint automatically unsubscribes from Redis channels when the client disconnects

#### Client-Side Usage

```javascript
// Example of connecting to the SSE endpoint
const eventSource = new EventSource("/api/notifications/events")

// Handle connection established
eventSource.addEventListener("connected", event => {
  console.log("Connected to notification events")
})

// Handle incoming notifications
eventSource.addEventListener("notification", event => {
  const notification = JSON.parse(event.data)
  console.log("Received notification:", notification)
  // Process the notification (e.g., show toast, update UI)
})

// Handle connection errors
eventSource.onerror = error => {
  console.error("EventSource error:", error)
  // Implement reconnection logic if needed
}

// Close the connection when no longer needed
// eventSource.close();
```

#### Connection Management

The frontend automatically handles:

- Establishing the connection when a user is authenticated
- Reconnecting if the connection is lost
- Processing notifications in batches to prevent UI freezing
- Deduplicating notifications if the same one is received multiple times
- Closing the connection when the user logs out or the component unmounts

## Webhooks

External systems can send notifications to users through the same API endpoint:

```
POST /api/notifications
```

### Request Format for External Systems

```json
{
  "text": "Your notification message here",
  "task": {
    "identifier": "task-identifier",
    "file_name": "optional-file-name.mp3"
  },
  "targetUser": "optional-user-id-for-targeting-specific-user",
  "isAdminRequest": true
}
```

### Parameters

| Parameter       | Type    | Required                  | Description                                                                                                                              |
| --------------- | ------- | ------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| text            | string  | Yes                       | The notification message text.                                                                                                           |
| task            | object  | No                        | Information about the related task.                                                                                                      |
| task.identifier | string  | Yes (if task is provided) | The identifier of the related task.                                                                                                      |
| task.file_name  | string  | No                        | The file name associated with the task.                                                                                                  |
| targetUser      | string  | No                        | The ID of the user to receive the notification. If not provided when isAdminRequest is true, the notification will be treated as global. |
| isAdminRequest  | boolean | No                        | Set to true to use admin features such as sending global notifications or targeting specific users.                                      |

### Examples

#### Sending a User-Specific Notification

```bash
curl -X POST http://localhost:3000/api/notifications \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Your transcription is ready",
    "task": {
      "identifier": "task-123",
      "file_name": "recording.mp3"
    },
    "isAdminRequest": true,
    "targetUser": "user-456"
  }'
```

#### Sending a Global Notification

```bash
curl -X POST http://localhost:3000/api/notifications \
  -H "Content-Type: application/json" \
  -d '{
    "text": "System maintenance scheduled for tomorrow",
    "task": {
      "identifier": "maintenance-123"
    },
    "isAdminRequest": true
  }'
```

## Frontend Components

### NotificationButton Component

The `NotificationButton` component displays a bell icon in the UI with a badge indicating unread notifications. When clicked, it shows a dropdown with all notifications.

Features:

- Displays a red pulsing dot when there are unread notifications
- Shows a dropdown with all notifications when clicked
- Marks all notifications as read when the dropdown is opened
- Allows deleting individual notifications or all notifications
- Navigates to the related content when a notification is clicked
- Indicates global notifications with a "Global" badge

### NotificationToast Component

The `NotificationToast` hook provides functionality to display toast notifications when new notifications are received. It uses the toast system from `@/components/ui/use-toast`.

Features:

- Displays a toast notification with the notification text
- Provides an action button to navigate to the related content
- Handles errors gracefully with fallback to simpler toast

#### Optimistic Updates

The notification system implements optimistic updates for a better user experience:

- When a notification is deleted, it is immediately removed from the UI before the server confirms the deletion
- If the deletion fails, the notification is restored in the UI
- When all notifications are deleted, they are immediately removed from the UI
- The system handles both user-specific and global notifications appropriately during optimistic updates

## Admin Features

### Admin Notification Creation

Administrators can create notifications in two ways:

1. Global notifications that appear for all users
2. Targeted notifications sent to specific users by username

### Admin Notification Management

Administrators can:

- Delete individual global notifications
- Delete all global notifications at once
- Create targeted notifications for specific users

## Implementation Details

The notification system is implemented using:

1. **React Query** for data fetching and state management
2. **Redis** for storage and pub/sub
3. **Server-Sent Events (SSE)** for real-time updates

### Data Flow

1. Notifications are created via the API endpoint:

   - `/api/notifications` - For both regular and admin notifications

2. Notifications are stored in Redis and published to a Redis channel

3. The frontend subscribes to notifications via SSE at `/api/notifications/events`

4. When a notification is received:

   - It's added to the React Query cache
   - A toast notification is displayed
   - The notification bell shows a red dot indicator

5. When the notification dropdown is opened:
   - All notifications are marked as read
   - The red dot indicator disappears

### Key Files

- `src/app/api/notifications/route.ts` - Main API endpoints for notifications
- `src/app/api/notifications/events/route.ts` - SSE endpoint for real-time notifications
- `src/lib/hooks/use-notifications.ts` - React Query hooks for notifications
- `src/components/notifications/notification-button.tsx` - UI component for notifications
- `src/components/notifications/notification-toast.tsx` - Toast component for new notifications
- `src/lib/notifications-utils.ts` - Utility functions for notifications

### Storage and Messaging

- The notification system uses Redis for storage and pub/sub
- Notifications are stored in Redis lists with keys:
  - `notifications:{userId}` for user-specific notifications
  - `notifications:global` for global notifications
- Real-time updates are delivered via Redis pub/sub channels:
  - `notification:notifications:{userId}` for user-specific notifications
  - `notification:global` for global notifications
- All notifications have a TTL of 24 hours (set in the `NOTIFICATIONS_TTL` constant)

## Performance Optimizations

The notification system includes several optimizations to prevent blocking the main thread:

1. **Asynchronous Processing**: Notifications are processed asynchronously on the server
2. **Batched Updates**: Notifications are processed in batches on the client
3. **Debounced Rendering**: UI updates are debounced to prevent excessive re-renders
4. **Deduplication**: Duplicate notifications are filtered out

## Usage

### Adding the Notification Button to Components

```tsx
import { NotificationButton } from "@/components/notifications/notification-button"

export function MyComponent() {
  return (
    <div>
      <NotificationButton />
    </div>
  )
}
```

### Programmatically Sending Notifications

```tsx
import { useNotifications } from "@/lib/hooks/use-notifications"

export function MyComponent() {
  const { sendNotification } = useNotifications()

  const handleClick = () => {
    sendNotification({
      text: "Your task is complete",
      task: {
        identifier: "task-123",
        file_name: "recording.mp3",
      },
    })
  }

  return <button onClick={handleClick}>Send Notification</button>
}
```

## Troubleshooting

### Common Issues

- **Notifications not appearing**: Check that the client is connected to the SSE endpoint and that the Redis service is running.
- **Duplicate notifications**: Ensure you're providing a unique UUID for each notification or let the system generate one.
- **Global notifications not reaching all users**: Verify that the notification was sent with `isAdminRequest: true` and without a targetUser parameter.
- **Cannot delete global notifications**: Regular users cannot delete global notifications, only mark them as read. Use the admin API to delete global notifications.

### Debugging

- Check the server logs for errors related to notification processing.
- Use the browser console to check for SSE connection issues.
- Verify Redis connectivity and pub/sub functionality.
- For admin API issues, ensure the admin permission check is passing.

## Related Files

- `src/lib/hooks/use-notifications.ts` - React Query hooks for notifications
- `src/app/api/notifications/` - API endpoints for notifications
- `src/components/notifications/` - Frontend notification components
- `src/lib/notifications-utils.ts` - Utilities for notification handling
