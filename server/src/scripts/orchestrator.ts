import * as nsd from "../../external/NetscriptDefinitions";

/**
 * This file cannot depend on other scripts since it will be the first one deployed
 */
export const main = async (ns: nsd.NS) => {
  const scriptsPath = 'http://localhost:8088/scripts';
  const scriptsFile = 'scripts.json.txt';
  
  await ns.wget(scriptsPath, scriptsFile);  // TODO: For some reason this fails to write to the file
  const scriptsRaw = ns.read(scriptsFile);
  ns.tprint(scriptsRaw);
  const rawScripts = JSON.parse(scriptsRaw) as string[];
  const scripts = rawScripts.map(s => `./${s}`);
  for (const script of scripts) {
    const url = `http://localhost:8088/scripts/${script}`;

    await ns.wget(url, script);
  }
};
