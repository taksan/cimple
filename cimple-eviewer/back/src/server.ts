import express from 'express';
// @ts-ignore
import path from 'path';
import expressWs from 'express-ws';
import {config} from "./config";
const app = express();

// We must attach expressWS before importing routes
expressWs(app);
import {eventsRouter} from './events';

app.use(express.json());

if (!config.failed)
    app.use(eventsRouter)
else {
    app.get('/health', (req , res) => {
          res.status(500).json({"health": "failed"})
    });
}


// Serve static files from the React frontend
app.use(express.static(path.join(__dirname, './front')));


app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, './front/index.html'));
});

const port = config.PORT || 5000;

// Start the server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
