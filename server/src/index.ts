import express from "express";
// import path from "path";

const webServer = express();
const port = 8088;

webServer.get("/", (req, res) => {
  const setupScriptBody = "export const main = async (ns) => { ns.tprint('Downloaded!') };";

  res.send(setupScriptBody);
});

// start the express server
webServer.listen(port, () => {
  console.log(`server started at http://localhost:${port}`);
});
