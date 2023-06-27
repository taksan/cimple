import fs from 'fs';
import path from 'path';

function init() {
    const configFile = process.env.CONF_FILE

    if (configFile === undefined) 
        throw new Error('CONF_FILE env variable is not set')

    if (!fs.existsSync(configFile)) {
        console.error(`CONF_FILE env variable is set to ${configFile}, but that file does not exist`)
        fs.writeFileSync(path.join(__dirname, './front/index.html'), "<h1>Misconfiguration detected, check logs</h1>")
        return { PORT: 5000, failed: true }
    }
    return require(configFile)
}

export const config = init()