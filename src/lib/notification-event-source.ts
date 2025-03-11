/**
 * Singleton module for managing a persistent EventSource connection
 * This ensures we have only one connection across the entire application
 */

// Store the EventSource instance
let eventSourceInstance: EventSource | null = null

// Track if we're connected
let isConnected = false

// Store event listeners
type EventListenerMap = {
  [eventName: string]: Set<(event: MessageEvent) => void>
}
const eventListeners: EventListenerMap = {
  notification: new Set(),
  connected: new Set(),
}

/**
 * Get or create the EventSource connection
 */
export function getEventSource(): EventSource {
  if (!eventSourceInstance) {
    console.log("Creating new EventSource connection...")
    eventSourceInstance = new EventSource(`/api/notifications/events`)

    // Set up connection event handlers
    eventSourceInstance.onopen = () => {
      console.log("EventSource connection established")
      isConnected = true
    }

    eventSourceInstance.onerror = error => {
      console.error("EventSource error:", error)
      // If connection is closed, mark as disconnected
      if (eventSourceInstance?.readyState === EventSource.CLOSED) {
        isConnected = false
      }
    }

    // Set up event listeners for each event type
    Object.keys(eventListeners).forEach(eventName => {
      eventSourceInstance!.addEventListener(eventName, event => {
        // Forward the event to all registered listeners
        eventListeners[eventName].forEach(listener => {
          try {
            listener(event)
          } catch (error) {
            console.error(`Error in ${eventName} event listener:`, error)
          }
        })
      })
    })

    // Close the connection when the window is unloaded
    window.addEventListener(
      "beforeunload",
      () => {
        closeEventSource()
      },
      { once: true }
    )
  }

  return eventSourceInstance
}

/**
 * Add an event listener to the EventSource
 */
export function addEventListener(
  eventName: string,
  callback: (event: MessageEvent) => void
): () => void {
  // Create the event listener set if it doesn't exist
  if (!eventListeners[eventName]) {
    eventListeners[eventName] = new Set()
  }

  // Add the callback to the set
  eventListeners[eventName].add(callback)

  // Ensure the EventSource is created
  getEventSource()

  // Return a function to remove the listener
  return () => {
    removeEventListener(eventName, callback)
  }
}

/**
 * Remove an event listener from the EventSource
 */
export function removeEventListener(
  eventName: string,
  callback: (event: MessageEvent) => void
): void {
  if (eventListeners[eventName]) {
    eventListeners[eventName].delete(callback)
  }
}

/**
 * Close the EventSource connection
 */
export function closeEventSource(): void {
  if (eventSourceInstance) {
    console.log("Closing EventSource connection...")
    eventSourceInstance.close()
    eventSourceInstance = null
    isConnected = false

    // Clear all event listeners
    Object.keys(eventListeners).forEach(eventName => {
      eventListeners[eventName].clear()
    })
  }
}

/**
 * Check if the EventSource is connected
 */
export function isEventSourceConnected(): boolean {
  return isConnected && eventSourceInstance?.readyState === EventSource.OPEN
}

/**
 * Reconnect the EventSource if it's disconnected
 * @returns true if reconnected, false if already connected
 */
export function reconnectEventSource(): boolean {
  if (
    eventSourceInstance &&
    eventSourceInstance.readyState === EventSource.OPEN
  ) {
    console.log("EventSource already connected")
    return false
  }

  // Close existing connection if it's in a bad state
  if (eventSourceInstance) {
    console.log(
      "Closing existing EventSource connection before reconnecting..."
    )
    eventSourceInstance.close()
    eventSourceInstance = null
  }

  // Create a new connection
  getEventSource()
  return true
}

/**
 * Check the connection status and reconnect if needed
 * This can be called periodically to ensure the connection is maintained
 */
export function checkAndReconnectEventSource(): void {
  if (
    !eventSourceInstance ||
    eventSourceInstance.readyState !== EventSource.OPEN
  ) {
    console.log("EventSource disconnected, attempting to reconnect...")
    reconnectEventSource()
  }
}
