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

let config

// Serve static files from the React frontend
app.use(express.static(path.join(__dirname, './front')));

if (!fs.existsSync(configFile)) {
    config = { PORT: 5000 }
    console.error(`CONF_FILE env variable is set to ${configFile}, but that file does not exist`)
    fs.copyFileSync(path.join(__dirname, './front/misconfigured.html'), path.join(__dirname, './front/index.html'))
}
else {
    config = require(configFile)
    app.use(eventsRouter)
}
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, './front/index.html'));
});

const port = config.PORT || 5000;

// Start the server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
