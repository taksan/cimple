import express from 'express';
// @ts-ignore
import path from 'path';
import expressWs from 'express-ws';
import {config} from "./config";
import fs from 'fs';
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

if (!process.env.FRONT_URL) 
    throw new Error("FRONT_URL must be set")

try {
  const files = fs.readdirSync(path.join(__dirname, "./front/static/js"));

  const matchingFile = files.find(file => /^main\..*$/.test(file));

  if (matchingFile) {
    const fullFilePath = path.join(__dirname, "./front/static/js/" + matchingFile)
    const fileContent = fs.readFileSync(fullFilePath, 'utf8');

    const modifiedContent = fileContent.replace("{{FRONT_URL}}", process.env.FRONT_URL || "");
    fs.writeFileSync(fullFilePath, modifiedContent, 'utf8');
  }
} catch (err) {
  console.error('Error reading directory:', err);
}

// Start the server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
