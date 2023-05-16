import express from 'express';
// @ts-ignore
import path from 'path';
import expressWs from 'express-ws';
const app = express();

// We must attach expressWS before importing routes
expressWs(app);
import {eventsRouter} from './events';

app.use(express.json());

const port = process.env.PORT || 5000;

// Serve static files from the React frontend
app.use(express.static(path.join(__dirname, './front')));
app.use(eventsRouter)


app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, './front/index.html'));
});


// Start the server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
