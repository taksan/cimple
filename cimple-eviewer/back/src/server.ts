import express from 'express';
// @ts-ignore
import path from 'path';
import expressWs from 'express-ws';
import fs from 'fs';
const app = express();

// We must attach expressWS before importing routes
expressWs(app);
import {eventsRouter} from './events';

app.use(express.json());

const configFile = process.env.CONF_FILE

if (configFile === undefined) {
    throw new Error('CONF_FILE env variable is not set')
}

if (!fs.existsSync(configFile)) {
    throw new Error(`CONF_FILE env variable is set to ${configFile} but file does not exist`)
}

const config = require(configFile)
const port = config.PORT || 5000;

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
