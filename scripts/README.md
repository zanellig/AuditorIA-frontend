# Notification System Testing

This directory contains scripts to test the notification system.

## Test Notifications Script

The `test-notifications.js` script sends multiple test notifications to the webhook endpoint with a delay between each notification. This is useful for testing the real-time notification system and toast notifications.

### Setup

1. Install dependencies:

```bash
cd scripts
npm install
```

### Running the Test

1. Make sure your Next.js application is running on auditoria.linksolution.com.ar
2. Run the test script:

```bash
npm test
```

This will send 5 test notifications with a 2-second delay between each one.

## Testing with cURL

You can also test individual notifications using cURL:

```bash
curl -X POST http://auditoria.linksolution.com.ar/api/notifications/webhook \
  -H "Content-Type: application/json" \
  -d '{"text":"Test notification from cURL","task":{"identifier":"test-id","file_name":"test.mp3"}}'
```

## Expected Behavior

When a notification is sent:

1. It should be stored in Redis
2. A real-time event should be emitted to connected clients
3. The notification should appear in the notification dropdown
4. A toast notification should appear
5. The notification bell should show a red dot for unread notifications
