import express from 'express';
// @ts-ignore
import path from 'path';
import expressWs from 'express-ws';
import cors from 'cors';

const app = express();
// we must attach expressWS before importing routes
expressWs(app);
app.use(cors());
app.use(express.json());

import { eventsRouter } from './events';

const port = process.env.PORT || 5000;

// Serve static files from the React frontend
app.use(express.static(path.join(__dirname, '../../front/build')));
app.use(eventsRouter)


app.get('*', (req, res) => {
  console.log(req.url)
  res.sendFile(path.join(__dirname, '../../front/build/index.html'));
});


// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
