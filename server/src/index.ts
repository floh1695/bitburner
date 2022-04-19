import express from 'express';
import * as fs from 'fs';

const webServer = express();
const port = 8088;


webServer.get('/', (req, res) => {
  const file = './dist/scripts/orchestrator.js';
  const contents = fs.readFileSync(file);

  res.send(contents);
});

webServer.get('/scripts', (req, res) => {
  // TODO: Needs to be made recursive and a helper module for file access might be nice
  const deployDirectory = './dist/scripts/deploy';
  const files = fs.readdirSync(deployDirectory)
    .filter(file => file.endsWith('.js'));

  res.json(files);
});

webServer.get('/scripts/:scriptPath([^/]*)', (req, res) => {
  const scriptPath = './dist/scripts/deploy/' + req.params.scriptPath;
  const contents = fs.readFileSync(scriptPath);

  res.send(contents);
});


webServer.listen(port, () => {
  console.log(`server started at http://localhost:${port}`);
});
