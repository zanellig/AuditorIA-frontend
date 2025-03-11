# Notification System Documentation

This document provides an overview of the notification system in the AuditorIA platform, including user-specific notifications, global notifications, and the admin API for managing notifications.

## Table of Contents

1. [Overview](#overview)
2. [Notification Types](#notification-types)
3. [API Endpoints](#api-endpoints)
4. [Frontend Components](#frontend-components)
5. [Admin Features](#admin-features)
6. [Testing](#testing)

## Overview

The notification system allows the platform to send real-time notifications to users. Notifications are stored in Redis and delivered to clients via Server-Sent Events (SSE). The system supports both user-specific notifications and global notifications that are sent to all users.

### Key Features

- Real-time notifications via Server-Sent Events
- User-specific notifications
- Global notifications (sent to all users)
- Notification read status tracking
- Admin API for managing global notifications
- Secure deletion of global notifications

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

### Regular Notification Endpoints

#### `GET /api/notifications`

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
      "isGlobal": "boolean (optional)"
    }
  ]
}
```

#### `POST /api/notifications`

Updates a notification, typically used to mark notifications as read.

**Request Body:**

```json
{
  "uuid": "string",
  "timestamp": "number",
  "read": "boolean",
  "text": "string",
  "task": {
    "identifier": "string",
    "file_name": "string (optional)"
  }
}
```

#### `DELETE /api/notifications?uuid=<uuid>`

Deletes a specific notification for the current user. For global notifications, this only marks them as read for the current user.

#### `DELETE /api/notifications`

Deletes all user-specific notifications for the current user and marks all global notifications as read.

### Webhook Endpoint

#### `POST /api/notifications/webhook`

Creates a new notification. If no `userId` is provided, the notification is treated as global and sent to all users.

**Request Body:**

```json
{
  "uuid": "string (optional, will be generated if not provided)",
  "text": "string",
  "task": {
    "identifier": "string",
    "file_name": "string (optional)"
  },
  "userId": "string (optional, if not provided, notification is global)"
}
```

### Events Endpoint

#### `GET /api/notifications/events`

Establishes a Server-Sent Events connection for real-time notifications. The client will receive both user-specific notifications and global notifications.

### Admin API Endpoints

#### `GET /api/notifications/admin`

Retrieves all global notifications. Requires admin authentication.

**Headers:**

```
Authorization: Bearer <admin-api-key>
```

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
      "isGlobal": true
    }
  ]
}
```

#### `DELETE /api/notifications/admin`

Deletes all global notifications. Requires admin authentication.

**Headers:**

```
Authorization: Bearer <admin-api-key>
```

**Response:**

```json
{
  "message": "All global notifications deleted",
  "details": {
    "deletedCount": "number"
  }
}
```

## Frontend Components

### NotificationButton Component

The `NotificationButton` component displays a bell icon in the UI with a badge indicating unread notifications. When clicked, it shows a dropdown with all notifications.

Features:

- Displays unread notification count
- Marks notifications as read when opened
- Shows notification text and timestamp
- Allows deletion of notifications with optimistic UI updates
- Indicates global notifications with a "Global" badge
- Navigates to related content when a notification is clicked

#### Optimistic Updates

The notification system implements optimistic updates for a better user experience:

- When a notification is deleted, it is immediately removed from the UI before the server confirms the deletion
- If the deletion fails, the notification is restored in the UI
- When all notifications are deleted, they are immediately removed from the UI
- The system handles both user-specific and global notifications appropriately during optimistic updates

### AdminGlobalNotifications Component

The `AdminGlobalNotifications` component provides an interface for administrators to manage global notifications.

Features:

- Secure deletion of all global notifications
- Requires admin API key authentication
- Provides feedback on success or failure
- Includes warning about the permanent nature of deletion

## Admin Features

### Admin Panel

The admin panel is accessible at `/admin/notifications` and provides tools for managing notifications:

- View and delete global notifications
- Authenticate with admin API key
- Secure management of system-wide notifications

### Security

The admin API is secured using an API key that must be provided in the Authorization header:

```
Authorization: Bearer <admin-api-key>
```

In production, this API key should be:

- Stored in environment variables
- Randomly generated with sufficient entropy
- Rotated periodically
- Only shared with authorized administrators

## Testing

### Test Script

A test script is provided at `scripts/test-notifications.js` to test the notification system:

```bash
# Send test notifications (both user-specific and global)
node scripts/test-notifications.js --send

# Test admin API functions
node scripts/test-notifications.js --admin

# Run all tests
node scripts/test-notifications.js
```

### Manual Testing

To manually test the notification system:

1. Start the development server
2. Open the application in multiple browser windows/tabs
3. Send global notifications using the webhook API
4. Verify that all clients receive the notifications
5. Test the admin panel by accessing `/admin/notifications`
6. Use the admin API key to delete global notifications
7. Verify that global notifications are removed for all users
