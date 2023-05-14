import express from 'express';

export const eventsRouter = express.Router();

let events: Event[] = []
let eventsWs: WebSocket|null = null

eventsRouter.get('/api/events', (req , res) => {
  res.json(events)
});

eventsRouter.post('/api/events', (req , res) => {
  const event = req.body
  console.log(event)
  event.date = new Date()
  events.push(event)
  event.id = events.length
  eventsWs?.send(JSON.stringify( event))

  res.json({success: true, event: event})
})

eventsRouter.ws('/socket', (ws, req) => {
  console.log(`Websocket connection established`)

  // @ts-ignore
  eventsWs = ws
  ws.on('message', (message) => {
    // we don't expect any messages from the client, but if we get them, log them
    console.log(message)
  });

  // Clean up WebSocket connection on disconnect
  ws.on('close', () => {
    eventsWs = null
  });
});
