# CImple Event Viewer Backend

This is the backend, a very simple express application. The event history is only in
memory, therefore the events are lost when the application is restarted.

The backend implements two basic endpoints:

GET `/api/events` - fetches the list of events. The payload follows the following format:

```
[
    { 
        id: number,
        date: string, // received date in iso format
        content: string
    }
]
```

POST `/api/events` - creates and event. The payload is just the following. No need for id 
and date. Creating and event will also broadcast the event to the clients connected.

```
{ 
    content: string
}
```

WEBSOCKET `/socket` - endpoint for the frontend to connect to the backend via
    websocket to receive created events
